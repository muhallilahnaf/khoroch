<script>
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';

	let { type, data, options } = $props();
	let canvas;

	onMount(() => {
        if (canvas) new Chart(canvas, {type, data, options});
    });
</script>

<div class="position-relative h-fit w-100">
    <canvas bind:this={canvas}></canvas>
</div>