<script lang="ts" context="module">
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';

	export async function load({ params }: LoadInput): Promise<LoadOutput> {
		return {
			props: {
				scriptId: params.script
			}
		};
	}
</script>

<script lang="ts">
	import { io } from 'socket.io-client';
	import { onMount, tick } from 'svelte';
	import { findLineWraps, WrappedLine } from './_lines';

	enum ConnectionStatus {
		JoinedRoom,
		Connecting,
		Connected,
		Disconnected,
		Error
	}

	let connectionStatus = ConnectionStatus.Connecting;
	export let scriptId;

	let client;

	let activeWordNumber = 0;
	let textElement: HTMLDivElement;
	let softLines: WrappedLine[] = [];
	let lineHeight = 60;
	let text;

	let debugUI = false;

	onMount(() => {
		client = io('http://localhost:4200');

		client.on('connect', function () {
			console.log('Connected');
			client.emit('joinRoom', scriptId);
			connectionStatus = ConnectionStatus.Connected;
		});

		client.on('disconnect', function () {
			console.log('Disconnected');
			connectionStatus = ConnectionStatus.Disconnected;
		});

		client.on('connect_error', function (error) {
			console.log('Error', error);
			connectionStatus = ConnectionStatus.Error;
		});

		client.on('joinRoom', async function (data) {
			console.log('Joined room', data);
			text = data.text;
			connectionStatus = ConnectionStatus.JoinedRoom;
			await tick();
			softLines = findLineWraps(textElement, lineHeight);
		});
	});
</script>

<svelte:window
	on:scroll={(e) => {
		const offset = softLines[0]?.top ?? 0;
		const currentLine = softLines.find((line) => {
			return line.top >= window.scrollY + offset && line.bottom >= window.scrollY + offset;
		});

		if (currentLine?.firstWordIndex) {
			activeWordNumber =
				currentLine?.firstWordIndex +
				Math.floor(
					currentLine.wordCount *
						(1 - (currentLine.top - window.scrollY - offset + lineHeight) / lineHeight)
				);
		}
		console.log(`${softLines.indexOf(currentLine)}:${activeWordNumber}`);
	}}
	on:resize={() => {
		softLines = findLineWraps(textElement, lineHeight);
	}}
/>

{#if connectionStatus === ConnectionStatus.JoinedRoom}
	<div bind:this={textElement} style:line-height={lineHeight + 'px'}>
		{#each text.split(' ') as word, i}
			<span
				class:active={i === activeWordNumber}
				class:debugUI
				class:word-before-wrap={softLines.some((word) => word.lastWordIndex === i)}
			>
				<span style="color: blue;">{i}</span>{word}
			</span>
		{/each}
	</div>
{:else if connectionStatus === ConnectionStatus.Connected}
	<p>Joining Room #{scriptId}</p>
{:else if connectionStatus === ConnectionStatus.Connecting}
	<p>Connecting</p>
{:else if connectionStatus === ConnectionStatus.Disconnected}
	<p
		on:click={() => {
			client.connect();
		}}
	>
		Disconnected, retry?
	</p>
{:else if connectionStatus === ConnectionStatus.Error}
	<p>Error</p>
{/if}

<style>
	div {
		padding: 50vh 20pt;
		/* white-space: pre-line; */
	}

	span {
		color: rgb(175, 175, 175);
		font-size: 40px;
		font-family: 'Courier New', Courier, monospace;
	}

	.active {
		color: black;
	}

	.active.debugUI {
		position: relative;
	}

	.active::after.debugUI {
		position: absolute;
		content: '';
		width: 100vw;
		height: 2px;
		background-color: brown;
		left: 0;
	}

	.word-before-wrap.debugUI {
		position: relative;
	}

	.word-before-wrap::before.debugUI {
		position: absolute;
		content: '|';
		color: blue;
		right: 0;
		margin-right: -5px;
	}
</style>
