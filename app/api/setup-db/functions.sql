-- Función para configurar la base de datos
CREATE OR REPLACE FUNCTION setup_database()
RETURNS void AS $$
BEGIN
  -- Crear extensión UUID si no existe
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- Crear tabla de usuarios con soporte para Google
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    provider VARCHAR(50) DEFAULT 'email',
    provider_id VARCHAR(255),
    picture TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Crear otras tablas necesarias
  CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'credit')),
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'ARS',
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    description TEXT,
    interest DECIMAL(12, 2) NULL,
    installments INTEGER NULL,
    installment_type VARCHAR(50) NULL CHECK (installment_type IN ('equal', 'custom')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Crear índices
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
  
  -- Crear función para actualizar el timestamp
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  -- Crear triggers
  DROP TRIGGER IF EXISTS update_users_updated_at ON users;
  CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
  
  DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
  CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar la tabla de usuarios para Google
CREATE OR REPLACE FUNCTION update_users_table_for_google()
RETURNS void AS $$
BEGIN
  -- Verificar si las columnas existen y agregarlas si no
  BEGIN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'email';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS picture TEXT;
  EXCEPTION
    WHEN duplicate_column THEN
      -- Las columnas ya existen, no hacer nada
  END;
  
  -- Crear índice para provider_id si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_provider_id'
  ) THEN
    CREATE INDEX idx_users_provider_id ON users(provider_id);
  END IF;
END;
$$ LANGUAGE plpgsql;
