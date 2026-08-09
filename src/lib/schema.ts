import { pgTable, pgEnum, uuid, varchar, timestamp, integer, text} from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['user', 'admin'] as const);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  telegram_id: varchar('telegram_id', { length: 256 }).notNull(), // telegram userid
  first_name: varchar('first_name', { length: 64 }),
  last_name: varchar('last_name', { length: 64 }),
  username: varchar('username', { length: 64 }), // telegram username
  photo_url: varchar('photo_url', { length: 256 }),
  password: varchar('password', { length: 256 }), // passwordless login with telegram
  role: userRole('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  url: varchar('url', {length: 256}).notNull(),
  description: varchar('description', { length: 1024 }),
  hosts: text('hosts').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  version: varchar("version", {length: 12}).default('0.0.0'),
  lastPush: timestamp('last_push')
});

export const playables = pgTable('playables', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  teams: text(),
  icon: text(),
  description: varchar('description', { length: 1024 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  name: varchar('name', { length: 256 }).notNull(),
  gameId: uuid('game_id').references(() => games.id).notNull(),
  description: varchar('description', { length: 1024 }),
  price: integer('price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const ledger = pgTable('ledger', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  itemId: uuid('item_id').references(() => items.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});