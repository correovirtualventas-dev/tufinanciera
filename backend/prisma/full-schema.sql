-- ============================================
-- TABLAS PRISMA (gestión de préstamos)
-- ============================================

CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_name_key" ON "users"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

CREATE TABLE IF NOT EXISTS "clients" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "cuit" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "localidad" TEXT,
    "activity" TEXT,
    "income" DOUBLE PRECISION,
    "score" INTEGER,
    "notes" TEXT,
    "aval_name" TEXT,
    "referido_por" TEXT,
    "password" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "clients_dni_key" ON "clients"("dni");
CREATE UNIQUE INDEX IF NOT EXISTS "clients_cuit_key" ON "clients"("cuit");

CREATE TABLE IF NOT EXISTS "client_documents" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "client_documents_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "client_documents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "client_guarantees" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "detail" TEXT,
    "value" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "client_guarantees_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "client_guarantees_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "client_relationships" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "client_relationships_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "client_relationships_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "loans" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "interest_rate" DOUBLE PRECISION NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "installments" INTEGER NOT NULL,
    "installment_amount" DOUBLE PRECISION NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "loans_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "loans_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id")
);
CREATE INDEX IF NOT EXISTS "loans_status_idx" ON "loans"("status");
CREATE INDEX IF NOT EXISTS "loans_client_id_idx" ON "loans"("client_id");

CREATE TABLE IF NOT EXISTS "payments" (
    "id" SERIAL NOT NULL,
    "loan_id" INTEGER NOT NULL,
    "installment" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payments_loan_id_fkey" FOREIGN KEY ("loan_id") REFERENCES "loans"("id")
);

CREATE TABLE IF NOT EXISTS "notifications" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "client_id" INTEGER,
    "loan_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "cash_registers" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "open_amount" DOUBLE PRECISION NOT NULL,
    "close_amount" DOUBLE PRECISION,
    "total_in" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_out" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cash_registers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cash_registers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "cash_entries" (
    "id" SERIAL NOT NULL,
    "cash_register_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "reference_id" INTEGER,
    "reference_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cash_entries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cash_entries_cash_register_id_fkey" FOREIGN KEY ("cash_register_id") REFERENCES "cash_registers"("id")
);

CREATE TABLE IF NOT EXISTS "expense_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "expense_categories_name_key" ON "expense_categories"("name");

CREATE TABLE IF NOT EXISTS "expenses" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_categories"("id")
);

CREATE TABLE IF NOT EXISTS "settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "settings_key_key" ON "settings"("key");

CREATE TABLE IF NOT EXISTS "exchange_operations" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "amount_ars" DOUBLE PRECISION NOT NULL,
    "amount_usd" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "client_name" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exchange_operations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "prospects" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "dni" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "localidad" TEXT,
    "activity" TEXT,
    "income" DOUBLE PRECISION,
    "amount" DOUBLE PRECISION,
    "installments" INTEGER,
    "notes" TEXT,
    "temperature" TEXT,
    "qualification" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "prospects_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- TABLAS DE INVERSORES
-- ============================================

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

-- ============================================
-- ADMIN POR DEFECTO
-- ============================================

INSERT INTO users (name, email, password, role)
SELECT 'Marcelo', 'marcelo@tufinanciera.com', '$2a$10$wzDibcz4PezihPay0dlr7O1EJfpZ8/boCtc5smeeCWYPK1.mo0O6C', 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE name = 'Marcelo');
