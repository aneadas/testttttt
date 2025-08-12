CREATE TABLE IF NOT EXISTS codes (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  prize TEXT,
  created_at TIMESTAMP NOT NULL,
  redeemed_at TIMESTAMP,
  redeemed_ip TEXT
);
CREATE INDEX IF NOT EXISTS idx_codes_code ON codes(code);
