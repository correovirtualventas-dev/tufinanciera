CREATE TABLE IF NOT EXISTS investors (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT REFERENCES clients(id),
  name TEXT NOT NULL,
  tna NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ARS',
  active BOOLEAN NOT NULL DEFAULT true,
  password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investor_movements (
  id BIGSERIAL PRIMARY KEY,
  investor_id BIGINT NOT NULL REFERENCES investors(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('DEPOSIT','CAPITAL_WITHDRAWAL')),
  amount NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS investor_accruals (
  id BIGSERIAL PRIMARY KEY,
  investor_id BIGINT NOT NULL REFERENCES investors(id),
  date DATE NOT NULL,
  capital_base NUMERIC NOT NULL,
  tna NUMERIC NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(investor_id, date)
);

CREATE TABLE IF NOT EXISTS investor_payouts (
  id BIGSERIAL PRIMARY KEY,
  investor_id BIGINT NOT NULL REFERENCES investors(id),
  amount NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE investors ADD COLUMN IF NOT EXISTS password TEXT;
