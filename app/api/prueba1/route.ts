import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"

// GET: Obtener todos los registros de prueba1
export async function GET() {
  try {
    const supabase = createServerSupabase()
    const { data, error } = await supabase.from("prueba1").select("*")

    if (error) {
      console.error("Error al obtener datos de prueba1:", error)
      return NextResponse.json(
        {
          status: "error",
          message: "Error al obtener datos",
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "success",
      data,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error al procesar la solicitud",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// POST: Crear un nuevo registro en prueba1
export async function POST() {
  try {
    const supabase = createServerSupabase()
    const { data, error } = await supabase.from("prueba1").insert([{}]).select()

    if (error) {
      console.error("Error al insertar en prueba1:", error)
      return NextResponse.json(
        {
          status: "error",
          message: "Error al insertar datos",
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "success",
      message: "Registro creado correctamente",
      data,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error al procesar la solicitud",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
