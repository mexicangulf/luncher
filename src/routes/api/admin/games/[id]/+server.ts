import { json } from '@sveltejs/kit';
import { getGame, updateGame } from '$lib/admin/storage';

export async function GET({ params }) {
  const game = await getGame(params.id ?? '');
  if (!game) {
    return json({ error: 'Game not found.' }, { status: 404 });
  }

  return json({ game });
}

export async function PUT({ params, request }) {
  const game = await getGame(params.id ?? '');
  if (!game) {
    return json({ error: 'Game not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const updatedGame = await updateGame(params.id ?? '', {
    name: body.name,
    description: body.description,
    hosts: body.hosts,
    version: body.version
  });

  return json({ game: updatedGame });
}
