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
	import temp from './_temp.txt?raw';
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
	client.on('joinRoom', function () {
		console.log('Joined room');
		connectionStatus = ConnectionStatus.JoinedRoom;
	});

	const text = temp;

	let activeWordNumber = 0;
</script>

<svelte:window
	on:scroll={(e) => {
		activeWordNumber = Math.floor(window.scrollY / (40 * 1.5));
		console.log(window.scrollY);
	}}
/>
{#if connectionStatus === ConnectionStatus.JoinedRoom}
	<div>
		{#each text.split(' ') as word, i}
			<span class:active={i === activeWordNumber}>
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
		line-height: 1.5;
		font-family: sans-serif;
	}

	.active {
		color: black;
	}
</style>
