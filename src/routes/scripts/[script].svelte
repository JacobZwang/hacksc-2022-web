<script lang="ts">
	const text =
		'Incididunt consectetur sunt exercitation adipisicing nisi dolore enim aliqua dolore exercitation. Minim ipsum amet adipisicing ut proident irure fugiat minim in aute veniam in exercitation. Reprehenderit pariatur cupidatat quis ex. Id esse adipisicing id occaecat excepteur veniam reprehenderit qui non.';

	let activeWordNumber = 5;
</script>

<div>
	{#each text.split(' ') as word, i}
		<span class:active={i === activeWordNumber}>
			{word}
		</span>
	{/each}
</div>

<style>
	span {
		color: rgb(104, 104, 104);
		font-size: 30pt;
		font-family: sans-serif;
	}

	.active {
		color: black;
	}
</style>
