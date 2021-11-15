<script>
	import Layout from '../components/Layout.svelte';
	import { goto } from '$app/navigation';

	let isLoading = false;

	async function onGenerate() {
		try {
			isLoading = true;

			const response = await fetch('/api/videos', {
				method: 'post'
			});
			const data = await response.json();
			if (!response.ok) {
				throw data;
			}

			goto('/videos/', { replaceState: false });
		} catch (error) {
			console.error(error);
		} finally {
			isLoading = false;
		}
	}
</script>

<Layout>
	<div class="wrapper">
		{#if isLoading}
			<div class="loading">
				<i>Loading. Please be patient.</i>
				<hr />
			</div>
		{/if}

		<h1>Make green screen videos transparent using Cloudinary + Svelte</h1>

		<p>
			While we're referring to them as green screen videos, you can really do this with any video
			that has a solid background color.
		</p>

		<p>
			You can change the background and foreground videos by editing the videos inside
			/static/videos/
		</p>

		<p>Tap on the button below to edit the files in /static/videos/</p>

		<button on:click|preventDefault={onGenerate} disabled={isLoading}>GENERATE VIDEO</button>

		<br />
		<p>or</p>
		<br />
		<a href="/videos">View generated videos</a>
	</div>
</Layout>

<style>
	div.loading {
		color: var(--color-primary);
	}
	div.wrapper {
		min-height: 100vh;
		width: 100%;
		display: flex;
		flex-flow: column;
		justify-content: center;
		align-items: center;
		background-color: #ffffff;
	}
</style>
