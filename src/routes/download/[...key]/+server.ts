import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { error, json } from '@sveltejs/kit';
import dotenv from 'dotenv';
import type { RequestHandler } from '@sveltejs/kit';

dotenv.config();

console.log(process.env.MINIO_ENDPOINT, process.env.MINIO_ACCESS_KEY, process.env.MINIO_SECRET_KEY, process.env.MINIO_BUCKET);

let s3: S3Client;

try {
	s3 = new S3Client({
	region: 'us-east-1',
	endpoint: process.env.MINIO_ENDPOINT,
	credentials: {
		accessKeyId: process.env.MINIO_ACCESS_KEY!,
		secretAccessKey: process.env.MINIO_SECRET_KEY!
	},
	forcePathStyle: true // required for MinIO
});
} catch(error) {
	console.log(error);
}

const bucket = process.env.MINIO_BUCKET!;

export const GET: RequestHandler = async ({ params }) => {
    
	const key = params.key;

	if (!key) {
		return json({error:"file not found"}, {status: 404});
	}

	console.log(bucket);

	try {

		const command = new GetObjectCommand({
			Bucket: bucket,
			Key: key
		});

		const response = await s3.send(command);

		console.log(response);

		if (!response.Body) {
			return json({error:"file not found"}, {status: 404});
		}

		const body = response.Body.transformToWebStream();

		return new Response(body, {
			headers: {
				'Content-Type': response.ContentType ?? 'application/octet-stream',
				'Content-Length': response.ContentLength?.toString() ?? '',
				'Content-Disposition': `attachment; filename="${encodeURIComponent(
					key.split('/').pop() ?? 'download'
				)}"`
			}
		});

	} catch (err: any) {

		console.log(err);

		if (err.name === 'NoSuchKey') {
			throw error(404, 'File not found');
		}

		console.error(err);
		throw error(500, 'Failed to download file');

	}
	
};