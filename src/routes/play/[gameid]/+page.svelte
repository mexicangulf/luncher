<script lang="ts">

	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	onMount(() => {

		const script = document.createElement('script');

		script.type = 'module';
		script.src =
			`/download/${params.gameid}/assets/index-DgyPDBqo.js`;

		document.body.appendChild(script);

		return () => {
			script.remove();
		};

	});

</script>

<svelte:head>
	<link
		rel="stylesheet"
		href={`/download/${params.gameid}/assets/index-B0OB2M5n.css`}
	/>
    <link
        rel="stylesheet"
        href={`/download/${params.gameid}/style.css`}
    />
</svelte:head>

<div id="app"></div>