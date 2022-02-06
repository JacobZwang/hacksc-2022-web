<script lang="ts" context="module">
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';

	export async function load({ params, url }: LoadInput): Promise<LoadOutput> {
		return {
			props: {
				scriptId: params.script,
				readOnly: url.searchParams.get('readOnly')
			}
		};
	}
</script>

<script lang="ts">
	import { browser } from '$app/env';

	import { io, Socket } from 'socket.io-client';
	import { onMount, tick } from 'svelte';
	import { findLineWraps, WrappedLine } from './_lines';
	import { ScriptPart, ScriptType } from './script';

	enum ConnectionStatus {
		JoinedRoom,
		Connecting,
		Connected,
		Disconnected,
		Error
	}

	let connectionStatus = ConnectionStatus.Connecting;
	export let scriptId;
	export let readOnly = false;
	if (readOnly && browser) {
		document.body.style.overflow = 'hidden';
	}
	let client: Socket;

	let activeWordNumber = 0;
	let activeSoftLine = 0;
	let textElement: HTMLDivElement;
	let softLines: WrappedLine[] = [];
	let lineHeight = 70;
	let script: ScriptPart[];
	let targetActiceWordNumber = 0;

	let debugUI = false;

	onMount(() => {
		client = io('https://hacksc-2022-socket-ry2a5ejena-wl.a.run.app');
		// client = io('localhost:4200');
		console.log('client', client);
		client.on('connect', function () {
			console.log('Connected');
			client.emit('joinRoom', { scriptId });
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
			script = data.script;
			connectionStatus = ConnectionStatus.JoinedRoom;
			await tick();

			softLines = findLineWraps(textElement, lineHeight);

			for (let i = 0, total = 0; i < script.length; i++) {
				total += script[i].Text.split(' ').length;
				console.log(total);
				script[i].lastWordIndex = total;
			}
			scroll();
		});

		client.on('active-word', (data) => {
			data && (targetActiceWordNumber = data);
		});
	});

	$: if (browser && targetActiceWordNumber !== undefined) {
		scroll();
	}

	$: if (browser && activeWordNumber !== undefined && client) {
		maybeEmitWordNumber();
	}

	function maybeEmitWordNumber() {
		if (!readOnly) {
			if (targetActiceWordNumber === undefined && activeWordNumber !== undefined) {
				client.emit('active-word', {
					word: activeWordNumber,
					roomId: scriptId
				});
			}
		}
	}

	function scroll() {
		if (targetActiceWordNumber === undefined) return;

		if (Math.abs(activeWordNumber - targetActiceWordNumber) < 6) {
			targetActiceWordNumber = undefined;
			return;
		}

		window.scrollTo(
			0,
			activeWordNumber < targetActiceWordNumber ? window.scrollY + 1 : window.scrollY - 1
		);

		if (activeWordNumber !== targetActiceWordNumber) {
			requestAnimationFrame(() => {
				scroll();
			});
		} else {
			targetActiceWordNumber = undefined;
		}
	}

	let interval;
	// let ignoreLastSpace;
</script>

<svelte:window
	on:mousedown|preventDefault={() => {
		interval = setInterval(() => {
			window.scrollTo(0, window.scrollY + 2);
		}, 40);
	}}
	on:keydown={(e) => {
		// if (e.key === ' ') {
		// 	e.preventDefault();
		// 	if (interval) {
		// 		ignoreLastSpace = true;
		// 		return;
		// 	}
		// 	interval = setInterval(() => {
		// 		window.scrollTo(0, window.scrollY + 2);
		// 	}, 40);
		// }
	}}
	on:mouseup={() => {
		clearInterval(interval);
	}}
	on:keyup={(e) => {
		// if (e.key === ' ') {
		// 	e.preventDefault();
		// 	if (!ignoreLastSpace) {
		// 		clearInterval(interval);
		// 		ignoreLastSpace = false;
		// 	}
		// }
	}}
	on:scroll={(e) => {
		const offset = softLines[0]?.top ?? 0;
		const currentLine = softLines.find((line) => {
			const half = (line.bottom - line.top) / 2;
			const middle = line.top + half;
			return Math.abs(window.scrollY + offset - middle) <= half;
		});

		if (currentLine?.firstWordIndex !== undefined) {
			const lineHeight = currentLine.bottom - currentLine.top;
			activeWordNumber = currentLine?.firstWordIndex; /* +
				Math.round(
					currentLine.wordCount *
						(1 - (currentLine.top - window.scrollY - offset + lineHeight) / lineHeight)
				); */
		}
		if (currentLine !== undefined) {
			activeSoftLine = currentLine;
		}

		// console.log(`${softLines.indexOf(currentLine)}:${activeWordNumber}`);
	}}
	on:resize={() => {
		softLines = findLineWraps(textElement, lineHeight);
	}}
/>

<div
	style="position: fixed; top: 5px; display: flex; padding-top: 8pt; padding-left:8pt; padding-right:8pt; left:-20px; background-color: #f7f7f7; border-radius: 4pt; transform: scale(0.75)"
	class="menu"
>
	<label class="switch">
		<input type="checkbox" bind:checked={debugUI} />
		<span class="slider round" />
	</label>
	<span style="font-size: 30px; margin-left: 12pt;"> Debug UI </span>
</div>

{#if connectionStatus === ConnectionStatus.JoinedRoom}
	<main bind:this={textElement} style:line-height={lineHeight + 'px'}>
		{#each script as part, i}
			<div
				class="reset"
				class:scene={part.Type === ScriptType['Scene Heading']}
				class:action={part.Type === ScriptType['Action']}
			/>
			{#if part.Type === ScriptType['Character']}
				<span class="charachter">
					{part.Text}
				</span>
			{:else}
				{#each part.Text.split(' ') as word, j}
					<span
						class:dialogue={part.Type === ScriptType['Dialogue']}
						class:scene={part.Type === ScriptType['Scene Heading']}
						class:action={part.Type === ScriptType['Action']}
						class:active-part={activeWordNumber <= script[i].lastWordIndex &&
							activeWordNumber > (script[i - 1]?.lastWordIndex ?? 0)}
						class:active-line={(() => {
							const index =
								(script[i - 1]?.lastWordIndex ?? 0) +
								j +
								i +
								1; /* i is to compensate for extra br element */

							return (
								index <= (activeSoftLine?.lastWordIndex ?? 0) &&
								index >= (activeSoftLine?.firstWordIndex ?? 0)
							);
						})()}
						class:debugUI
						class:active-word={activeWordNumber ===
							(script[i - 1]?.lastWordIndex ?? 0) + j + i + 1}
						class:word-before-wrap={softLines.some(
							(line) =>
								line.lastWordIndex ===
								(script[i - 1]?.lastWordIndex ?? 0) +
									j +
									i +
									1 /* i is to compensate for extra br element */
						)}
					>
						<span class="word-index" class:debugUI>{i}:{j}</span>{word + ' '}
					</span>
				{/each}
			{/if}
		{/each}
	</main>
	<!-- <div class="line-bar" /> -->
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
	/* :global(body) {
		overflow: hidden;
	} */

	.line-bar {
		position: fixed;
		height: 2px;
		background-color: aquamarine;
		width: 100vw;
		top: calc(50vh + 20pt);
	}

	main {
		padding: 50vh 20pt;
		word-wrap: unset;
		cursor: pointer;
		/* white-space: pre-line; */
	}

	span {
		color: rgb(175, 175, 175);
		font-size: 40px;
		font-family: 'Courier New', Courier, monospace;
		transition: color 200ms;
	}

	.active-word.debugUI {
		font-weight: bold !important;
	}

	.active-part {
		color: black;
		text-decoration-color: transparent;
		transition: 1000ms;
	}

	.active-line {
		/* color: rgb(0, 0, 0); */
		text-decoration: underline;
		text-decoration-color: rgb(42, 136, 165);
		/* font-weight: bold !important; */
		transition: 1000ms;
	}

	.word-index {
		display: none;
	}

	.word-index.debugUI {
		display: inline;
		font-size: 16px;
		color: blue;
	}

	/* .active::after {
		position: absolute;
		content: '';
		width: 100vw;
		height: 2px;
		background-color: brown;
		left: 0;
	} */

	.debugUI {
		background: transparent;
	}

	.word-before-wrap.debugUI {
		color: red;
	}

	span.action {
		font-weight: normal;
		font-style: italic;
	}

	span.scene {
		font-weight: bold;
	}

	div {
		height: 40pt;
	}

	.charachter {
		width: 100%;
		text-align: center;
		display: block;
	}

	@media only screen and (max-width: 500px) {
		.menu {
			display: none;
		}
	}

	/* .word-before-wrap::before {
		position: absolute;
		content: '|';
		color: blue;
		right: 0;
		margin-right: -5px;
	} */

	/* The switch - the box around the slider */
	.switch {
		position: relative;
		display: inline-block;
		width: 60px;
		height: 34px;
	}

	/* Hide default HTML checkbox */
	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	/* The slider */
	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #ccc;
		-webkit-transition: 0.2s;
		transition: 0.2s;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 26px;
		width: 26px;
		left: 4px;
		bottom: 4px;
		background-color: white;
		-webkit-transition: 0.2s;
		transition: 0.2s;
	}

	input:checked + .slider {
		background-color: #2196f3;
	}

	input:focus + .slider {
		box-shadow: 0 0 1px #2196f3;
	}

	input:checked + .slider:before {
		-webkit-transform: translateX(26px);
		-ms-transform: translateX(26px);
		transform: translateX(26px);
	}

	/* Rounded sliders */
	.slider.round {
		border-radius: 34px;
	}

	.slider.round:before {
		border-radius: 50%;
	}
</style>
