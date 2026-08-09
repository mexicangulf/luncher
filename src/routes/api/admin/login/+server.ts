import { json } from '@sveltejs/kit';
import { buildAuthCookie, createAdminSessionToken } from '$lib/admin/auth';
import { authenticateAdminUser } from '$lib/admin/storage';

export async function POST({ request }) {
    
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === 'string' ? body.username : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const user = await authenticateAdminUser(username, password);
  if (!user) {
    return json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  const token = createAdminSessionToken();
  return json({ ok: true }, {
    headers: {
      'Set-Cookie': buildAuthCookie(token)
    }
  });
}
