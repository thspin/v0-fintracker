import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json(
        {
          error: "Se requiere SQL para ejecutar",
        },
        { status: 400 },
      )
    }

    const supabase = createServerSupabase()

    // Ejecutar SQL directamente
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("Error al ejecutar SQL:", error)

      // Intentar ejecutar cada declaración por separado
      const statements = sql.split(";").filter((stmt) => stmt.trim())
      const results = []

      for (const stmt of statements) {
        try {
          // Usar la API REST para ejecutar SQL
          const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
            },
            body: JSON.stringify({ sql_query: stmt.trim() }),
          })

          const result = await response.json()
          results.push({ statement: stmt.trim(), result })
        } catch (stmtError) {
          results.push({
            statement: stmt.trim(),
            error: stmtError instanceof Error ? stmtError.message : "Error desconocido",
          })
        }
      }

      return NextResponse.json(
        {
          error: error.message,
          details: error,
          statements: results,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "SQL ejecutado correctamente",
    })
  } catch (error) {
    console.error("Error al ejecutar SQL:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
