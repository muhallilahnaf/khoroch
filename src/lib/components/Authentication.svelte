<script>
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';
	import {Form, FormGroup, Input, Button} from '@sveltestrap/sveltestrap';
	import ErrorAlert from './ErrorAlert.svelte';

	// Auth state
	let email = '';
	let password = '';
	let isRegister = false;
	let authError = '';
	let message = '';

	// Login/Register
	async function handleAuth(e) {
		e.preventDefault();
		authError = '';
		if (!email || !password) return;

		try {
			if (isRegister) {
				const { error } = await supabase.auth.signUp({ email, password });
				if (error) throw error;
				email = '';
				password = '';
				message = 'An email has been sent. Check your inbox to activate the account.';
			} else {
				const { error } = await supabase.auth.signInWithPassword({ email, password });
				if (error) throw error;
				email = '';
				password = '';
			}
		} catch (err) {
			authError = err.message;
		}
	}
</script>

{#if message !== ''}
	<div class="mt-3">
		<p class="text-success">{message}</p>
	</div>
{:else}
	<!-- Login/Register Form -->
	<Form class="mt-3">
		<p class="lead">
			<b>{isRegister ? 'Register' : 'Login'}</b>
		</p>
		<FormGroup floating label="Email">
			<Input type="email" bind:value={email} />
		</FormGroup>
		<FormGroup floating label="Password">
			<Input type="password" bind:value={password} />
		</FormGroup>
		{#if authError}
			<ErrorAlert message={authError} />
		{/if}
		<div>
			<Button color="info" onclick={handleAuth}>
				{isRegister ? 'Register' : 'Login'}
			</Button>
		</div>
	</Form>
	<div class="mt-4">
		<Button class="" onclick={() => (isRegister = !isRegister)}>
			{isRegister ? 'Already have an account? Login' : 'No account? Register'}
		</Button>
	</div>
{/if}
