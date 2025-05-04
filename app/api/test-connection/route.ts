import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
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

    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: {
        ssl: { rejectUnauthorized: false },
      },
    })

    const requiredTables = [
      "users",
      "transactions",
      "installments",
      "services",
      "service_history",
      "savings_goals",
      "savings_deposits",
    ]

    const existingTables: string[] = []
    const missingTables: string[] = []

    // Verificar cada tabla individualmente
    for (const tableName of requiredTables) {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })

      if (error) {
        missingTables.push(tableName)
      } else {
        existingTables.push(tableName)
      }
    }

    if (missingTables.length > 0) {
      return NextResponse.json({
        status: "warning",
        message: "Conexión exitosa pero faltan algunas tablas",
        missingTables,
        existingTables,
      })
    }

    return NextResponse.json({
      status: "success",
      message: "Conexión exitosa a la base de datos",
      tables: existingTables,
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
