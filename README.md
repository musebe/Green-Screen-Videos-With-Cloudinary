# Edit green screen videos using Cloudinary and SvelteKit

## Introduction

Have you ever watched one of those programming videos where the person's face is overlayed over their computer screen? That's made possible using green screens. They're widely used especially in the media and filming industries. Even though green screens are preferred more, you can achieve the same using any solid color. I won't go over why green is more suitable compared to say blue or some other color. There's tons of youtube videos explaining that. You can check out [this video](https://www.youtube.com/watch?v=DAT3epRBNVI&t=231s) or [this one](https://www.youtube.com/watch?v=ava4Z3sJMLk&t=153s). That said, even though the title of this tutorial focuses on green screens, you can do the same for any video with a contrasting solid background color. In this tutorial we'll be using [Cloudinary](https://cloudinary.com/?ap=em) and [SvelteKit](https://kit.svelte.dev/). SvelteKit is to Svelte.js just as Next.js is to React.js or Nuxt.js to Vue.js.

## Prerequisites and setup

Before moving on further, it's important to note that working knowledge of Javascript is required for this tutorial. In addition to that, familiarity with [Svelte](https://svelte.dev/) and [SvelteKit](https://kit.svelte.dev/) is recommended although not necessary. You can easily pick up the concepts. You also need to have Node.js and NPM installed on your development environment

> DISCLAIMER: Svelte and more specifically SvelteKit, is at a very early stage and a few features are missing or require workarounds. Some notable features include file upload and loading environment variables during SSR or in the endpoint routes. You can check out [this](https://github.com/sveltejs/kit/issues/70) and [this](https://github.com/vitejs/vite/issues/3176) issues for more information and insight.

Let's first create a new [SvelteKit] project. Run the following command in your terminal

```bash
npm init svelte@next green-screen-videos-with-cloudinary
```

You'll be prompted for a few more options and then the CLI will scaffold a SvelteKit starter project for you. If you want to use the same options that I did, choose **Skeleton project** template, **No** for typescript, **Yes** for ESLint, **Yes** for Prettier. Follow the steps on the terminal to change directory into your new project and install dependencies. Finally open the project in your favorite code editor.

### Cloudinary API Keys

Cloudinary offers APIs for upload of media, optimization, transformation and delivery of uploaded media. We need API keys to communicate with their API. Luckily, you can easily get started with a free account. Please note that resources for a free account are limited, so use the API sparingly. Create a new [cloudinary](https://cloudinary.com/?ap=em) account if you do not already have one and log in. Navigate to the [console page](https://cloudinary.com/console?ap=em). Here you'll find the `Cloud name`, `API Key` and `API Secret`.

![Cloudinary Dashboard](https://github.com/newtonmunene99/green-screen-videos-with-cloudinary/blob/master/static/images/cloudinary-dashboard.png "Cloudinary Dashboard").

Create a new file named `.env.local` at the root of your project and paste the following code inside.

```env
VITE_CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
VITE_CLOUDINARY_API_KEY=YOUR_API_KEY
VITE_CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

Replace `YOUR_CLOUD_NAME` `YOUR_API_KEY` and `YOUR_API_SECRET` with the `Cloud name`, `API Key` and `API Secret` values from the [console page](https://cloudinary.com/console?ap=em).

Yes, these are environment variables. Now I know I mentioned that SvelteKit did not have full support for environment variables. Have a look at [this github issue](https://github.com/vitejs/vite/issues/3176) to understand what I meant. It's more of an issue with [Vite.js](https://vitejs.dev/), a build tool that Svelte uses, than with SvelteKit. I'd also highly recommend you [read this FAQ](https://kit.svelte.dev/faq#env-vars) and [this blog post](https://dev.to/danawoodman/storing-environment-variables-in-sveltekit-2of3#security-note) before proceeding any further.

To finish up the setup, let's install the dependencies

### Dependencies/Libraries used

Run the followind command to install required depencencies.

```bash
npm run install cloudinary
```

### Sample videos for upload

Since SvelteKit doesn't directly support file upload yet, we're going to be using static files that we have pre-downloaded. I downloaded [this](https://pixabay.com/videos/man-wave-hand-waving-hello-80696/) video for the foreground then just got a random video for the background. You can find these videos [in the github repo](https://github.com/newtonmunene99/green-screen-videos-with-cloudinary/blob/master/static/videos).

## Getting started

Create a new folder called `lib` under `src` folder and create a new file called `cloudinary.js` inside `src/lib`. Paste the following code inside `src/lib/cloudinary.js`.

```js
// src/lib/cloudinary.js

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
	cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
	api_key: import.meta.env.VITE_CLOUDINARY_API_KEY,
	api_secret: import.meta.env.VITE_CLOUDINARY_API_SECRET
});

const CLOUDINARY_FOLDER_NAME = 'green-screen-videos/';

/**
 * Get cloudinary upload
 *
 * @param {string} id
 * @returns {Promise}
 */
export const handleGetCloudinaryUpload = (id) => {
	return cloudinary.api.resource(id, {
		type: 'upload',
		prefix: CLOUDINARY_FOLDER_NAME,
		resource_type: 'video'
	});
};

/**
 * Get cloudinary uploads
 * @returns {Promise}
 */
export const handleGetCloudinaryUploads = () => {
	return cloudinary.api.resources({
		type: 'upload',
		prefix: CLOUDINARY_FOLDER_NAME,
		resource_type: 'video'
	});
};

/**
 * Uploads a video to cloudinary and returns the upload result
 *
 * @param {{path: string; transformation?:TransformationOptions;publicId?: string; folder?: boolean; }} resource
 */
export const handleCloudinaryUpload = (resource) => {
	return cloudinary.uploader.upload(resource.path, {
		// Folder to store video in
		folder: resource.folder ? CLOUDINARY_FOLDER_NAME : null,
		// Public id of video.
		public_id: resource.publicId,
		// Type of resource
		resource_type: 'auto',
		// Transformation to apply to the video
		transformation: resource.transformation
	});
};

/**
 * Deletes resources from cloudinary. Takes in an array of public ids
 * @param {string[]} ids
 */
export const handleCloudinaryDelete = (ids) => {
	return cloudinary.api.delete_resources(ids, {
		resource_type: 'video'
	});
};
```

At the top we import the v2 API from the cloudinary SDK and rename it to `cloudinary`. We then call the `.config` method to initialize it with our API credentials. Note how we import the environment variables. Read [this](https://vitejs.dev/guide/env-and-mode.html#env-variables) for more information on that. 

`CLOUDINARY_FOLDER_NAME` is the name of the cloudinary folder where we want to store all our uploaded videos. Storing all our similar uploads to one folder will make it easier for us to fetch all resources in a particular folder.

`handleGetCloudinaryUpload` and `handleGetCloudinaryUploads` call the `api.resource` and the `api.resources` methods respectively. These are usually for getting either a single resource using it's public id, or getting all resources in a folder. You can find more information on the two APIs in the [official docs](https://cloudinary.com/documentation/admin_api#get_resources).

`handleCloudinaryUpload` calls the `uploader.upload` method on the SDK to upload a file, in this case a video. It takes in an object that contains the path to the file and a transformation array. Read the [upload api reference](https://cloudinary.com/documentation/image_upload_api_reference) for more information on the options you can pass.

`handleCloudinaryDelete` deletes resources from cloudinary by passing an array of public IDs to the `api.delete_resources` method. Read more about it in the [official docs](https://cloudinary.com/documentation/admin_api#delete_resources).

Next we need some API endpoints. SvelteKit uses a file-based routing system. Any file ending in a `.js` or a `.ts` extension in the `src/routes` folder becomes an endpoint. Read about this in the [SvelteKit docs](https://kit.svelte.dev/docs#routing-endpoints). 

We want all our APIs to have the `/api/` prefix so let's create a new folder called `api` under `src/routes`. Inside of `src/routes/api` create a folder called `videos`. Create two files inside `src/routes/api/videos`, one called `[...id].js` and another called `index.js`. The files will map to the endpoints `/api/videos/` and `/api/videos/:id`.

Paste the following inside `src/routes/api/videos/index.js`

```js
// src/routes/api/videos/index.js

import {
	handleCloudinaryDelete,
	handleCloudinaryUpload,
	handleGetCloudinaryUploads
} from '$lib/cloudinary';

export async function get() {
	try {
		const uploads = await handleGetCloudinaryUploads();

		return {
			status: 200,
			body: {
				result: uploads
			}
		};
	} catch (error) {
		return {
			status: error?.statusCode ?? 400,
			body: {
				error
			}
		};
	}
}

export async function post() {
	try {
		// Path to the foreground video. This is the video with the solid background color
		const foregroundVideoPath = 'static/videos/foreground.mp4';

		// The solid background color of the foreground video
		const foregroundChromaKeyColor = '#6adb47';

		// Upload the foreground video to Cloudinary
		const foregroundUploadResponse = await handleCloudinaryUpload({
			path: foregroundVideoPath,
			folder: false
		});

		// Path to the background video. This is the video that will be placed in the background
		const backgroundVideoPath = 'static/videos/background.mp4';

		// Upload the background video to Cloudinary
		const backgroundUploadResponse = await handleCloudinaryUpload({
			path: backgroundVideoPath,
			folder: true,
			transformation: [
				{
					width: 500,
					crop: 'scale'
				},
				{
					overlay: `video:${foregroundUploadResponse.public_id}`
				},
				{
					flags: 'relative',
					width: '0.6',
					crop: 'scale'
				},
				{
					color: foregroundChromaKeyColor,
					effect: 'make_transparent:20'
				},
				{
					flags: 'layer_apply',
					gravity: 'north'
				},
				{
					duration: '15.0'
				}
			]
		});

		// Delete the foreground video from Cloudinary, We don't need it anymore
		await handleCloudinaryDelete([foregroundUploadResponse.public_id]);

		return {
			status: 200,
			body: {
				result: backgroundUploadResponse
			}
		};
	} catch (error) {
		return {
			status: error?.statusCode ?? 400,
			body: {
				error
			}
		};
	}
}
```

To handle requests of a particular verb/type we need to export a function corresponding to the http verb. For example, to handle GET request we export a function called `get`. The only exception is the DELETE verb where we use `del` instead since delete is a reserved keyword. This is all covered in the [docs](https://kit.svelte.dev/docs#routing-endpoints).

`get` calls `handleGetCloudinaryUploads` to get all the resources that have been uploaded to our folder in cloudinary.

`post` is where the magic happens. We first need the path to both the foreground video and the background video. You can download these videos from [here](https://github.com/newtonmunene99/green-screen-videos-with-cloudinary/blob/master/static/videos) and save them inside `static/videos` folder. The foreground video is the green screen video(the video whose background we want to make transparent). We also define the background color that's in the foreground video in the `foregroundChromaKeyColor` variable. We then upload the foreground video to cloudinary then followed by the background video. We then use Cloudinary's transformation to overlay the previously uploaded foreground video over the background video and also make the green background transparent. There's a guide showing how to make a video transparent using cloudinary. [Here's the link](https://cloudinary.com/documentation/video_manipulation_and_delivery#apply_video_transparency). Finally we delete the foreground video from cloudinary since we don't need it anymore.

Paste the following code inside `src/routes/api/videos/[...id].js`.

```js
// src/routes/api/videos/[...id].js

import { handleCloudinaryDelete, handleGetCloudinaryUpload } from '$lib/cloudinary';

export async function get({ params }) {
	try {
		const result = await handleGetCloudinaryUpload(params.id);

		return {
			status: 200,
			body: {
				result
			}
		};
	} catch (error) {
		return {
			status: error?.statusCode ?? 400,
			body: {
				error
			}
		};
	}
}

export async function del({ params }) {
	try {
		const result = await handleCloudinaryDelete([params.id]);

		return {
			status: 200,
			body: {
				result
			}
		};
	} catch (error) {
		return {
			status: error?.statusCode ?? 400,
			body: {
				error
			}
		};
	}
}

```

We're just handling two http verbs here, i.e. get and delete.

`get` calls `handleGetCloudinaryUpload` to get a specific resource using its public ID. 

`del` passes a public id to `handleCloudinaryDelete` and deletes the resource with that public ID. 

To understand why we named our file `[...id].js` instead of `[id].js`, have a look at the [rest parameters docs](https://kit.svelte.dev/docs#routing-advanced-rest-parameters). These allow us to match all paths following the `api/videos/:id` instead of just `api/videos/:id`. For example, say we have an endpoint `/api/videos/folder/videoid`, if we just use `[id].js` it will only match to `/api/videos/folder`.

Let's move on to the frontend. For the frontend, SvelteKit also uses file-based routing. Files that are inside the `src/routes` directory and end in the extension `.svelte` are treated as pages/components. Check out [this](https://kit.svelte.dev/docs#routing-pages) documentation on page routing. 

Open `src/app.html` and add the following to the head.

```html
<style>
    body {
        font-family: sans-serif;
        margin: 0;
        padding: 0;
    }

    * {
        box-sizing: border-box;
        --color-primary: #0070f3;
    }

    button {
        padding: 0 20px;
        height: 50px;
        border: 1px solid #ccc;
        background-color: #ffffff;
        font-size: 1.2rem;
        font-weight: bold;
        cursor: pointer;
    }

    button:disabled {
        background-color: #cfcfcf;
    }

    button:hover:not([disabled]) {
        color: #ffffff;
        background-color: var(--color-primary);
    }
</style>
```

It's just some simple styles that we want to have globally. Next, create a new folder under `src` and call it `components`. This folder will hold all of our shared components. Create a new file under `src/components` and name it `Layout.svelte`. Paste the following code inside of `src/components/Layout.svelte`.

```svelte
<nav>
	<ul>
		<li><a href="/">Home</a></li>
		<li><a href="/videos">Videos</a></li>
	</ul>
</nav>

<main>
	<slot />
</main>

<style>
	nav {
		background-color: #333333;
		color: #fff;
		display: flex;
		height: 100px;
	}

	nav ul {
		display: flex;
		flex: 1;
		justify-content: center;
		align-items: center;
		list-style: none;
		gap: 8px;
		margin: 0;
		padding: 0;
	}

	nav ul li a {
		padding: 10px 20px;
		color: #000000;
		display: block;
		background-color: #ffffff;
		text-decoration: none;
		font-weight: bold;
	}

	nav ul li a:hover {
		color: #ffffff;
		background-color: var(--color-primary);
	}
</style>

```

Here we just have a nav at the top and a main element where the body of our pages will go. If you're not familiar with svelte slots and component composition, check out [this tutorial](https://svelte.dev/tutorial/slots) from the svelte website. 

Paste the following code inside `src/routes/index.svelte`.

```svelte
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

```

When the user taps on the button, the `onGenerate` function makes a POST request to the `/api/videos` endpoint that we created earlier. This uploads the two videos then navigates to the videos page that we'll create shortly. I won't go much into the syntax of svelte components since that's something you can easily grasp from the svelte documentation and other tutorials. 

Next we need pages to display all videos and specific videos. Create a new folder called `videos` under `src/routes`. **Please note that this is a different videos folder from the one inside the api folder.** Then create two files under `src/routes/videos`, one called `index.svelte` and another `[...id].svelte`. 

Paste the following code inside of `src/routes/videos/index.svelte`

```svelte
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
```

Here we're using `onMount` to make a GET request to the `/api/videos` endpoint when the component mounts. Read about `onMount` [here](https://svelte.dev/docs#onMount). For the video thumbnails, all we have to do is replace the .mp4 extension with .jpg and Cloudinary automatically gives us a thumbail of that video. Clicking on a video takes you to the `/videos/:id` page that we'll be creating next.

Paste the following code inside `src/routes/videos/[...id].svelte`

```svelte
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

```

If you've used Next.js before, you probably know about `getStaticProps` or `getServerSideProps`. The `load` function that we've used here is similar to those. In SvelteKit, however, the load method is called on both Server Side Rendering and Client Side Rendering. There's a few things you should be wary of when using load. I highyl recommend you have a read of [these docs](https://kit.svelte.dev/docs#loading). 

In this case, we use load to make GET a call to the `/api/videos/:id` endpoint to get the video with that specific ID. That's about it for the frontend. We need one more thing, a custom error page.

Create a file called `__error.svelte` under `src/routes` and paste the following code inside.

```svelte
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
```

And that's it for this tutorial. You can run your app by running the following in your terminal.

```bash
npm run dev -- --open   
```

You can find the full source code on my [Github](https://github.com/newtonmunene99/green-screen-videos-with-cloudinary).