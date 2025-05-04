import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const category = searchParams.get("category")
    const isActive = searchParams.get("isActive")

    let query = supabase.from("services").select("*, service_history(*)").order("name")

    // Aplicar filtros si existen
    if (userId) query = query.eq("user_id", userId)
    if (category) query = query.eq("category", category)
    if (isActive) query = query.eq("is_active", isActive === "true")

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ services: data })
  } catch (error) {
    console.error("Error al obtener servicios:", error)
    return NextResponse.json({ error: "Error al obtener servicios" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar datos requeridos
    if (!body.user_id || !body.name || !body.amount || !body.due_day || !body.category) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Insertar el servicio
    const { data, error } = await supabase
      .from("services")
      .insert([
        {
          user_id: body.user_id,
          name: body.name,
          amount: body.amount,
          due_day: body.due_day,
          category: body.category,
          is_automatic: body.is_automatic || false,
          is_active: true,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ service: data[0] }, { status: 201 })
  } catch (error) {
    console.error("Error al crear servicio:", error)
    return NextResponse.json({ error: "Error al crear servicio" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: "Se requiere el ID del servicio" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("services")
      .update({
        name: body.name,
        amount: body.amount,
        due_day: body.due_day,
        category: body.category,
        is_automatic: body.is_automatic,
        is_active: body.is_active,
      })
      .eq("id", body.id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ service: data[0] })
  } catch (error) {
    console.error("Error al actualizar servicio:", error)
    return NextResponse.json({ error: "Error al actualizar servicio" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Se requiere el ID del servicio" }, { status: 400 })
    }

    // Primero eliminar el historial asociado
    await supabase.from("service_history").delete().eq("service_id", id)

    // Luego eliminar el servicio
    const { error } = await supabase.from("services").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar servicio:", error)
    return NextResponse.json({ error: "Error al eliminar servicio" }, { status: 500 })
  }
}
