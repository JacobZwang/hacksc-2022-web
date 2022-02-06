<script lang="ts">
	import { io } from 'socket.io-client';
	const client = io('http://localhost:420');

    let scrollY;

    client.on('connect', () => {
        console.log('connected');
    });
    client.on('disconnect', () => {
        console.log('disconnected');
    });

    client.on('scroll', (data: any) => {
        console.log(data);
        scrollY = data;
    });

	client.onAny(function (event, data) {
		// console.log('Data', event, data);
	});

    

	// const fileInput = document.getElementById('input') as HTMLInputElement;
	// fileInput.onchange = () => {
	// 	const selectedFile = fileInput.files[0];
	// 	console.log(selectedFile);
	// };
</script>
<svelte:window bind:scrollY={scrollY} on:scroll={()=>{
    console.log("SCROLLL")
    client.emit('scroll', {
        scrollTop: window.scrollY,
    });
}}/>
<input type="file" id="input" />
<div style="height: 1000px"/>