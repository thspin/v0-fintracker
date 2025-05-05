import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"

export async function GET() {
  // 1️⃣ Chequeo de vars de entorno
  const envStatus = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  if (!envStatus.SUPABASE_URL || !envStatus.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      {
        status: "error",
        message: "Faltan variables de entorno de Supabase",
        env: envStatus,
      },
      { status: 500 }
    )
  }

  const supabaseUrl = process.env.SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  try {
    // 2️⃣ Hit al /health con la clave
    const healthRes = await fetch(`${supabaseUrl}/health`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    })

    if (!healthRes.ok) {
      return NextResponse.json(
        {
          status: "error",
          message: "No se pudo alcanzar el endpoint de salud de Supabase",
          error: `HTTP ${healthRes.status}`,
        },
        { status: 500 }
      )
    }

    // 3️⃣ Si OK, levantamos el cliente y comprobamos tablas
    const supabase = createServerSupabase()

    const tables = [
      "users",
      "accounts",
      "payment_methods",
      "transactions",
      "installments",
    ]
    const tableStatus: Record<string, { exists: boolean; error: string | null; count: number }> = {}

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("*", { count: "exact" })
        .limit(1)

      tableStatus[table] = {
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
  } catch (err) {
    console.error("Error al verificar el estado de la base de datos:", err)
    return NextResponse.json(
      {
        status: "error",
        message: "Error al verificar el estado de la base de datos",
        error: err instanceof Error ? err.message : "Error desconocido",
      },
      { status: 500 }
    )
  }
}
