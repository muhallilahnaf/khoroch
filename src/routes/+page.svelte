<script>
	import { supabase, fetchSession, loadCategories, getDescriptions } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import Authentication from '$lib/components/Authentication.svelte';
	import { range, months, getDateString, getDayName, getMonthName } from '$lib/helpers';
	import DayView from '$lib/components/DayView.svelte';
	import MonthView from '$lib/components/MonthView.svelte';
	import YearView from '$lib/components/YearView.svelte';
	import Header from '$lib/components/Header.svelte';
	import { Container, Button, Input, InputGroupText, InputGroup } from '@sveltestrap/sveltestrap';

	// View state
	let level = $state('day');
	let selectedDate = $state(getDateString()); // today as default
	let day = $derived(getDayName(selectedDate));
	let selectedMonth = $state(getMonthName()); // current month as default
	let selectedYear = $state(new Date().getFullYear()); // current year as default

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

	// go to previous or next date
	const gotoPrevNextDay = (direction) => {
		const date = new Date(selectedDate);
		const targetDate = new Date(selectedDate);
		if (direction === 'prev') {
			targetDate.setDate(date.getDate() - 1);
		}
		if (direction === 'next') {
			targetDate.setDate(date.getDate() + 1);
		}
		selectedDate = getDateString(targetDate);
	};
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

				<!-- date/month/year select -->
				<div>
					{#if level === 'day'}
						<div class="hstack gap-2">
							<div>
								<Button bsSize="sm" outline onclick={() => gotoPrevNextDay('prev')}>«</Button>
							</div>
							<InputGroup>
								<InputGroupText style="width: 9rem">{day}</InputGroupText>
								<Input type="date" bind:value={selectedDate} />
							</InputGroup>
							<div>
								<Button bsSize="sm" outline onclick={() => gotoPrevNextDay('next')}>»</Button>
							</div>
						</div>
					{:else if level === 'month'}
						<div class="hstack gap-2">
							{#each months as m}
								<Button
									outline
									bsSize="sm"
									color={selectedMonth === m ? 'primary' : 'secondary'}
									onclick={() => (selectedMonth = m)}
								>
									{m}
								</Button>
							{/each}
						</div>
					{:else if level === 'year'}
						<div class="hstack gap-2">
							{#each range(2020, 2030, 1) as y}
								<Button
									outline
									bsSize="sm"
									color={selectedYear === y ? 'primary' : 'secondary'}
									onclick={() => (selectedYear = y)}
								>
									{y}
								</Button>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			{#if level === 'day'}
				<DayView {selectedDate} {user_id} {categories} {descriptionData} />
			{:else if level === 'month'}
				<MonthView {selectedMonth} {selectedYear} />
			{:else if level === 'year'}
				<YearView {selectedYear} />
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
