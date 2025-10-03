<script>
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
    import { months, monthsFull } from '$lib/helpers';
    import { getTransactionsByCategoryByMonth, getTransactionsByYear } from '$lib/aggregations';
	import { Progress, Table } from '@sveltestrap/sveltestrap';

	let { selectedYear } = $props();

	// states
    let user_id = $state(null);
	let yearlyIncome = $state(0);
	let yearlyExpense = $state(0);
	let monthlyAvgExpense = $state(0);
	let transactions = $state([]);

	// load yearly transactions
	const loadTransactionsByYear = async (selectedYear) => {
		const data = await getTransactionsByYear(selectedYear);
        transactions = [...data];
	}


	// load transactions on first load
	onMount(async () => {
		await loadTransactionsByYear(selectedYear);
	});

	// update yearly totals when transaction changes
	const updateYearlyTotals = () => {
		let totalIncome = 0;
		let totalExpense = 0;
		transactions.forEach((e) => {
			if (e.type === 'income') totalIncome = totalIncome + e.total;
			if (e.type === 'expense') totalExpense = totalExpense + e.total;
		});
		yearlyIncome = totalIncome;
		yearlyExpense = totalExpense;
		const today = new Date();
		const currentMonth = today.getMonth();
		monthlyAvgExpense = (yearlyExpense / (currentMonth + 1)).toFixed(0);
	};

    // update when date changes
	$effect(async () => {
		await loadTransactionsByYear(selectedYear);
        updateYearlyTotals();
	});
</script>

<!-- yearly totals -->
<div class="mb-4 p-2 border">
	<p class="lead">{selectedYear} Summary</p>
	<p class="m-0">Income: <span class="text-success">{yearlyIncome}</span></p>
	<Progress color="warning" value={yearlyExpense} max={yearlyIncome}>
		Expense: {yearlyExpense}
	</Progress>
	<div class="d-flex justify-content-end font-small">
		<p class="m-0">Avg. Expense: {monthlyAvgExpense}</p>
	</div>
</div>

<!-- Transactions List -->
<div class="flex-1 overflow-y-auto mb-4">
	{#if transactions.length > 0}
                <Table borderless size="sm">
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Type</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each transactions as t}
                        <tr>
                            <td>{monthsFull[t.month - 1]}</td>
                            <td>{t.type}</td>
                            <td 
                                class={t.type === 'income' ? 'text-success' : 'text-danger'}
                            >
                                {t.total}
                            </td>
                        </tr>
                        {/each}
                    </tbody>
                </Table>		
	{:else}
		<p class="text-secondary">No records yet</p>
	{/if}
</div>

<style>
	.font-small {
		font-size: small;
	}
</style>