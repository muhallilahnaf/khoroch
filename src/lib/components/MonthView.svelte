<script>
	import { supabase, loadTransactionsByMonth } from '$lib/supabaseClient';
	import { onMount } from 'svelte';

	let { selectedPeriod } = $props();

	// states
    let user_id = $state(null);
	let monthlyIncome = $state(0);
	let monthlyExpense = $state(0);
	let transactions = $state([]);

	

	// load transactions on first load
	onMount(async () => {
		transactions = await loadTransactionsByMonth(selectedPeriod);
	});

	// update monthly totals when transaction changes
	const updateMonthlyTotals = () => {
		let totalIncome = 0;
		let totalExpense = 0;
		transactions.forEach((e) => {
			if (e.type === 'income') totalIncome = totalIncome + e.total;
			if (e.type === 'expense') totalExpense = totalExpense + e.total;
		});
		monthlyIncome = totalIncome;
		monthlyExpense = totalExpense;
	};

    // update when date changes
	$effect(async () => {
		transactions = await loadTransactionsByMonth(selectedPeriod);
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
                            <th class="p-1">Date</th>
                            <th class="p-1">Type</th>
                            <th class="p-1">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each transactions as t}
                        <tr>
                            <td class="p-1">{t.day}</td>
                            <td class="p-1">{t.type}</td>
                            <td 
                                class={t.type === 'income' ? 'text-green-600 p-1' : 'text-red-600 p-1'}
                            >
                                {t.total}
                            </td>
                        </tr>
                        {/each}
                    </tbody>
                </table>		
	{:else}
		<p class="text-gray-500">No records yet</p>
	{/if}
</div>
