import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { and, eq, ilike, or } from 'drizzle-orm';
import { db } from '$lib/db';
import { games, items, playables, users } from '$lib/schema';
import type { AdminGame, AdminItem, AdminPlayable, AdminRole, AdminUser } from './types';

const adminUploadDir = resolve(dirname(fileURLToPath(import.meta.url)), 'uploads');

if (!existsSync(adminUploadDir)) {
  mkdirSync(adminUploadDir, { recursive: true });
}

export const adminPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
export const adminSessionSecret = process.env.ADMIN_SESSION_SECRET ?? 'luncher-admin-secret';

function toIso(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function normalizeUser(row: typeof users.$inferSelect): AdminUser {
  return {
    id: row.id,
    telegram_id: row.telegram_id ?? '',
    username: row.username ?? '',
    password: row.password ?? '',
    role: row.role as AdminRole,
    createdAt: toIso(row.createdAt) ?? ''
  };
}

function normalizeGame(row: typeof games.$inferSelect): AdminGame {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    hosts: row.hosts,
    version: row.version ?? '0.0.0',
    createdAt: toIso(row.createdAt) ?? '',
    lastPush: toIso(row.lastPush)
  };
}

function normalizePlayable(row: typeof playables.$inferSelect): AdminPlayable {
  return {
    id: row.id,
    gameId: row.gameId,
    name: row.name,
    teams: row.teams ?? '',
    icon: row.icon ?? '',
    description: row.description ?? '',
    createdAt: toIso(row.createdAt) ?? ''
  };
}

function normalizeItem(row: typeof items.$inferSelect): AdminItem {
  return {
    id: row.id,
    name: row.name,
    gameId: row.gameId,
    description: row.description ?? '',
    price: row.price,
    createdAt: toIso(row.createdAt) ?? ''
  };
}

async function ensureAdminBootstrap() {

  const existingAdmin = await db.select().from(users).where(eq(users.username, process.env.ADMIN_USERNAME ?? 'admin')).limit(1);
  if (existingAdmin.length) {
    return;
  }

  await db.insert(users).values({
    telegram_id: '0',
    username: process.env.ADMIN_USERNAME ?? 'admin',
    password: adminPassword,
    role: 'admin'
  });
}

// await ensureAdminBootstrap();

export async function authenticateAdminUser(username: string, password: string) {
  const rows = await db.select().from(users).where(and(eq(users.username, username), eq(users.password, password), eq(users.role, 'admin'))).limit(1);
  return rows[0] ? normalizeUser(rows[0]) : null;
}

export async function searchUsers(query = '') {

  const term = query.trim();
  if (!term) {
    return [] as AdminUser[];
  }

  const rows = await db.select().from(users).where(or(ilike(users.username, `%${term}%`))).limit(10);
  return rows.map(normalizeUser);

}

export async function searchGames(query = '') {
  const term = query.trim();
  if (!term) {
    return [] as AdminGame[];
  }

  const rows = await db.select().from(games).where(or(ilike(games.name, `%${term}%`), ilike(games.description, `%${term}%`), ilike(games.hosts, `%${term}%`), ilike(games.version, `%${term}%`))).limit(10);
  return rows.map(normalizeGame);
}

export async function getUser(id: string) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ? normalizeUser(rows[0]) : null;
}

export async function updateUser(id: string, data: Partial<AdminUser>) {
  const updates = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as Partial<typeof users.$inferInsert>;
  if (!Object.keys(updates).length) {
    return getUser(id);
  }

  const rows = await db.update(users).set(updates).where(eq(users.id, id)).returning();
  return rows[0] ? normalizeUser(rows[0]) : null;
}

export async function getGame(id: string) {
  const rows = await db.select().from(games).where(eq(games.id, id)).limit(1);
  return rows[0] ? normalizeGame(rows[0]) : null;
}

export async function updateGame(id: string, data: Partial<AdminGame>) {
  const updates = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as Partial<typeof games.$inferInsert>;
  if (!Object.keys(updates).length) {
    return getGame(id);
  }

  const rows = await db.update(games).set(updates).where(eq(games.id, id)).returning();
  return rows[0] ? normalizeGame(rows[0]) : null;
}

export async function getPlayable(id: string) {
  const rows = await db.select().from(playables).where(eq(playables.id, id)).limit(1);
  return rows[0] ? normalizePlayable(rows[0]) : null;
}

export async function updatePlayable(id: string, data: Partial<AdminPlayable>) {
  const updates = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as Partial<typeof playables.$inferInsert>;
  if (!Object.keys(updates).length) {
    return getPlayable(id);
  }

  const rows = await db.update(playables).set(updates).where(eq(playables.id, id)).returning();
  return rows[0] ? normalizePlayable(rows[0]) : null;
}

export async function listPlayables(gameId: string) {
  const rows = await db.select().from(playables).where(eq(playables.gameId, gameId));
  return rows.map(normalizePlayable);
}

export async function createPlayable(gameId: string, data: Omit<AdminPlayable, 'id' | 'gameId' | 'createdAt'>) {
  const rows = await db.insert(playables).values({
    gameId,
    name: data.name,
    teams: data.teams,
    icon: data.icon,
    description: data.description
  }).returning();

  return normalizePlayable(rows[0]);
}

export async function getItem(id: string) {
  const rows = await db.select().from(items).where(eq(items.id, id)).limit(1);
  return rows[0] ? normalizeItem(rows[0]) : null;
}

export async function updateItem(id: string, data: Partial<AdminItem>) {
  const updates = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)) as Partial<typeof items.$inferInsert>;
  if (!Object.keys(updates).length) {
    return getItem(id);
  }

  const rows = await db.update(items).set(updates).where(eq(items.id, id)).returning();
  return rows[0] ? normalizeItem(rows[0]) : null;
}

export async function listItems(gameId: string) {
  const rows = await db.select().from(items).where(eq(items.gameId, gameId));
  return rows.map(normalizeItem);
}

export async function createItem(gameId: string, data: Omit<AdminItem, 'id' | 'gameId' | 'createdAt'>) {
  const rows = await db.insert(items).values({
    gameId,
    name: data.name,
    description: data.description,
    price: data.price
  }).returning();

  return normalizeItem(rows[0]);
}

export async function saveUploadedAsset(gameId: string, file: { name: string; arrayBuffer: () => Promise<ArrayBuffer> }) {
  const ext = file.name.split('.').pop() ?? 'bin';
  const safeName = `${gameId}-${Date.now()}.${ext}`.replace(/[^a-zA-Z0-9._-]+/g, '-');
  const filePath = resolve(adminUploadDir, safeName);
  const bytes = Buffer.from(await file.arrayBuffer());
  writeFileSync(filePath, bytes);

  return {
    fileName: safeName,
    filePath: filePath.replace(process.cwd() + '/', '')
  };
}
