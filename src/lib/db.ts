import { drizzle } from 'drizzle-orm/postgres-js';
import dotenv from 'dotenv';

dotenv.config();

export const db = drizzle(process.env.DATABASE_URL || "");