<script>
	import {
		getUserId,
		loadCategories,
		supabase,
		loadTransactionsByDate,
		loadDescriptions
	} from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import AutoComplete from 'simple-svelte-autocomplete';
	import {
		Button,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader,
		Input,
		Form
	} from '@sveltestrap/sveltestrap';

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
	let deleteTransactionText = $state('');
	let deleteTransactionId = $state(null);
	let deleteModalOpen = $state(false);

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
		if (selectedMatch.description && selectedMatch.description !== '') {
			category_id = selectedMatch.category_id;
			description = selectedMatch.description;
		}
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
					user_id
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

	// autocomplete description and category
	const autocomplete = () => {
		console.log('autocomplete');
		matches = autocompleteData.filter((item) => item.description.includes(description));
		console.log(matches);
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
				<Button size="sm" outline color="danger" onclick={() => openDeleteModal(t.id)}>Delete</Button>
			</div>
		{/each}
	{:else}
		<p class="text-secondary">No records yet</p>
	{/if}
</div>

<!-- Input Form -->
<div class="position-absolute top-100 start-50 translate-middle w-100 shadow">
	<Form class="hstack gap-2 p-2 border rounded" onsubmit={addTransaction}>
		<Input type="select" bind:value={category_id} size="sm">
			<option disabled selected value="">Category</option>
			{#each categories as c}
				<option value={c.category_id}>{c.category_name}</option>
			{/each}
		</Input>

		<Input type="select" bind:value={tr_type} size="sm">
			<option value="income">Income</option>
			<option value="expense" selected>Expense</option>
		</Input>

		<AutoComplete
			items={autocompleteData}
			bind:selectedItem={selectedMatch}
			labelFieldName="description"
			inputClassName="form-select form-select-sm"
			placeholder="description"
			required
		/>
		<Input type="number" size="sm" placeholder="amount" bind:value={amount} required />
		<Button type="submit" size="sm" color="primary">Add</Button>
	</Form>
</div>

<!-- Delete Modal -->
<Modal isOpen={deleteModalOpen} size="sm">
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

<style>
	/* .autocomplete.select {
		border: 0 !important;
	} */
</style>
