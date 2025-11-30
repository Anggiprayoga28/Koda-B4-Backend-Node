import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma/index.js';
import pgPkg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import process from 'process';

const { Pool } = pgPkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const prismaInstance =
  globalThis._prisma || prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis._prisma = prismaInstance;
}

export {prismaInstance as prisma};
