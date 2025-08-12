# Patch: Losowe nagrody + autoryzacja panelu + UI

## Env w Vercel
- `DATABASE_URL` = connection string z Neon (z `sslmode=require`)
- `ADMIN_TOKEN` = dowolny sekret (np. losowy ciąg). Wymagany dla `/api/create` i `/api/redeem`.

## Front (Panel → Token admina)
W polu „Token admina” wklej wartość `ADMIN_TOKEN`. Zapisuje się w `localStorage` i jest wysyłana w nagłówku `x-admin-token`.
