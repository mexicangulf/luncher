import { json } from '@sveltejs/kit';
import { searchUsers } from '$lib/admin/storage';

export async function GET({ url }) {
  const query = url.searchParams.get('query') ?? '';
  return json(await searchUsers(query));
}
