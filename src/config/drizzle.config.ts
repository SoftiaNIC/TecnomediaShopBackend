import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env', override: true });

export default {
  schema: './src/database/schema.ts',
  out: './src/config/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgres://postgres:admin@localhost:5432/ecommerce_db',
  },
} satisfies Config;
