import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@/prisma';

// Validate required environment variables
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

const missing: string[] = [];
if (!dbHost) missing.push('DB_HOST');
if (!dbUser) missing.push('DB_USER');
if (!dbPassword) missing.push('DB_PASSWORD');
if (!dbName) missing.push('DB_NAME');

if (missing.length > 0) {
  throw new Error(`Missing required database environment variables: ${missing.join(', ')}`);
}

// Create adapter
const adapter = new PrismaMariaDb({
  host: dbHost,
  port: Number.parseInt(process.env.DB_PORT ?? '3306', 10),
  user: dbUser,
  password: dbPassword,
  database: dbName,
});

declare global {
  var __prisma: PrismaClient | undefined;
}

const prisma = globalThis.__prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export { prisma };
