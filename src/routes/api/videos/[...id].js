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
