<script>
	import { supabase, loadTransactionsByMonth } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { Table } from '@sveltestrap/sveltestrap';
	import Chart from '$lib/components/Chart.svelte';
	import { getTransactionsByCategories } from '$lib/aggregations';

	let { selectedMonth } = $props();

	// states
	let user_id = $state(null);
	let monthlyIncome = $state(0);
	let monthlyExpense = $state(0);
	let monthlyRemaining = $state(0);
	let monthlyAvgExpense = $state('0');
	let transactions = $state([]);
	let dataSumCategories = $state([]);
	let chartData = $derived(getChartData(dataSumCategories));

	// load transactions on first load
	onMount(async () => {
		transactions = await loadTransactionsByMonth(selectedMonth);
		dataSumCategories = await getTransactionsByCategories();
	});

	// update monthly totals when transaction changes
	const updateMonthlyTotals = () => {
		let totalIncome = 0;
		let totalExpense = 0;
		let expenseCount = 0;
		transactions.forEach((t) => {
			if (t.type === 'income') totalIncome = totalIncome + t.total;
			if (t.type === 'expense') {
				totalExpense = totalExpense + t.total;
				expenseCount = expenseCount + 1;
			}
		});
		monthlyIncome = totalIncome;
		monthlyExpense = totalExpense;
		monthlyRemaining = monthlyIncome - monthlyExpense;
		monthlyAvgExpense = expenseCount !== 0 ? (totalExpense / expenseCount).toFixed(0) : '0';
	};

	// update when date changes
	$effect(async () => {
		transactions = await loadTransactionsByMonth(selectedMonth);
		updateMonthlyTotals();
	});

	const getChartData = (data) => {
		return {
			labels: data.map((r) => r.category_name),
			datasets: [
				{
					label: 'Yearly Total',
					data: data.map((r) => r.total)
				}
			]
		};
	};

	const chartOptions = {
		responsive: true,
		scales: {
			y: {
				beginAtZero: true
			}
		}
	};
</script>

<!-- monthly totals -->
<div class="mb-4 p-2 border">
	<p class="lead">This Month's Totals</p>
	<div class="hstack gap-3">
		<p class="m-0">Income: <span class="text-success">{monthlyIncome}</span></p>
		<p class="m-0">Expense: <span class="text-danger">{monthlyExpense}</span></p>
		<p class="m-0">Remaining: <span class="text-info">{monthlyRemaining}</span></p>
		<p class="m-0">Avg Expense: <span class="text-info">{monthlyAvgExpense}</span></p>
	</div>
</div>

<!-- Transactions List -->
<div class="overflow-y-auto mb-4">
	{#if transactions.length > 0}
		<Table borderless size="sm">
			<thead>
				<tr>
					<th>Date</th>
					<th>Type</th>
					<th>Total</th>
				</tr>
			</thead>
			<tbody>
				{#each transactions as t}
					<tr>
						<td>{t.day}</td>
						<td>{t.type}</td>
						<td class={t.type === 'income' ? 'text-success' : 'text-danger'}>
							{t.total}
						</td>
					</tr>
				{/each}
			</tbody>
		</Table>
	{:else}
		<p class="text-secondary">No records yet</p>
	{/if}

	<div class="my-4">
		<Chart type="pie" data={chartData} options={chartOptions} />
	</div>
</div>
