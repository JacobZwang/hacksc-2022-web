<script lang="ts">
	import { io } from 'socket.io-client';
	const client = io('http://localhost:420');
	client.onAny(function (event, data) {
		console.log('Data', event, data);
	});

	//const fileInput = document.getElementById('input') as HTMLInputElement;
	// fileInput.onchange = () => {
	// 	const selectedFile = fileInput.files[0];
	// 	console.log(selectedFile);
	// };
</script>

<input type="file" id="input" />
