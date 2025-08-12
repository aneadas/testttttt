import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;

if (!url) {
  // This will surface a clear error in logs if env var is missing
  throw new Error('CONFIG: Missing DATABASE_URL. Set it in Vercel → Project → Settings → Environment Variables (Production & Preview).');
}

export const sql = neon(url);
