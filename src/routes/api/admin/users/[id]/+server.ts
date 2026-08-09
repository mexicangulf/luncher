import { json } from '@sveltejs/kit';
import { getUser, updateUser } from '$lib/admin/storage';

export async function GET({ params }) {
  const user = await getUser(params.id ?? '');
  if (!user) {
    return json({ error: 'User not found.' }, { status: 404 });
  }

  return json({ user });
}

export async function PUT({ params, request }) {
  const user = await getUser(params.id ?? '');
  if (!user) {
    return json({ error: 'User not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const nextData: Record<string, unknown> = {
    username: body.username,
    telegram_id: body.telegram_id,
    role: body.role
  };

  if (typeof body.password === 'string' && body.password.trim()) {
    nextData.password = body.password;
  }

  const updatedUser = await updateUser(params.id ?? '', nextData as Record<string, unknown>);
  return json({ user: updatedUser });
}
