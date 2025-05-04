import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar datos requeridos
    if (!body.service_id || !body.amount || !body.date) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Insertar el registro de historial
    const { data, error } = await supabase
      .from("service_history")
      .insert([
        {
          service_id: body.service_id,
          amount: body.amount,
          date: body.date,
          status: body.status || "paid",
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ history: data[0] }, { status: 201 })
  } catch (error) {
    console.error("Error al registrar pago de servicio:", error)
    return NextResponse.json({ error: "Error al registrar pago de servicio" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let query = supabase.from("service_history").select("*").order("date", { ascending: false })

    // Aplicar filtros si existen
    if (serviceId) query = query.eq("service_id", serviceId)
    if (startDate) query = query.gte("date", startDate)
    if (endDate) query = query.lte("date", endDate)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ history: data })
  } catch (error) {
    console.error("Error al obtener historial de servicios:", error)
    return NextResponse.json({ error: "Error al obtener historial de servicios" }, { status: 500 })
  }
}
