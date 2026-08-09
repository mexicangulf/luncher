import { json } from '@sveltejs/kit';
import { searchGames } from '$lib/admin/storage';

export async function GET({ url }) {
  const query = url.searchParams.get('query') ?? '';
  return json(await searchGames(query));
}
