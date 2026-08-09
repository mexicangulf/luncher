import { redirect } from '@sveltejs/kit';
import { getAdminSessionFromRequest } from '$lib/admin/auth';

export async function load({ request, url }) {
  if (url.pathname === '/admin/login') {
    return {};
  }

  const session = getAdminSessionFromRequest(request);
  if (!session) {
    throw redirect(307, '/admin/login');
  }

  return { session };
}
