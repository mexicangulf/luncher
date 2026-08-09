import { json } from '@sveltejs/kit';
import { getPlayable, updatePlayable } from '$lib/admin/storage';

export async function GET({ params }) {
  const playable = await getPlayable(params.id ?? '');
  if (!playable) {
    return json({ error: 'Playable not found.' }, { status: 404 });
  }

  return json({ playable });
}

export async function PUT({ params, request }) {
  const playable = await getPlayable(params.id ?? '');
  if (!playable) {
    return json({ error: 'Playable not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const updatedPlayable = await updatePlayable(params.id ?? '', {
    name: body.name,
    teams: body.teams,
    icon: body.icon,
    description: body.description
  });

  return json({ playable: updatedPlayable });
}
