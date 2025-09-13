<script>
	import { supabase, fetchSession } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import Authentication from '$lib/components/Authentication.svelte';
	import { range, months, getDateString, getDayName } from '$lib/helpers';
	import DayView from '$lib/components/DayView.svelte';
	import MonthView from '$lib/components/MonthView.svelte';
	import YearView from '$lib/components/YearView.svelte';

	// View state
	let level = $state('day');
	let selectedDate = $state(getDateString(new Date())); // today as default
	let day = $derived(getDayName(selectedDate));
	let selectedPeriod = $state('');

	// Auth state
	let session = $state(null);

	// Listen for auth changes
	onMount(async() => {
		session = await fetchSession();
		supabase.auth.onAuthStateChange((_event, currentSession) => {
			session = currentSession;
		});
	});

	// logout
	async function logout() {
		await supabase.auth.signOut();
		session = null;
	}

	// go to previous or next date
	const gotoPrevNextDay = (direction) => {
		const date = new Date(selectedDate);
		const targetDate = new Date(selectedDate);
		if (direction === 'prev') {
			targetDate.setDate(date.getDate() - 1)
		}
		if (direction === 'next') {
			targetDate.setDate(date.getDate() + 1)
		}
		selectedDate = getDateString(targetDate);
	}
</script>

<main class="p-4 flex flex-col h-screen">
	{#if !session}
		<Authentication />
	{:else}
		<!-- Navbar -->
		<div class="flex justify-between items-center mb-4">
			<a href="/" class="text-xl font-bold">Khoroch</a>
			<a href="/categories" class="bg-gray-300 px-3 py-1 rounded"> Categories </a>
			<a href="/recurring" class="bg-gray-300 px-3 py-1 rounded"> Recurring transactions </a>
			<button onclick={logout} class="bg-gray-300 px-3 py-1 rounded"> Logout </button>
		</div>

		<!-- view select -->
		<div class="mb-4">
			<select bind:value={level} class="p-2 border rounded">
				<option value="day">Day</option>
				<option value="month">Month</option>
				<option value="year">Year</option>
			</select>
		</div>

		<!-- date/period select -->
		<div class="flex gap-2 overflow-x-auto mb-4">
			{#if level === 'day'}
				<div class="px-3 py-1 b-1 flex justify-between">
					<div>
						<button type="button" class="p-1" onclick={() => gotoPrevNextDay('prev')}>«</button>
					</div>
					<div>
						<label for="datepicker">{day}</label>
						<input type="date" id="datepicker" bind:value={selectedDate} />
					</div>
					<div>
						<button type="button" class="p-1" onclick={() => gotoPrevNextDay('next')}>»</button>
					</div>
				</div>
			{:else if level === 'month'}
				{#each months as m}
					<button
						class="px-3 py-1 rounded border whitespace-nowrap {selectedPeriod === m
							? 'bg-blue-500 text-white'
							: ''}"
						onclick={() => (selectedPeriod = m)}
					>
						{m}
					</button>
				{/each}
			{:else if level === 'year'}
				{#each range(2000, 2050, 1) as y}
					<button
						class="px-3 py-1 rounded border whitespace-nowrap {selectedPeriod === y
							? 'bg-blue-500 text-white'
							: ''}"
						onclick={() => (selectedPeriod = y)}
					>
						{y}
					</button>
				{/each}
			{/if}
		</div>

		{#if level === 'day'}
			<DayView {selectedDate} />
		{:else if level === 'month'}
			<MonthView {selectedPeriod} />
		{:else if level === 'year'}
			<YearView {selectedPeriod} />
		{/if}
	{/if}
</main>

<style>
	main {
		font-family: sans-serif;
	}
</style>
