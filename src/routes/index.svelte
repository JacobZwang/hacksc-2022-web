<script lang="ts">
	import { browser } from '$app/env';
	import { goto } from '$app/navigation';
	import { io } from 'socket.io-client';

	import { onMount } from 'svelte';

	// import xml2json from 'xml2js';
	let files: FileList | null;

	$: {
		if (browser && files) {
			function readFileContent(file: File) {
				const reader = new FileReader();
				return new Promise((resolve, reject) => {
					reader.onload = (event) => resolve(event.target.result);
					reader.onerror = (error) => reject(error);
					reader.readAsText(file);
				});
			}
			if (files) {
				console.log('test', files.item(0));
			}
			const file = files[0];

			readFileContent(file).then((val) => {
				console.log('VALL', val);

				fetch('/scripts/parsedata', {
					method: 'POST', // or 'PUT'
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ data: val })
				}).then(async (data) => {
					var direct = file.name.split('.')[0];
					const json = await data.json();
					console.log(json);

					const client = io('https://hacksc-2022-socket-ry2a5ejena-wl.a.run.app');
					console.log('await', json, direct);
					client.emit('post', {
						script: json,
						scene: direct
					});
					goto('/scripts/' + direct);
				});
			});
		}
	}
</script>

<div class="mainContainer">
	<div class="main">
		<h1>Script<span style="color:gray">Us</span></h1>
		<p>Upload a Script</p>
		<input bind:files id="avatar" name="avatar" type="file" />
	</div>
</div>

<style>
    * {
        font-family: 'Courier New', Courier, monospace;

    }
	.mainContainer {
		height: 100vh;
		width: 100%;
		display: flex;

		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	#avatar {
		top: 150px;
		width: 150px;
		padding: 10px;
		border-radius: 5px;
		-webkit-border-radius: 5px;
		-moz-border-radius: 5px;
		border: 1px dashed #bbb;
		text-align: center;
		background-color: #ddd;
		cursor: pointer;
	}
	.main {
		text-align: center;
		border: 1px solid gray;
		border-radius: 10px;
		padding: 10px;
	}
</style>
