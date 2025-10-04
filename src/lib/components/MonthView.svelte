<script>
	import { supabase, loadTransactionsByMonth } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { Table, Progress, Input, InputGroup, InputGroupText, Button } from '@sveltestrap/sveltestrap';
	import Chart from '$lib/components/Chart.svelte';
	import { getSumCategoryForMonth } from '$lib/aggregations';
	import { months, monthsFull } from '$lib/helpers';
	import AirDatepicker from 'air-datepicker';
	import 'air-datepicker/air-datepicker.css';
	import localeEn from 'air-datepicker/locale/en';

	// month picker object
	let pickerObj;

	const getCurrentMonthYear = () => {
		const today = new Date()
		const year = today.getFullYear()
		const month = today.getMonth() + 1
		return `${year}-${month}`
	}

	// states
	let selectedMonthYear = $state(getCurrentMonthYear()); // current month as default
	let monthNumber = $derived(parseInt(selectedMonthYear.split('-')[1]))
	let yearNumber = $derived(parseInt(selectedMonthYear.split('-')[0]))
	let user_id = $state(null);
	let monthlyIncome = $state(0);
	let monthlyExpense = $state(0);
	let monthlyRemaining = $state(0);
	let dailyAvgExpense = $state('0');
	let dailyAvgRemaining = $state('0');
	let transactions = $state([]);
	let dataSumCategory = $state([]);
	let chartData = $derived(getChartData(dataSumCategory));
	let monthName = $derived(monthsFull[monthNumber-1]);

	

	onMount(() => {
		pickerObj = new AirDatepicker('#picker', {
			locale: localeEn,
			view: 'months',
			minView: 'months',
			dateFormat: 'yyyy-MM',
			onSelect: ({date, formattedDate}) => {
				console.log(formattedDate)
				selectedMonthYear = formattedDate;
				if (pickerObj.visible) pickerObj.hide()
			}
		});
	})

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
		if (monthlyIncome >= monthlyExpense) {
			monthlyRemaining = monthlyIncome - monthlyExpense;
		}
		const today = new Date();
		const currentMonth = today.getMonth();
		const lastDay = new Date(today.getFullYear(), currentMonth + 1, 0).getDate();
		if (monthNumber-1 === currentMonth) {
			const currentDay = today.getDate();
			dailyAvgExpense = expenseCount !== 0 ? (totalExpense / currentDay).toFixed(0) : '0';
			const daysRemaining = lastDay - currentDay;
			dailyAvgRemaining = daysRemaining !== 0 ? (monthlyRemaining / daysRemaining).toFixed(0) : '0';
		} else if (monthNumber-1 < currentMonth) {
			dailyAvgExpense = expenseCount !== 0 ? (totalExpense / lastDay).toFixed(0) : '0';
		}
	};

	// update when date changes
	$effect(async () => {
		transactions = await loadTransactionsByMonth(monthNumber, yearNumber);
		updateMonthlyTotals();
		dataSumCategory = await getSumCategoryForMonth(monthNumber, yearNumber);
	});

	const getChartData = (data) => {		
		return {
			labels: data.map((r) => r.category),
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
	};

	// go to previous or next month
	const gotoPrevNext = (direction) => {
		const date = new Date(selectedMonthYear);
		const targetDate = new Date(selectedMonthYear);
		if (direction === 'prev') {
			targetDate.setMonth(date.getMonth() - 1);
		}
		if (direction === 'next') {
			targetDate.setMonth(date.getMonth() + 1);
		}
		pickerObj.selectDate(targetDate);
		selectedMonthYear = `${targetDate.getFullYear()}-${targetDate.getMonth()+1}`;
	};
</script>


<!-- month picker -->
<div class="hstack gap-2 my-2">
	<div>
		<Button bsSize="sm" outline onclick={() => gotoPrevNext('prev')}>«</Button>
	</div>
	<InputGroup>
		<InputGroupText style="width: 9rem">{monthName}</InputGroupText>
		<Input id="picker" type='text' bsSize="sm" readonly value={selectedMonthYear} />
	</InputGroup>
	<div>
		<Button bsSize="sm" outline onclick={() => gotoPrevNext('next')}>»</Button>
	</div>
</div>
 
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
		<Table borderless bsSize="sm">
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

	<div class="my-4 w-50">
		{#if dataSumCategory.length > 0}
			<Chart type="pie" data={chartData} options={chartOptions} width={50} />
		{/if}
	</div>
</div>

<style>
	.font-small {
		font-size: small;
	}
</style>