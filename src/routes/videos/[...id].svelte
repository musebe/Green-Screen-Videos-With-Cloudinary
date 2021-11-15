<script context="module">
	export async function load({ page, fetch }) {
		try {
			const response = await fetch(`/api/videos/${page.params.id}`, {
				method: 'GET'
			});

			const data = await response.json();

			if (!response.ok) {
				throw data;
			}

			return {
				props: {
					video: data.result
				}
			};
		} catch (error) {
			return {
				status: error?.statusCode ?? 400,
				error: error?.message ?? 'Something went wrong'
			};
		}
	}
</script>

<script>
	import Layout from '../../components/Layout.svelte';
	import { goto } from '$app/navigation';

	let isLoading = false;
	export let video;

	async function deleteVideo() {
		try {
			isLoading = true;
			const response = await fetch(`/api/videos/${video.public_id}`, {
				method: 'DELETE'
			});

			const data = await response.json();

			if (!response.ok) {
				throw data;
			}

			goto('/videos', { replaceState: true });
		} catch (error) {
			console.error(error);
		} finally {
			isLoading = false;
		}
	}
</script>

<Layout>
	<div class="wrapper">
		<div class="video">
			<video src={video.secure_url} controls>
				<track kind="captions" />
			</video>
			<div class="actions">
				<button on:click|preventDefault={deleteVideo} disabled={isLoading}>Delete</button>
			</div>
		</div>
	</div>
</Layout>

<style>
	div.wrapper {
		min-width: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	div.wrapper div.video {
		width: 80%;
	}

	div.wrapper div.video video {
		width: 100%;
		object-fit: fill;
	}
</style>
