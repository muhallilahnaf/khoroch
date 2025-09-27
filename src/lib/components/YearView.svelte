<script>
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
    import { months } from '$lib/helpers';
    import { getTransactionsByMonth } from '$lib/aggregations';

	let { selectedYear } = $props();

	// states
    let user_id = $state(null);
	let monthlyIncome = $state(0);
	let monthlyExpense = $state(0);
	let transactions = $state([]);

	// load transactions
	async function loadTransactionsByMonth(month) {
        const monthNumber = months.indexOf(month) + 1;
		const data = await getTransactionsByMonth(monthNumber);
        transactions = [...data];
	}

	// load transactions on first load
	onMount(async () => {
		await loadTransactionsByMonth(selectedYear);
	});

	// update monthly totals when transaction changes
	const updateMonthlyTotals = () => {
		let totalIncome = 0;
		let totalExpense = 0;
		transactions.forEach((e) => {
			if (e.type === 'income') totalIncome = totalIncome + e.value;
			if (e.type === 'expense') totalExpense = totalExpense + e.value;
		});
		monthlyIncome = totalIncome;
		monthlyExpense = totalExpense;
	};

    // update when date changes
	$effect(async () => {
		await loadTransactionsByMonth(selectedYear);
        updateMonthlyTotals();
	});
</script>

<!-- monthly totals -->
<div class="p-4 border rounded mb-4">
	<h3 class="font-bold">This Month's Totals</h3>
	<p>Income: <span class="text-green-600">{monthlyIncome}</span></p>
	<p>Expense: <span class="text-red-600">{monthlyExpense}</span></p>
</div>

<!-- Transactions List -->
<div class="flex-1 overflow-y-auto mb-4">
	{#if transactions.length > 0}
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Text</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each transactions as t}
                        <tr>
                            <td>{t.date}</td>
                            <td>{t.type}</td>
                            <td>{t.text}</td>
                            <td 
                                class={t.type === 'income' ? 'text-green-600' : 'text-red-600'}
                            >
                                {t.value}
                            </td>
                        </tr>
                        {/each}
                    </tbody>
                </table>		
	{:else}
		<p class="text-gray-500">No records yet</p>
	{/if}
</div>
