<script>
	import { supabase, loadTransactionsByMonth } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { Table, Progress } from '@sveltestrap/sveltestrap';
	import Chart from '$lib/components/Chart.svelte';
	import { getTransactionsByCategories } from '$lib/aggregations';
	import { months, monthsFull } from '$lib/helpers';

	let { selectedMonth } = $props();

	// states
	let user_id = $state(null);
	let monthlyIncome = $state(0);
	let monthlyExpense = $state(0);
	let monthlyRemaining = $state(0);
	let dailyAvgExpense = $state('0');
	let dailyAvgRemaining = $state('0');
	let transactions = $state([]);
	let dataSumCategories = $state([]);
	let chartData = $derived(getChartData(dataSumCategories));
	let monthName = $derived(monthsFull[months.indexOf(selectedMonth)]);

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
		const today = new Date();
		const currentMonth = today.getMonth();
		const lastDay = new Date(today.getFullYear(), currentMonth + 1, 0).getDate();
		if (months.indexOf(selectedMonth) === currentMonth) {
			const currentDay = today.getDate();
			dailyAvgExpense = expenseCount !== 0 ? (totalExpense / currentDay).toFixed(0) : '0';
			const daysRemaining = lastDay - currentDay;
			dailyAvgRemaining = daysRemaining !== 0 ? (monthlyRemaining / daysRemaining).toFixed(0) : '0';
		} else if (months.indexOf(selectedMonth) < currentMonth) {
			dailyAvgExpense = expenseCount !== 0 ? (totalExpense / lastDay).toFixed(0) : '0';
		}
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
	<p class="lead">{monthName} Summary</p>
	<p class="m-0">Income: <span class="text-success">{monthlyIncome}</span></p>
	<Progress multi class="mb-2">
		<Progress 
			bar 
			color="warning" 
			value={monthlyExpense} 
			max={monthlyIncome}
		>
			Expense: {monthlyExpense}
		</Progress>
		<Progress 
			bar 
			color="info" 
			value={monthlyRemaining} 
			max={monthlyIncome}
		>
			Remaining: {monthlyRemaining}
		</Progress>
	</Progress>
	<div class="d-flex justify-content-between font-small">
		<p class="m-0">Avg. Expense: {dailyAvgExpense}</p>
		<p class="m-0">Avg. Remaining Balance: {dailyAvgRemaining}</p>
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

<style>
	.font-small {
		font-size: small;
	}
</style>