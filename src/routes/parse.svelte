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
					var direct = file.name.split(".")[0]
					const json = await data.json();
					console.log(json)

					const client = io('https://hacksc-2022-socket-ry2a5ejena-wl.a.run.app');
					console.log("await", json, direct)
					client.emit('post', {
						script: json,
						scene: direct
					});
					goto('/scripts/' + direct);
				}
				
				)
			});
		}
	}
</script>

<h1>Select a File</h1>
<input bind:files id="avatar" name="avatar" type="file" />
