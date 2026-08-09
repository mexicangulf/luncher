import jwt from 'jsonwebtoken';
import { adminSessionSecret } from './storage';

export interface AdminSessionPayload {
  sub: string;
  role: 'admin';
}

export function createAdminSessionToken() {
  return jwt.sign({ sub: 'admin', role: 'admin' } satisfies AdminSessionPayload, adminSessionSecret, {
    expiresIn: '8h'
  });
}

export function verifyAdminSessionToken(token: string) {
  try {
    return jwt.verify(token, adminSessionSecret) as AdminSessionPayload;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string) {
  return cookieHeader.split(';').reduce<Record<string, string>>((accumulator, entry) => {
    const [rawName, ...rawValue] = entry.trim().split('=');
    if (rawName) {
      accumulator[rawName] = rawValue.join('=');
    }
    return accumulator;
  }, {});
}

export function getAdminSessionFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookies = parseCookies(cookieHeader);
  const token = cookies.admin_session;

  if (!token) {
    return null;
  }

  return verifyAdminSessionToken(token);
}

export function buildAuthCookie(token: string) {
  return `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800`;
}

export function clearAuthCookie() {
  return 'admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}
