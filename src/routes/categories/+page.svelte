<script>
	import { 
        supabase, 
        fetchSession, 
        getUserId, 
        loadCategories, 
    } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import Authentication from '$lib/components/Authentication.svelte';

	// states
	let session = $state(null);
	let user_id = $state(null);
    let category_name = $state('');
	let categories = $state([]);

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
		if (!category_name) return;

		const { data, error } = await supabase
			.from('categories')
			.insert([{ category_name, user_id }])
			.select();
		if (!error && data) {
			categories = [data[0], ...categories];
			category_name = '';
		}
		if (error) console.log(error);
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

		<!-- Categories List -->
		<div class="flex-1 overflow-y-auto mb-4">
			{#if categories.length > 0}
				{#each categories as c}
					<div class="p-1 border-b flex justify-between">
						<div>
							<span>{c.category_name}</span>
						</div>
					</div>
				{/each}
			{:else}
				<p class="text-gray-500">No records yet</p>
			{/if}
		</div>

		<!-- Input Form -->
		<form class="p-4 border-t flex flex-col gap-2" onsubmit={addCategory}>			
			<input placeholder="category name" bind:value={category_name} class="p-1 border rounded" />
			<button type="submit" class="bg-blue-500 text-white p-1 rounded"> Add </button>
		</form>
	{/if}
</main>
