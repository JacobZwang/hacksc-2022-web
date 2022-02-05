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
	import { onMount } from 'svelte';
	import temp from './_temp.txt?raw';

	// import temp from './_temp.txt?raw';
	enum ConnectionStatus {
		JoinedRoom,
		Connecting,
		Connected,
		Disconnected,
		Error
	}
	let connectionStatus = ConnectionStatus.Connecting;
	export let scriptId;

	// const client = io('http://localhost:420');
	// client.onAny(function (event, data) {
	// 	console.log('Data', event, data);
	// });

	let text;
	const client = io('http://localhost:420');
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
	client.on('joinRoom', function (data) {
		console.log('Joined room', data);
		text = data.text;
		connectionStatus = ConnectionStatus.JoinedRoom;

		softLines = findLineWraps();
	});

	//const text = temp;

	let activeWordNumber = 0;

	let textElement: HTMLDivElement;

	let softLines = [];

	let lineHeight = 60;

	function findLineWraps() {
		return Array.from(textElement.children).reduce(
			(lines, word, i) => {
				const lastLine = lines[lines.length - 1];
				const rect = word.getBoundingClientRect();
				const wordHeight = rect.bottom - rect.top;

				if (lastLine.top === word.getBoundingClientRect().top + window.scrollY) {
					lastLine.wordCount += 1;
					lastLine.lastWordIndex = i;
					// if (lastLine.lineHeight < wordHeight) {
					// 	lastLine.lineHeight = wordHeight;
					// }
				} else {
					lines.push({
						top: rect.top + window.scrollY,
						// bottom: rect.bottom + window.scrollY,
						bottom: rect.top + lineHeight,
						wordCount: 0, // ! word count is zero indexed!
						lastWordIndex: i,
						firstWordIndex: i,
						lineHeight: wordHeight
					});
				}

				return lines;
			},
			[
				{
					top: textElement.children[0].getBoundingClientRect().top + window.scrollY,
					// bottom: textElement.children[0].getBoundingClientRect().bottom + window.scrollY,
					bottom:
						textElement.children[0].getBoundingClientRect().top +
						window.scrollY +
						lineHeight,
					wordCount: -1, // first word is word 0
					lastWordIndex: 0,
					firstWordIndex: 0,
					lineHeight: 0
				}
			]
		);
	}
</script>

<svelte:window
	on:scroll={(e) => {
		// activeWordNumber = Math.floor((window.scrollY / (40 * 1.5)) * 7);
		const offset = softLines[0].top;
		const currentLine = softLines.find((line) => {
			// console.log(line, window.scrollY);
			return line.top >= window.scrollY + offset && line.bottom >= window.scrollY + offset;
		});

		activeWordNumber =
			currentLine.firstWordIndex +
			Math.floor(
				currentLine.wordCount *
					(1 - (currentLine.top - window.scrollY - offset) / lineHeight)
			);
		console.log(`${softLines.indexOf(currentLine)}:${activeWordNumber}`);
	}}
	on:resize={() => {
		softLines = findLineWraps();
	}}
/>

{#if connectionStatus === ConnectionStatus.JoinedRoom}
	<div bind:this={textElement} style:line-height={lineHeight + 'px'}>
		{#each text.split(' ') as word, i}
			<span
				class:active={i === activeWordNumber}
				class:word-before-wrap={softLines.some((word) => word.lastWordIndex === i)}
			>
				{word}
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
		padding-top: 50vh;
	}

	span {
		color: rgb(175, 175, 175);
		font-size: 40px !important;
		font-family: sans-serif;
	}

	.active {
		color: black;
	}

	.active::after {
		position: absolute;
		content: '';
		width: 100vw;
		height: 2px;
		background-color: brown;
		left: 0;
	}

	.word-before-wrap {
		position: relative;
	}

	.word-before-wrap::before {
		position: absolute;
		content: '|';
		color: blue;
		right: 0;
		margin-right: -5px;
	}
</style>
