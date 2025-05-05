-- Crear extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de cuentas si no existe
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(10) NOT NULL DEFAULT 'ARS',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de métodos de pago si no existe
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de transacciones si no existe
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'credit')),
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'ARS',
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  account VARCHAR(100),
  payment_method VARCHAR(100),
  description TEXT,
  interest DECIMAL(12, 2),
  installments INTEGER,
  installment_type VARCHAR(50) CHECK (installment_type IN ('equal', 'custom')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de cuotas para transacciones de crédito si no existe
CREATE TABLE IF NOT EXISTS installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);

-- Insertar un usuario por defecto si no existe
INSERT INTO users (id, name, email)
VALUES ('default-user', 'Usuario por Defecto', 'default@example.com')
ON CONFLICT (email) DO NOTHING;

-- Insertar cuentas por defecto si no existen
INSERT INTO accounts (user_id, name, type, balance, currency)
VALUES 
  ('default-user', 'Efectivo', 'cash', 0, 'ARS'),
  ('default-user', 'Banco Santander', 'bank', 0, 'ARS'),
  ('default-user', 'Banco BBVA', 'bank', 0, 'ARS'),
  ('default-user', 'Banco Galicia', 'bank', 0, 'ARS'),
  ('default-user', 'Mercado Pago', 'digital_wallet', 0, 'ARS'),
  ('default-user', 'Ualá', 'digital_wallet', 0, 'ARS'),
  ('default-user', 'Binance', 'crypto_wallet', 0, 'BTC'),
  ('default-user', 'Cuenta Comitente', 'investment', 0, 'USD')
ON CONFLICT DO NOTHING;

-- Insertar métodos de pago por defecto si no existen
INSERT INTO payment_methods (user_id, name, type)
VALUES 
  ('default-user', 'Efectivo', 'cash'),
  ('default-user', 'Tarjeta de Débito', 'debit'),
  ('default-user', 'Tarjeta de Crédito', 'credit'),
  ('default-user', 'Transferencia', 'transfer'),
  ('default-user', 'Código QR', 'qr'),
  ('default-user', 'Criptomoneda', 'crypto'),
  ('default-user', 'Otro', 'other')
ON CONFLICT DO NOTHING;
