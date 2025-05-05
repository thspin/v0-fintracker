import { NextResponse } from "next/server"

export async function GET() {
  const sql = `
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
  user_id UUID NOT NULL,
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
  user_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de transacciones si no existe
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'ARS',
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  account VARCHAR(100),
  payment_method VARCHAR(100),
  description TEXT,
  interest DECIMAL(12, 2),
  installments INTEGER,
  installment_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de cuotas para transacciones de crédito si no existe
CREATE TABLE IF NOT EXISTS installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL,
  installment_number INTEGER NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar usuario por defecto si no existe
INSERT INTO users (id, name, email)
VALUES ('00000000-0000-0000-0000-000000000000', 'Usuario por Defecto', 'default@example.com')
ON CONFLICT (id) DO NOTHING;

-- Insertar cuentas por defecto
INSERT INTO accounts (user_id, name, type, balance, currency)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Efectivo', 'cash', 0, 'ARS'),
  ('00000000-0000-0000-0000-000000000000', 'Banco Santander', 'bank', 0, 'ARS'),
  ('00000000-0000-0000-0000-000000000000', 'Mercado Pago', 'digital_wallet', 0, 'ARS')
ON CONFLICT DO NOTHING;

-- Insertar métodos de pago por defecto
INSERT INTO payment_methods (user_id, name, type)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Efectivo', 'cash'),
  ('00000000-0000-0000-0000-000000000000', 'Tarjeta de Débito', 'debit'),
  ('00000000-0000-0000-0000-000000000000', 'Tarjeta de Crédito', 'credit'),
  ('00000000-0000-0000-0000-000000000000', 'Transferencia', 'transfer')
ON CONFLICT DO NOTHING;
`

  return NextResponse.json({
    sql,
    instructions: "Ejecuta este SQL en la consola SQL de Supabase para crear las tablas necesarias.",
  })
}
