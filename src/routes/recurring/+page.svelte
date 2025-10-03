<script>
	import { supabase, fetchSession, getUserId } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import Authentication from '$lib/components/Authentication.svelte';
	import Header from '$lib/components/Header.svelte';
	import { getDateString } from '$lib/helpers';
	import { Table } from '@sveltestrap/sveltestrap';
	import {
		Container,
		Navbar,
		Form,
		Button,
		Input,
		Modal,
		ModalBody,
		ModalFooter,
		ModalHeader,
		InputGroup,
		InputGroupText
	} from '@sveltestrap/sveltestrap';

	// states
	let session = $state(null);
	let user_id = $state(null);
	let transactions = $state([]);
	let tr_type = $state('expense');
	let description = $state('');
	let amount = $state('');
	let dayOfMonth = $state('');
	let deleteTransactionText = $state('');
	let deleteTransactionId = $state(null);
	let deleteModalOpen = $state(false);

	const today = new Date();

	// Listen for auth changes
	onMount(async () => {
		session = await fetchSession();
		user_id = await getUserId();
		await loadRecurringTransactions();
		supabase.auth.onAuthStateChange((_event, currentSession) => {
			session = currentSession;
		});
	});

	// load recurring transactions
	async function loadRecurringTransactions() {
		const { data, error } = await supabase
			.from('recurring_transactions')
			.select('*')
			.order('created_at', { ascending: true });
		if (!error && data) {
			transactions = data;
		}
		if (error) console.log(error);
	}

	// add a new recurring transaction to db and update state
	async function addRecurringTransaction(e) {
		e.preventDefault();
		if (!description || !amount || !dayOfMonth) return;

		const { data, error } = await supabase
			.from('recurring_transactions')
			.insert([{ tr_type, description, amount, day_of_month: dayOfMonth, user_id }])
			.select();

		if (!error && data) {
			transactions = [data[0], ...transactions];
			description = '';
			amount = '';
			dayOfMonth = '';
		}

		if (error) console.log(error);
	}

	// open delete modal
	const openDeleteModal = (id) => {
		const match = transactions.find((t) => t.id === id);
		if (match) {
			deleteTransactionText = match.description;
			deleteTransactionId = id;
			deleteModalOpen = true;
		}
	};

	// delete a recurring transaction from db and update state
	async function deleteRecurringTransaction(id) {
		const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);
		if (!error) {
			transactions = transactions.filter((t) => t.id !== id);
		}
		if (error) console.log(error);
		deleteTransactionId = null;
		deleteTransactionText = '';
		deleteModalOpen = false;
	}

	// get next recurring transaction date
	const getNextRecurringDate = (day) => {
		const targetDate = new Date();
		targetDate.setDate(day);
		const todayDayOfMonth = today.getDate();
		if (todayDayOfMonth >= day) {
			targetDate.setMonth(today.getMonth() + 1);
		}
		return getDateString(targetDate);
	};
</script>

<Container>
	<main class="position-relative">
		<Header bind:value={session} />
		{#if !session}
			<Authentication />
		{:else}
			<p class="lead my-3">
				<b>Recurring transactions</b>
			</p>
			<!-- Transactions List -->
			<div class="overflow-y-auto mb-4">
				{#if transactions.length > 0}
					<Table borderless>
						<thead>
							<tr>
								<th>Type</th>
								<th>Description</th>
								<th>Next recurring date</th>
								<th>Amount</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each transactions as t}
								<tr>
									<td>{t.tr_type === 'income' ? '+' : '-'}</td>
									<td>{t.description}</td>
									<td>{getNextRecurringDate(t.day_of_month)}</td>
									<td>
										<span class={t.tr_type === 'income' ? 'text-success' : 'text-danger'}>
											{t.amount}
										</span>
									</td>
									<td>
										<Button bsSize="sm" outline color="danger" onclick={() => openDeleteModal(t.id)}>
											Delete
										</Button>
									</td>
								</tr>
							{/each}
						</tbody>
					</Table>
				{:else}
					<p class="text-secondary">No records yet</p>
				{/if}
			</div>

			<!-- Input Form -->
			<div class="position-absolute top-100 start-50 translate-middle w-100 shadow">
				<Form class="hstack gap-2 p-2 border rounded" onsubmit={addRecurringTransaction}>
					<Input type="select" bind:value={tr_type} bsSize="sm">
						<option value="income">Income</option>
						<option value="expense" selected>Expense</option>
					</Input>
					<Input placeholder="description" bind:value={description} bsSize="sm" required />
					<Input type="number" bsSize="sm" placeholder="amount" bind:value={amount} required />
					<div>
						<InputGroup bsSize="sm" style="flex-wrap: nowrap;">
							<InputGroupText>Day of month</InputGroupText>
							<Input
								type="number"
								min="1"
								max="31"
								bsSize="sm"
								bind:value={dayOfMonth}
								required
								style="width: 3rem;"
							/>
						</InputGroup>
					</div>
					<Button type="submit" bsSize="sm" color="primary">Add</Button>
				</Form>
			</div>
		{/if}
	</main>
</Container>

<!-- Delete Modal -->
<Modal isOpen={deleteModalOpen} bsSize="sm">
	<ModalHeader
		toggle={() => {
			deleteModalOpen = false;
		}}
	>
		Delete transaction
	</ModalHeader>
	<ModalBody>
		Are you sure you want to delete the recurring transaction: {deleteTransactionText}?
	</ModalBody>
	<ModalFooter>
		<Button color="primary" onclick={deleteRecurringTransaction}>Yes</Button>
		<Button
			color="secondary"
			onclick={() => {
				deleteModalOpen = false;
			}}
		>
			Cancel
		</Button>
	</ModalFooter>
</Modal>

<style>
	main {
		height: 90vh;
	}
</style>
