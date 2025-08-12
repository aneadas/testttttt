# Zdrapki – Vercel + Neon (Postgres)

## Deploy (free)
1. Neon: stwórz projekt → skopiuj `DATABASE_URL` (z `sslmode=require`).
2. Vercel: Import repo → Settings → Environment Variables → dodaj `DATABASE_URL` → Deploy.
3. W Neon → Query Tool → wklej `schema.sql` z repo → Run.

## Lokalnie
```bash
npm i
# utwórz .env.local z DATABASE_URL=postgres://...neon.tech/neondb?sslmode=require
npx vercel dev
```
