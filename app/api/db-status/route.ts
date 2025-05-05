import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabase()

    // Verificar la conexión
    const { data: connectionData, error: connectionError } = await supabase.from("_tables").select("*").limit(1)

    if (connectionError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Error al conectar con la base de datos",
          error: connectionError.message,
        },
        { status: 500 },
      )
    }

    // Verificar tablas importantes
    const tables = ["users", "accounts", "payment_methods", "transactions", "installments"]
    const tableStatus = {}

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*", { count: "exact" }).limit(1)
      tableStatus[table] = {
        exists: !error,
        error: error ? error.message : null,
        count: data ? data.length : 0,
      }
    }

    // Verificar variables de entorno
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    return NextResponse.json({
      status: "success",
      message: "Conexión exitosa a la base de datos",
      tables: tableStatus,
      env: envStatus,
    })
  } catch (error) {
    console.error("Error al verificar el estado de la base de datos:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error al verificar el estado de la base de datos",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
