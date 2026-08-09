import { json } from '@sveltejs/kit';
import { getItem, updateItem } from '$lib/admin/storage';

export async function GET({ params }) {
  const item = await getItem(params.id ?? '');
  if (!item) {
    return json({ error: 'Item not found.' }, { status: 404 });
  }

  return json({ item });
}

export async function PUT({ params, request }) {
  const item = await getItem(params.id ?? '');
  if (!item) {
    return json({ error: 'Item not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const updatedItem = await updateItem(params.id ?? '', {
    name: body.name,
    description: body.description,
    price: Number(body.price ?? item.price)
  });

  return json({ item: updatedItem });
}
