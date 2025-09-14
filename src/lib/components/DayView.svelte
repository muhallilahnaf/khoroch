<script>
	import {
		getUserId,
		loadCategories,
		supabase,
		loadTransactionsByDate,
		loadDescriptions
	} from '$lib/supabaseClient';
	import { onMount } from 'svelte';

	let { selectedDate } = $props();

	// states
	let user_id = $state(null);
	let dailyIncome = $state(0);
	let dailyExpense = $state(0);
	let transactions = $state([]);
	let tr_type = $state('expense');
	let description = $state('');
	let amount = $state('');
	let category_id = $state('');
	let matches = $state([]);
	let selectedMatch = $state('');
	let categories = $state([]);
	let autocompleteData = $state([]);

	// load transactions and userid on first load
	onMount(async () => {
		transactions = await loadTransactionsByDate(selectedDate);
		user_id = await getUserId();
		categories = await loadCategories();
		autocompleteData = await loadDescriptions();
		console.log(categories);
		console.log(autocompleteData);
	});

	// update daily totals when transaction changes
	const updateDailyTotals = () => {
		let totalIncome = 0;
		let totalExpense = 0;
		transactions.forEach((e) => {
			if (e.tr_type === 'income') totalIncome = totalIncome + e.amount;
			if (e.tr_type === 'expense') totalExpense = totalExpense + e.amount;
		});
		dailyIncome = totalIncome;
		dailyExpense = totalExpense;
	};

	// update when date changes
	$effect(async () => {
		transactions = await loadTransactionsByDate(selectedDate);
		updateDailyTotals();
	});

	// update when selected match changes
	$effect(() => {
		if (selectedMatch && selectedMatch !== '') {
			const match = autocompleteData.find((item) => item.category_id === selectedMatch);
			category_id = match.category_id;
			description = match.description;
		}
	});

	// add a new transaction to db and update state
	const addTransaction = async (e) => {
		e.preventDefault();
		console.log(category_id);
		
		if (!description || !amount) return;
		const { data, error } = await supabase
			.from('transactions')
			.insert([{ tr_type, category_id, description, amount, date: selectedDate, user_id }])
			.select();
		if (!error && data) {
			transactions = [data[0], ...transactions];
			description = '';
			amount = '';
		}
		if (error) console.log(error);
		updateDailyTotals();
	};

	// delete a transaction from db and update state
	const deleteTransaction = async (id) => {
		const { error } = await supabase.from('transactions').delete().eq('id', id);
		if (!error) {
			transactions = transactions.filter((t) => t.id !== id);
		}
		if (error) console.log(error);
		updateDailyTotals();
	};

	// autocomplete description and category
	const autocomplete = () => {
		console.log('autocomplete');
		matches = autocompleteData.filter((item) => item.description.includes(description));
		console.log(matches);
	};
</script>

<!-- daily totals -->
<div class="p-4 border rounded mb-4">
	<h3 class="font-bold">Today's Totals</h3>
	<p>Income: <span class="text-green-600">{dailyIncome}</span></p>
	<p>Expense: <span class="text-red-600">{dailyExpense}</span></p>
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
					<span class={t.tr_type === 'income' ? 'text-green-600' : 'text-red-600'}>
						{t.amount}
					</span>
					<button type="button" onclick={() => deleteTransaction(t.id)}>Delete</button>
				</div>
			</div>
		{/each}
	{:else}
		<p class="text-gray-500">No records yet</p>
	{/if}
</div>

<!-- Input Form -->
<form class="p-4 border-t flex flex-col gap-2" onsubmit={addTransaction}>
	<select bind:value={category_id} class="p-1 border rounded">
		{#each categories as c}
			<option value={c.category_id}>{c.category_name}</option>
		{/each}
	</select>
	<select bind:value={tr_type} class="p-1 border rounded">
		<option value="income">Income</option>
		<option value="expense">Expense</option>
	</select>
	<input
		placeholder="description"
		bind:value={description}
		oninput={autocomplete}
		class="p-1 border rounded"
	/>
	<select bind:value={selectedMatch} class="p-1 border rounded">
		{#each matches as m}
			<option value={m.category_id}>{m.description}</option>
		{/each}
	</select>	
	<input type="number" placeholder="amount" bind:value={amount} class="p-1 border rounded" />
	<button type="submit" class="bg-blue-500 text-white p-1 rounded"> Add </button>
</form>
