<script>
	import Layout from '../components/Layout.svelte';

	function tryAgain() {
		window.location.reload();
	}
</script>

<Layout>
	<div class="wrapper">
		<b>Something went wrong</b>
		<br />
		<button on:click|preventDefault={tryAgain}>Try Again</button>
	</div>
</Layout>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: calc(100vh - 100px);
	}
</style>
