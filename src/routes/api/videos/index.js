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
