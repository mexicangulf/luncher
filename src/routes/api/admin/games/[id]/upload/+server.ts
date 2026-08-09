import { json } from '@sveltejs/kit';
import { saveUploadedAsset } from '$lib/admin/storage';

export async function POST({ params, request }) {
  const formData = await request.formData();
  const asset = formData.get('asset');

  if (!(asset instanceof File) || typeof asset.arrayBuffer !== 'function') {
    return json({ error: 'No upload provided.' }, { status: 400 });
  }

  const result = await saveUploadedAsset(params.id ?? '', asset as { name: string; arrayBuffer: () => Promise<ArrayBuffer> });
  return json({ message: `Stored upload ${result.fileName} for game ${params.id ?? ''}.`, file: result });
}
