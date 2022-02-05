<script lang="ts">
	import { io } from 'socket.io-client';
	import temp from './_temp.txt?raw';

	// const client = io('http://localhost:420');
	// client.onAny(function (event, data) {
	// 	console.log('Data', event, data);
	// });

	const text = temp;

	let activeWordNumber = 0;
</script>

<svelte:window
	on:scroll={(e) => {
		activeWordNumber = Math.floor(window.scrollY / (40 * 1.5));
		console.log(window.scrollY);
	}}
/>

<div>
	{#each text.split(' ') as word, i}
		<span class:active={i === activeWordNumber}>
			{word}
		</span>
	{/each}
</div>

<style>
	div {
		padding-top: 50vh;
	}

	span {
		color: rgb(175, 175, 175);
		font-size: 40px !important;
		line-height: 1.5;
		font-family: sans-serif;
	}

	.active {
		color: black;
	}
</style>
