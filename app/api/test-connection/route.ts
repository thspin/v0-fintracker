import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Obtener las variables de entorno
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          error: "Faltan variables de entorno",
          variables: {
            supabaseUrl: !!supabaseUrl,
            supabaseKey: !!supabaseKey,
          },
        },
        { status: 500 },
      )
    }

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Probar la conexión intentando acceder directamente a las tablas que sabemos que existen
    // en lugar de consultar pg_tables
    const requiredTables = [
      "users",
      "transactions",
      "installments",
      "services",
      "service_history",
      "savings_goals",
      "savings_deposits",
    ]

    const existingTables = []
    const missingTables = []

    // Verificar cada tabla individualmente
    for (const tableName of requiredTables) {
      const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true })

      if (error) {
        missingTables.push(tableName)
      } else {
        existingTables.push(tableName)
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Conexión exitosa a la base de datos",
      tables: existingTables,
      missingTables: missingTables.length > 0 ? missingTables : undefined,
    })
  } catch (error) {
    console.error("Error al probar la conexión:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error desconocido",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
