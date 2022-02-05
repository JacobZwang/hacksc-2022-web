<script lang='ts'>
	// import xml2json from 'xml2js';
	let files;

	$: if (files) {
		console.log('test')
		var file = files[0]
		fetch('http://localhost:3000/scripts/parsedata', {
  			method: 'POST', // or 'PUT'
  			headers: {
    			'Content-Type': 'application/json',
  			},
 			body: JSON.stringify({data: file}),
		})
	}
</script>

<h1>{'Select a File'}</h1>
<input bind:files id="avatar" name="avatar" type="file" />
