// app/api/db-status/route.ts
export const runtime = "nodejs"   // ① fuerza nodo, no edge

import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"
import pkg from "pg"
const { Pool } = pkg

// ② Asegúrate de que esta env existe en Vercel con tu connection string de Postgres
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING, 
  // ó process.env.DATABASE_URL si has definido DATABASE_URL
})

const CREATE_TABLES_SQL = `
-- tu SQL de CREATE TABLE IF NOT EXISTS… va aquí
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
/* … resto de tablas … */
`

export async function GET() {
  // — tu código de status (igual que antes) —
  const supabase = createServerSupabase()
  const envStatus = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: !!process.env.POSTGRES_URL_NON_POOLING,
  }

  // health‐check de Supabase
  try {
    const res = await fetch(`${process.env.SUPABASE_URL}/health`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    })
    if (!res.ok) throw new Error(`Health endpoint HTTP ${res.status}`)
  } catch (e: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Error al conectar con Supabase",
        error: e.message,
        env: envStatus,
      },
      { status: 500 }
    )
  }

  // comprobar tablas
  const tables = ["users","accounts","payment_methods","transactions","installments"]
  const tableStatus: Record<string, { exists:boolean; error:string|null; count:number }> = {}

  for (const t of tables) {
    const { data, error } = await supabase
      .from(t)
      .select("*", { count: "exact" })
      .limit(1)
    tableStatus[t] = {
      exists: !error,
      error: error ? error.message : null,
      count: data?.length ?? 0,
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
    // arrancamos transacción
    await pool.query("BEGIN")
    await pool.query(CREATE_TABLES_SQL)
    await pool.query("COMMIT")

    return NextResponse.json(
      { status: "success", message: "Tablas creadas correctamente" },
      { status: 200 }
    )
  } catch (e: any) {
    // hacemos rollback si falla
    try { await pool.query("ROLLBACK") } catch {}
    console.error("Error creando tablas:", e)

    // devolvemos siempre JSON
    return NextResponse.json(
      {
        status: "error",
        message: "Error al crear las tablas",
        error: e.message || String(e),
      },
      { status: 500 }
    )
  }
}
