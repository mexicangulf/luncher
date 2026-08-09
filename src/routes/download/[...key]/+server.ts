import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const s3 = new S3Client({
	region: 'us-east-1',
	endpoint: env.MINIO_ENDPOINT,
	credentials: {
		accessKeyId: env.MINIO_ACCESS_KEY,
		secretAccessKey: env.MINIO_SECRET_KEY
	},
	forcePathStyle: true
});

export const GET: RequestHandler = async ({ params }) => {
	const key = params.key;

	if (!key) {
		throw error(404, 'File not found');
	}

	try {
		
		const response = await s3.send(
			new GetObjectCommand({
				Bucket: env.MINIO_BUCKET,
				Key: key
			})
		);

		if (!response.Body) {
			throw error(404, 'File not found');
		}

		return new Response(response.Body.transformToWebStream(), {
			headers: {
				'Content-Type':
					response.ContentType ?? 'application/octet-stream',

				...(response.ContentLength !== undefined && {
					'Content-Length': response.ContentLength.toString()
				}),

				'Content-Disposition': `attachment; filename="${encodeURIComponent(
					key.split('/').pop() ?? 'download'
				)}"`
			}
		});

	} catch (err: any) {
		console.error('S3 ERROR:', {
			name: err?.name,
			message: err?.message,
			code: err?.Code,
			status: err?.$metadata?.httpStatusCode,
			requestId: err?.$metadata?.requestId,
			extendedRequestId: err?.$metadata?.extendedRequestId
		});

		if (err?.name === 'NoSuchKey') {
			throw error(404, 'File not found');
		}

		throw error(500, 'Failed to download file');
	}
};