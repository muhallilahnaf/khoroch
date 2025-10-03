<script>
	import { supabase, fetchSession, getUserId, loadCategories } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import Authentication from '$lib/components/Authentication.svelte';
	import Header from '$lib/components/Header.svelte';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import { Container, Navbar, Form, Button, Input } from '@sveltestrap/sveltestrap';

	// states
	let session = $state(null);
	let user_id = $state(null);
	let category_name = $state('');
	let categories = $state([]);
	let message = $state('');

	// Listen for auth changes
	onMount(async () => {
		session = await fetchSession();
		user_id = await getUserId();
		categories = await loadCategories();
		supabase.auth.onAuthStateChange((_event, currentSession) => {
			session = currentSession;
		});
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

			<!-- Input Form -->
			<Form class="hstack gap-2 p-2" onsubmit={addCategory}>
				<Input placeholder="Category name" bind:value={category_name} bsSize="sm" />
				<Button type="submit" bsSize="sm" color="primary">Add</Button>
			</Form>
		{/if}
	</main>
</Container>
