import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json({ error: "Se requiere SQL" }, { status: 400 })
    }

    const supabase = createServerSupabase()

    // Ejecutar SQL directamente usando la API de Supabase
    const { data, error } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (error) {
      console.error("Error al ejecutar SQL:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "SQL ejecutado correctamente",
      data,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
