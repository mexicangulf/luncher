import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { error, json } from '@sveltejs/kit';
import dotenv from 'dotenv';
import type { RequestHandler } from '@sveltejs/kit';

dotenv.config();


const s3 = new S3Client({
	region: 'us-east-1',
	endpoint: process.env.MINIO_ENDPOINT,
	credentials: {
		accessKeyId: process.env.MINIO_ACCESS_KEY!,
		secretAccessKey: process.env.MINIO_SECRET_KEY!
	},
	forcePathStyle: true // required for MinIO
});

const bucket = process.env.MINIO_BUCKET!;

// export const GET: RequestHandler = async ({ params }) => {
    
// 	const key = params.key;

// 	if (!key) {
// 		return json({error:"file not found"}, {status: 404});
// 	}

// 	console.log(bucket);

// 	try {

// 		const command = new GetObjectCommand({
// 			Bucket: bucket,
// 			Key: key
// 		});

// 		const response = await s3.send(command);

// 		console.log(response);

// 		if (!response.Body) {
// 			return json({error:"file not found"}, {status: 404});
// 		}

// 		const body = response.Body.transformToWebStream();

// 		return new Response(body, {
// 			headers: {
// 				'Content-Type': response.ContentType ?? 'application/octet-stream',
// 				'Content-Length': response.ContentLength?.toString() ?? '',
// 				'Content-Disposition': `attachment; filename="${encodeURIComponent(
// 					key.split('/').pop() ?? 'download'
// 				)}"`
// 			}
// 		});

// 	} catch (err: any) {

// 		console.log(err);

// 		if (err.name === 'NoSuchKey') {
// 			throw error(404, 'File not found');
// 		}

// 		console.error(err);
// 		throw error(500, 'Failed to download file');

// 	}
	
// };

export const GET: RequestHandler = async () => {
	try {
		console.log('Endpoint:', process.env.MINIO_ENDPOINT);

		const res = await fetch(process.env.MINIO_ENDPOINT!);

		console.log('Status:', res.status);
		console.log('Headers:', [...res.headers.entries()]);

		return new Response(`MinIO responded: ${res.status}`);
	} catch (e) {
		console.error('FETCH FAILED:', e);

		return new Response(
			JSON.stringify({
				error: String(e),
				cause: e instanceof Error ? String(e.cause) : undefined
			}),
			{ status: 500 }
		);
	}
};