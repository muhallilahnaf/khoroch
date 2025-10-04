<script>
	import {
		getUserId,
		loadCategories,
		supabase,
		loadTransactionsByDate,
		getDescriptions
	} from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import Svelecte from 'svelecte';
	import {
		Button,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader,
		Input,
		Form
	} from '@sveltestrap/sveltestrap';

	let { selectedDate, user_id, categories, descriptionData } = $props();

	// states
	let dailyIncome = $state(0);
	let dailyExpense = $state(0);
	let transactions = $state([]);
	let tr_type = $state('expense');
	let description = $state('');
	let amount = $state('');
	let selectedMatch = $derived(getMatch(description));
	let category_id = $derived(getCatId(selectedMatch));
	let autocompleteData = $derived(getAutocompleteData(descriptionData));
	let deleteTransactionText = $state('');
	let deleteTransactionId = $state(null);
	let deleteModalOpen = $state(false);

	// get category id from match
	const getCatId = (match) => {
		if (Array.isArray(match) && match.length > 0) {
			return match[0].cat_id;
		}
	};

	// get description list for autocomplete from description data
	const getAutocompleteData = (data) => data.map(d => d.descript);

	// get matching description and category id from autocomplete
	const getMatch = (descript) => {
		return descriptionData.filter(row => row.descript == descript);
	}

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

	// add a new transaction to db and update state
	const addTransaction = async (e) => {
		e.preventDefault();
		if (!description || !amount) return;
		const { data, error } = await supabase
			.from('transactions')
			.insert([
				{
					tr_type,
					category_id,
					description,
					amount,
					date: selectedDate,
					user_id,
					source: 'userInput'
				}
			])
			.select();
		if (!error && data) {
			transactions = [data[0], ...transactions];
			description = '';
			amount = '';
		}
		if (error) console.log(error);
		updateDailyTotals();
	};

	// open delete modal
	const openDeleteModal = (id) => {
		const match = transactions.find((t) => t.id === id);
		if (match) {
			deleteTransactionText = match.description;
			deleteTransactionId = id;
			deleteModalOpen = true;
		}
	};

	// delete a transaction from db and update state
	const deleteTransaction = async () => {
		const { error } = await supabase.from('transactions').delete().eq('id', deleteTransactionId);
		if (!error) {
			transactions = transactions.filter((t) => t.id !== deleteTransactionId);
		}
		if (error) console.log(error);
		deleteTransactionId = null;
		deleteTransactionText = '';
		deleteModalOpen = false;
		updateDailyTotals();
	};

</script>

<!-- daily totals -->
<div class="mb-4 p-2 border">
	<p class="lead">Today's Totals</p>
	<div class="hstack gap-3">
		<p class="m-0">Income: <span class="text-success">{dailyIncome}</span></p>
		<p class="m-0">Expense: <span class="text-danger">{dailyExpense}</span></p>
	</div>
</div>

<!-- Transactions List -->
<div class="overflow-y-auto mb-4">
	{#if transactions.length > 0}
		{#each transactions as t}
			<div class="hstack gap-3 mb-1">
				<span>{t.tr_type === 'income' ? '+' : '-'} {t.description}</span>
				<span class={t.tr_type === 'income' ? 'text-success ms-auto' : 'text-danger ms-auto'}>
					{t.amount}
				</span>
				<Button bsSize="sm" outline color="danger" onclick={() => openDeleteModal(t.id)}>Delete</Button>
			</div>
		{/each}
	{:else}
		<p class="text-secondary">No records yet</p>
	{/if}
</div>

<!-- Input Form -->
<div class="position-absolute top-100 start-50 translate-middle w-100 shadow">
	<Form class="p-2 border rounded" onsubmit={addTransaction}>
		<div class="hstack gap-2">
			<Svelecte
				name="svelecte"
				options={autocompleteData}
				bind:value={description}
				creatable={true}
				creatablePrefix=""
				allowEditing={true}
				keepCreated={false}
				required
				placeholder="Description"
			/>
		</div>
		<div class="hstack gap-2">
			<Input type="select" bind:value={tr_type} bsSize="sm">
				<option value="income">Income</option>
				<option value="expense" selected>Expense</option>
			</Input>
			<Input type="select" bind:value={category_id} bsSize="sm">
				<option disabled selected value="category">Category</option>
				{#each categories as c}
				<option value={c.id}>{c.category_name}</option>
				{/each}
			</Input>
			<Input type="number" bsSize="sm" placeholder="amount" bind:value={amount} required />
			<Button type="submit" bsSize="sm" color="primary">Add</Button>
		</div>
	</Form>
</div>

<!-- Delete Modal -->
<Modal isOpen={deleteModalOpen} bsSize="sm">
	<ModalHeader
		toggle={() => {deleteModalOpen = false;}}
	>
		Delete transaction
		</ModalHeader>
	<ModalBody>
		Are you sure you want to delete the transaction: {deleteTransactionText}?
	</ModalBody>
	<ModalFooter>
		<Button color="primary" onclick={deleteTransaction}>Yes</Button>
		<Button
			color="secondary"
			onclick={() => {deleteModalOpen = false;}}
		>
			Cancel
		</Button>
	</ModalFooter>
</Modal>
