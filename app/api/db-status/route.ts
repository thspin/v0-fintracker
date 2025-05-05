// app/api/db-status/route.ts
import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"
import pkg from "pg"

const { Pool } = pkg

// Pool de Postgres usando DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const CREATE_TABLES_SQL = `
-- Usuarios
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cuentas
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Métodos de pago
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transacciones
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id),
  amount NUMERIC NOT NULL,
  category VARCHAR(100),
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cuotas (installments)
CREATE TABLE IF NOT EXISTS installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  due_date DATE NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`

export async function GET() {
  // --- status (igual que ya lo tienes)
  const supabase = createServerSupabase()

  const envStatus = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: !!process.env.DATABASE_URL,
  }

  // Si falta DATABASE_URL, devolvemos error
  if (!envStatus.DATABASE_URL) {
    return NextResponse.json(
      {
        status: "error",
        message: "Falta la variable de entorno DATABASE_URL",
        env: envStatus,
      },
      { status: 500 }
    )
  }

  // Health check de Supabase
  const healthRes = await fetch(`${process.env.SUPABASE_URL}/health`, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
    },
  })
  if (!healthRes.ok) {
    return NextResponse.json(
      {
        status: "error",
        message: "Error al conectar con Supabase",
        error: `HTTP ${healthRes.status}`,
        env: envStatus,
      },
      { status: 500 }
    )
  }

  // Revisar tablas
  const tables = [
    "users",
    "accounts",
    "payment_methods",
    "transactions",
    "installments",
  ]
  const tableStatus: Record<string, { exists: boolean; error: string | null; count: number }> = {}

  for (const t of tables) {
    const { data, error } = await supabase
      .from(t)
      .select("*", { count: "exact" })
      .limit(1)
    tableStatus[t] = {
      exists: !error,
      error: error ? error.message : null,
      count: data ? data.length : 0,
    }
  }

  return NextResponse.json({
    status: "success",
    message: "Conexión exitosa a Supabase",
    env: envStatus,
    tables: tableStatus,
  })
}

export async function POST() {
  try {
    // Creamos tablas en Postgres nativo
    await pool.query("BEGIN")
    await pool.query(CREATE_TABLES_SQL)
    await pool.query("COMMIT")

    return NextResponse.json(
      { status: "success", message: "Tablas creadas correctamente" },
      { status: 200 }
    )
  } catch (e) {
    await pool.query("ROLLBACK")
    console.error("Error creando tablas:", e)
    return NextResponse.json(
      {
        status: "error",
        message: "Error al crear tablas",
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    )
  }
}
