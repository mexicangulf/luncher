import { json } from '@sveltejs/kit';
import { createItem, listItems } from '$lib/admin/storage';

export async function GET({ params }) {
  return json(await listItems(params.id ?? ''));
}

export async function POST({ params, request }) {
  const body = await request.json().catch(() => ({}));
  const item = await createItem(params.id ?? '', {
    name: body.name ?? 'New item',
    description: body.description ?? '',
    price: Number(body.price ?? 0)
  });

  return json({ item, items: await listItems(params.id ?? '') });
}
