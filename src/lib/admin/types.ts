export type AdminRole = 'user' | 'admin';

export interface AdminUser {
  id: string;
  telegram_id: string;
  username: string;
  password: string;
  role: AdminRole;
  createdAt: string;
}

export interface AdminGame {
  id: string;
  name: string;
  description: string;
  hosts: string;
  version: string;
  createdAt: string;
  lastPush: string | null;
}

export interface AdminPlayable {
  id: string;
  gameId: string;
  name: string;
  teams: string;
  icon: string;
  description: string;
  createdAt: string;
}

export interface AdminItem {
  id: string;
  name: string;
  gameId: string;
  description: string;
  price: number;
  createdAt: string;
}
