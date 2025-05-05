import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Leer el archivo SQL
    const sqlFilePath = path.join(process.cwd(), "app/api/setup-db/setup.sql")
    let sqlContent

    try {
      sqlContent = fs.readFileSync(sqlFilePath, "utf8")
    } catch (error) {
      console.error("Error al leer el archivo SQL:", error)
      return NextResponse.json(
        {
          error: "Error al leer el archivo SQL",
          details: error instanceof Error ? error.message : "Error desconocido",
        },
        { status: 500 },
      )
    }

    // Ejecutar el script SQL
    const { error } = await supabase.rpc("exec_sql", { sql: sqlContent })

    if (error) {
      console.error("Error al ejecutar el script SQL:", error)

      // Intentar ejecutar las consultas una por una
      const queries = sqlContent.split(";").filter((query) => query.trim() !== "")

      const results = []
      for (const query of queries) {
        try {
          const { error } = await supabase.rpc("exec_sql", { sql: query + ";" })
          results.push({
            query: query.substring(0, 50) + "...",
            success: !error,
            error: error ? error.message : null,
          })
        } catch (err) {
          results.push({
            query: query.substring(0, 50) + "...",
            success: false,
            error: err instanceof Error ? err.message : "Error desconocido",
          })
        }
      }

      return NextResponse.json(
        {
          error: "Error al ejecutar algunas consultas SQL",
          details: error.message,
          results,
        },
        { status: 500 },
      )
    }

    // Verificar que las tablas se hayan creado correctamente
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

    return NextResponse.json({
      success: true,
      message: "Base de datos configurada correctamente",
      tables: tableStatus,
    })
  } catch (error) {
    console.error("Error al configurar la base de datos:", error)
    return NextResponse.json(
      {
        error: "Error al configurar la base de datos",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
