import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"
import { checkEnvVariables } from "@/lib/env-check"

export async function GET() {
  try {
    // Verificar variables de entorno
    const envCheck = checkEnvVariables()

    if (!envCheck.isValid) {
      return NextResponse.json(
        {
          status: "error",
          message: "Faltan variables de entorno",
          details: {
            missing: envCheck.missing,
          },
        },
        { status: 400 },
      )
    }

    // Crear cliente de Supabase
    const supabase = createServerSupabase()

    // Intentar una consulta simple
    const { data, error } = await supabase.from("_dummy_query_").select("*").limit(1)

    // Si hay un error específico de "relación no existe", la conexión está bien
    const isConnected = !error || error.code === "PGRST116"

    if (!isConnected) {
      return NextResponse.json(
        {
          status: "error",
          message: "Error al conectar con Supabase",
          details: {
            error: error?.message,
            code: error?.code,
            hint: error?.hint,
            details: error?.details,
          },
          env: envCheck.variables,
        },
        { status: 500 },
      )
    }

    // Verificar tablas existentes
    const tables = ["users", "accounts", "payment_methods", "transactions", "installments"]
    const tableResults = {}

    for (const table of tables) {
      const { data, error, count } = await supabase.from(table).select("*", { count: "exact", head: true })
      tableResults[table] = {
        exists: !error,
        error: error ? error.message : null,
        count: count || 0,
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Conexión exitosa a Supabase",
      env: envCheck.variables,
      tables: tableResults,
    })
  } catch (error) {
    console.error("Error al verificar la conexión:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error al verificar la conexión",
        details: {
          error: error instanceof Error ? error.message : "Error desconocido",
          stack: error instanceof Error ? error.stack : null,
        },
      },
      { status: 500 },
    )
  }
}
