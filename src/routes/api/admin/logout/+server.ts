import { json } from '@sveltejs/kit';
import { clearAuthCookie } from '$lib/admin/auth';

export function GET() {
  return json({ ok: true }, {
    headers: {
      'Set-Cookie': clearAuthCookie()
    }
  });
}
