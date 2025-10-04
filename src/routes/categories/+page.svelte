<script>
	import { supabase, fetchSession, getUserId, loadCategories, getDescriptions } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import Authentication from '$lib/components/Authentication.svelte';
	import Header from '$lib/components/Header.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import { Container, Navbar, Form, Button, Input } from '@sveltestrap/sveltestrap';
	import { assignCategories } from '$lib/aggregations';

	// states
	let session = $state(null);
	let user_id = $state(null);
	let category_name = $state('');
	let categories = $state([]);
	let descriptionData = $state([]);
	let message = $state('');

	// Listen for auth changes
	onMount(async () => {
		session = await fetchSession();
		user_id = await getUserId();
		supabase.auth.onAuthStateChange((_event, currentSession) => {
			session = currentSession;
		});
		categories = await loadCategories();
		descriptionData = await getDescriptions();
	});

	// add a new category to db and update state
	async function addCategory(e) {
		e.preventDefault();
		message = '';
		if (!category_name) return;

		const { data, error } = await supabase
			.from('categories')
			.insert([{ category_name, user_id }])
			.select();
		if (!error && data) {
			categories = [data[0], ...categories];
			category_name = '';
		}
		if (error) {
			if (error.message.includes('duplicate')) {
				message = 'category already exists!';
			}
			console.log(error);
		}
	}

	// (re)assign categories to descriptions
	const updateCategories = async () => {
		let payload = [];
		const selects = document.querySelectorAll('#assign-cat select');
		selects.forEach(s => {
			payload.push({ category_id: s.value, description: s.name });
			console.log(`${s.name} => ${s.value}`);
		})
		const data = await assignCategories(payload);
		console.log(data);
		descriptionData = await getDescriptions();
	}
</script>

<Container>
	<main>
		<Header bind:value={session} />
		{#if !session}
			<Authentication />
		{:else}
			<p class="lead my-3">
				<b>Categories</b>
			</p>
			<!-- error message -->
			{#if message !== ''}
				<ErrorAlert {message} />
			{/if}
			<!-- Categories List -->
			<div class="overflow-y-auto mb-4">
				{#if categories.length > 0}
					{#each categories as c}
						<div class="mb-1">
							<div>
								<span>{c.category_name}</span>
							</div>
						</div>
					{/each}
				{:else}
					<p class="text-secondary">No records yet</p>
				{/if}
			</div>

			<!-- Assign categories to descriptions -->
			<div class="overflow-y-auto mb-4" id="assign-cat">
				{#if descriptionData.length > 0}
					{#each descriptionData as d}
						<div class="d-flex justify-content-between mb-1">
							<div>
								<span>{d.descript}</span>
							</div>
							<div>
								<Input bsSize="sm" type="select" name={d.descript}>
									{#each categories as c}
										<option value={c.id} selected={c.id == d.cat_id}>{c.category_name}</option>
									{/each}
								</Input>
							</div>
						</div>
					{/each}
					<Button bsSize="sm" onclick={updateCategories}>Update</Button>
				{:else}
					<p class="text-secondary">No descriptions yet</p>
				{/if}
			</div>

			<!-- Input Form -->
			<Form class="hstack gap-2 p-2" onsubmit={addCategory}>
				<Input placeholder="Category name" bind:value={category_name} bsSize="sm" />
				<Button type="submit" bsSize="sm" color="primary">Add</Button>
			</Form>
		{/if}
	</main>
</Container>
