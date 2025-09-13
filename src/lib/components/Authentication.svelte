<script>
	import { supabase } from '$lib/supabaseClient';
	import { onMount } from 'svelte';

	// Auth state
	let email = '';
	let password = '';
	let isRegister = false;
	let authError = '';
	let message = '';

	// Login/Register
	async function handleAuth() {
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
	<div class="flex flex-col gap-3 max-w-sm mx-auto mt-20 w-full">
		<p class="text-green-600">{message}</p>
	</div>
{:else}
	<!-- Login/Register Form -->
	<div class="flex flex-col gap-3 max-w-sm mx-auto mt-20 w-full">
		<h2 class="text-xl font-bold text-center">
			{isRegister ? 'Register' : 'Login'}
		</h2>
		<input type="email" placeholder="Email" bind:value={email} class="p-2 border rounded" />
		<input
			type="password"
			placeholder="Password"
			bind:value={password}
			class="p-2 border rounded"
		/>
		{#if authError}
			<p class="text-red-600">{authError}</p>
		{/if}
		<button
			class="bg-blue-500 text-white p-2 rounded"
			id="btn-auth"
			on:click|preventDefault={handleAuth}
		>
			{isRegister ? 'Register' : 'Login'}
		</button>
		<button class="text-blue-600 underline" on:click={() => (isRegister = !isRegister)}>
			{isRegister ? 'Already have an account? Login' : 'No account? Register'}
		</button>
	</div>
{/if}
