<script>
	import {
		Collapse,
		NavbarToggler,
		NavbarBrand,
		Nav,
		Navbar,
		NavItem,
		NavLink,
		Button
	} from '@sveltestrap/sveltestrap';
	import { supabase } from '$lib/supabaseClient';

	let { value = $bindable() } = $props();    

	let isOpen = $state(false);

	function handleUpdate(event) {
		isOpen = event.detail.isOpen;
	}

	// logout
	async function logout() {
		await supabase.auth.signOut();
		value = null;
	}
</script>

<Navbar color="secondary-subtle" light expand="md" container="md">
	<NavbarBrand href="/">Khoroch</NavbarBrand>
	<NavbarToggler on:click={() => (isOpen = !isOpen)} />
	{#if value}
		<Collapse {isOpen} navbar expand="md" onupdate={handleUpdate}>
			<Nav class="ms-auto" navbar>
				<NavItem>
					<NavLink href="/categories">Categories</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href="/recurring">Recurring transactions</NavLink>
				</NavItem>
				<NavItem>
					<Button onclick={logout}>Logout</Button>
				</NavItem>
			</Nav>
		</Collapse>
	{/if}
</Navbar>
