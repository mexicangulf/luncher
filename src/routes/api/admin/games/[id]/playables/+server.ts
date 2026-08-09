import { json } from '@sveltejs/kit';
import { createPlayable, listPlayables } from '$lib/admin/storage';

export async function GET({ params }) {
  return json(await listPlayables(params.id ?? ''));
}

export async function POST({ params, request }) {
  const body = await request.json().catch(() => ({}));
  const playable = await createPlayable(params.id ?? '', {
    name: body.name ?? 'New playable',
    teams: body.teams ?? '',
    icon: body.icon ?? '',
    description: body.description ?? ''
  });

  return json({ playable, playables: await listPlayables(params.id ?? '') });
}
