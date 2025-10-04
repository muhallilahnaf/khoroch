<script>
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import { months, monthsFull } from '$lib/helpers';
	import { getSumCategoryForYear, getSumForYear } from '$lib/aggregations';
	import { Progress, Table, Input, Button } from '@sveltestrap/sveltestrap';
	import Chart from './Chart.svelte';
	import AirDatepicker from 'air-datepicker';
	import 'air-datepicker/air-datepicker.css';
	import localeEn from 'air-datepicker/locale/en';


	// year picker object
	let pickerObj;
	
	// states
	let selectedYear = $state(new Date().getFullYear()); // current year as default
	let user_id = $state(null);
	let yearlyIncome = $state(0);
	let yearlyExpense = $state(0);
	let monthlyAvgExpense = $state(0);
	let dataSumCategory = $state([]);
	let chartData = $derived(getChartData(dataSumCategory));
	let transactions = $state([]);

	// load yearly transactions
	const loadTransactionsByYear = async (selectedYear) => {
		const data = await getSumForYear(selectedYear);
		transactions = [...data];
	};

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

	onMount(() => {
		pickerObj = new AirDatepicker('#picker', {
			locale: localeEn,
			view: 'years',
			minView: 'years',
			dateFormat: 'yyyy',
			onSelect: ({date, formattedDate}) => {
				console.log(formattedDate)
				selectedYear = formattedDate;
				if (pickerObj.visible) pickerObj.hide()
			}
		});
	})

	// update when date changes
	$effect(async () => {
		await loadTransactionsByYear(selectedYear);
		updateYearlyTotals();
		dataSumCategory = await getSumCategoryForYear(selectedYear);
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

	// go to previous or next year
	const gotoPrevNext = (direction) => {
		let targetDate;
		if (direction === 'prev') {
			targetDate = new Date(`${selectedYear - 1}-01-01`);
			selectedYear = parseInt(selectedYear) - 1;
		}
		if (direction === 'next') {
			targetDate = new Date(`${selectedYear + 1}-01-01`);
			selectedYear = parseInt(selectedYear) + 1;
		}
		pickerObj.selectDate(targetDate);
	};

</script>


<!-- year picker -->
<div class="hstack gap-2 my-2">
	<div>
		<Button bsSize="sm" outline onclick={() => gotoPrevNext('prev')}>«</Button>
	</div>
	<Input id="picker" type='text' bsSize="sm" readonly value={selectedYear} />
	<div>
		<Button bsSize="sm" outline onclick={() => gotoPrevNext('next')}>»</Button>
	</div>
</div>

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
		<Table borderless bsSize="sm">
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
		{#if dataSumCategory.length > 0}
			<Chart type="pie" data={chartData} options={chartOptions} />
		{/if}
	</div>
</div>

<style>
	.font-small {
		font-size: small;
	}
</style>
