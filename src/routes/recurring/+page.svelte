<script>
	import { supabase, fetchSession, getUserId } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import Authentication from '$lib/components/Authentication.svelte';
    import { getDateString } from '$lib/helpers';

	// states
	let session = $state(null);
	let user_id = $state(null);
	let transactions = $state([]);
	let tr_type = $state('expense');
	let description = $state('');
	let amount = $state('');
	let dayOfMonth = $state('');

    const today = new Date();

	// Listen for auth changes
	onMount(async () => {
		session = await fetchSession();
		user_id = await getUserId();
		await loadRecurringTransactions();
		supabase.auth.onAuthStateChange((_event, currentSession) => {
			session = currentSession;
		});
	});

	// load recurring transactions
	async function loadRecurringTransactions() {
		const { data, error } = await supabase
			.from('recurring_transactions')
			.select('*')
			.order('created_at', { ascending: true });
		if (!error && data) {
			transactions = data;
		}
		if (error) console.log(error);
	}

	// add a new recurring transaction to db and update state
	async function addRecurringTransaction(e) {
		e.preventDefault();
		if (!description || !amount || !dayOfMonth) return;

		const { data, error } = await supabase
			.from('recurring_transactions')
			.insert([{ tr_type, description, amount, day_of_month: dayOfMonth, user_id }])
			.select();

		if (!error && data) {
			transactions = [data[0], ...transactions];
			description = '';
			amount = '';
			dayOfMonth = '';
		}

		if (error) console.log(error);
	}

    // delete a recurring transaction from db and update state
	async function deleteRecurringTransaction(id) {        
		const { error } = await supabase
			.from('recurring_transactions')
			.delete()
            .eq('id', id);
		if (!error) {
			transactions = transactions.filter(t => t.id !== id);
		}        
        if (error) console.log(error);
	}

    // get next recurring transaction date
    const getNextRecurringDate = (day) => {
        const targetDate = new Date();
        targetDate.setDate(day);
        const todayDayOfMonth = today.getDate();
        if (todayDayOfMonth >= day) {
            targetDate.setMonth(today.getMonth() + 1)
        }
        return getDateString(targetDate);
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

		<!-- Transactions List -->
		<div class="flex-1 overflow-y-auto mb-4">
			{#if transactions.length > 0}
				{#each transactions as t}
					<div class="p-1 border-b flex justify-between">
						<div>
							<span>{t.tr_type === 'income' ? '+' : '-'} {t.description}</span>
						</div>
                        <div>
							<span>{getNextRecurringDate(t.day_of_month)}</span>
						</div>
						<div>
							<span class={t.tr_type === 'income' ? 'text-green-600' : 'text-red-600'}>
								{t.amount}
							</span>
							<button type="button" onclick={() => deleteRecurringTransaction(t.id)}>Delete</button>
						</div>
					</div>
				{/each}
			{:else}
				<p class="text-gray-500">No records yet</p>
			{/if}
		</div>

		<!-- Input Form -->
		<form class="p-4 border-t flex flex-col gap-2" onsubmit={addRecurringTransaction}>
			<select bind:value={tr_type} class="p-1 border rounded">
				<option value="income">Income</option>
				<option value="expense">Expense</option>
			</select>
			<input placeholder="description" bind:value={description} class="p-1 border rounded" />
			<input type="number" placeholder="amount" bind:value={amount} class="p-1 border rounded" />
			<input type="number" min="1" max="31" bind:value={dayOfMonth} class="p-1 border rounded" />
			<button type="submit" class="bg-blue-500 text-white p-1 rounded"> Add </button>
		</form>
	{/if}
</main>
