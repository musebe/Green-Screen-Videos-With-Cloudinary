<script>
	import Layout from '../../components/Layout.svelte';
	import { onMount } from 'svelte';

	let isLoading = false;
	let videos = [];

	onMount(async () => {
		try {
			isLoading = true;

			const response = await fetch('/api/videos', {
				method: 'GET'
			});

			const data = await response.json();

			if (!response.ok) {
				throw data;
			}

			videos = data.result.resources;
		} catch (error) {
			console.error(error);
		} finally {
			isLoading = false;
		}
	});
</script>

<Layout>
	{#if videos.length > 0}
		<div class="wrapper">
			<div class="videos">
				{#each videos as video (video.public_id)}
					<div class="video">
						<div class="thumbnail">
							<img src={video.secure_url.replace('.mp4', '.jpg')} alt={video.secure_url} />
						</div>

						<div class="actions">
							<a href={`/videos/${video.public_id}`}>Open Video</a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="no-videos">
			<b>No videos yet</b>
			<br />
			<a href="/">Generate video</a>
		</div>
	{/if}

	{#if isLoading && videos.length === 0}
		<div class="loading">
			<b>Loading...</b>
		</div>
	{/if}
</Layout>

<style>
	div.wrapper div.videos {
		display: flex;
		flex-flow: row wrap;
		gap: 20px;
		padding: 20px;
	}

	div.wrapper div.videos div.video {
		flex: 0 1 400px;
		border: #ccc 1px solid;
		border-radius: 5px;
	}

	div.wrapper div.videos div.video div.thumbnail {
		width: 100%;
	}

	div.wrapper div.videos div.video div.thumbnail img {
		width: 100%;
	}

	div.wrapper div.videos div.video div.actions {
		padding: 10px;
	}

	div.loading,
	div.no-videos {
		height: calc(100vh - 100px);
		display: flex;
		flex-flow: column;
		align-items: center;
		justify-content: center;
	}
</style>
