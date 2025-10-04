<script>
	import { supabase, fetchSession, loadCategories, getDescriptions } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import Authentication from '$lib/components/Authentication.svelte';
	import DayView from '$lib/components/DayView.svelte';
	import MonthView from '$lib/components/MonthView.svelte';
	import YearView from '$lib/components/YearView.svelte';
	import Header from '$lib/components/Header.svelte';
	import { Container, Input } from '@sveltestrap/sveltestrap';

	
	// View state
	let level = $state('day');
	
	// Auth state
	let session = $state(null);
	let user_id = $derived(session?.user?.id);
	let categories = $state([]);
	let descriptionData = $state([]);

	// Listen for auth changes
	onMount(async () => {
		session = await fetchSession();
		supabase.auth.onAuthStateChange((_event, currentSession) => {
			session = currentSession;
		});
		categories = await loadCategories();
		descriptionData = await getDescriptions();
	});
</script>

<Container>
	<main class="position-relative">
		<Header bind:value={session} />
		{#if !session}
			<Authentication />
		{:else}
			<!-- controls -->
			<div class="hstack gap-4 my-4">
				<!-- view select -->
				<div>
					<Input type="select" bind:value={level}>
						<option value="day">Day</option>
						<option value="month">Month</option>
						<option value="year">Year</option>
					</Input>
				</div>
			</div>

			{#if level === 'day'}
				<DayView {user_id} {categories} {descriptionData} />
			{:else if level === 'month'}
				<MonthView />
			{:else if level === 'year'}
				<YearView />
			{/if}
		{/if}
	</main>
</Container>

<style>
	main {
		font-family: sans-serif;
		height: 90vh;
	}
</style>
