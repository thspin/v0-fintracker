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
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const category = searchParams.get("category")

    let query = supabase.from("transactions").select("*").order("date", { ascending: false })

    // Aplicar filtros si existen
    if (userId) query = query.eq("user_id", userId)
    if (type) query = query.eq("type", type)
    if (category) query = query.eq("category", category)
    if (startDate) query = query.gte("date", startDate)
    if (endDate) query = query.lte("date", endDate)

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ transactions: data })
  } catch (error) {
    console.error("Error al obtener transacciones:", error)
    return NextResponse.json({ error: "Error al obtener transacciones" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar datos requeridos
    if (!body.user_id || !body.type || !body.amount || !body.category || !body.date) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Insertar la transacción
    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          user_id: body.user_id,
          type: body.type,
          amount: body.amount,
          currency: body.currency || "ARS",
          category: body.category,
          date: body.date,
          payment_method: body.paymentMethod,
          description: body.description || "",
          interest: body.interest || null,
          installments: body.installments || null,
          installment_type: body.installmentType || null,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Si hay cuotas personalizadas, guardarlas
    if (body.type === "credit" && body.installmentType === "custom" && body.customInstallments) {
      const transactionId = data[0].id

      const installmentsData = body.customInstallments.map((installment: any) => ({
        transaction_id: transactionId,
        installment_number: installment.number,
        amount: installment.amount,
        due_date: new Date(new Date(body.date).setMonth(new Date(body.date).getMonth() + installment.number - 1))
          .toISOString()
          .split("T")[0],
      }))

      const { error: installmentsError } = await supabase.from("installments").insert(installmentsData)

      if (installmentsError) {
        return NextResponse.json({ error: installmentsError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ transaction: data[0] }, { status: 201 })
  } catch (error) {
    console.error("Error al crear transacción:", error)
    return NextResponse.json({ error: "Error al crear transacción" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: "Se requiere el ID de la transacción" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("transactions")
      .update({
        type: body.type,
        amount: body.amount,
        currency: body.currency,
        category: body.category,
        date: body.date,
        payment_method: body.paymentMethod,
        description: body.description,
        interest: body.interest,
        installments: body.installments,
        installment_type: body.installmentType,
      })
      .eq("id", body.id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Actualizar cuotas personalizadas si es necesario
    if (body.type === "credit" && body.installmentType === "custom" && body.customInstallments) {
      // Primero eliminar las cuotas existentes
      const { error: deleteError } = await supabase.from("installments").delete().eq("transaction_id", body.id)

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 })
      }

      // Luego insertar las nuevas cuotas
      const installmentsData = body.customInstallments.map((installment: any) => ({
        transaction_id: body.id,
        installment_number: installment.number,
        amount: installment.amount,
        due_date: new Date(new Date(body.date).setMonth(new Date(body.date).getMonth() + installment.number - 1))
          .toISOString()
          .split("T")[0],
      }))

      const { error: installmentsError } = await supabase.from("installments").insert(installmentsData)

      if (installmentsError) {
        return NextResponse.json({ error: installmentsError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ transaction: data[0] })
  } catch (error) {
    console.error("Error al actualizar transacción:", error)
    return NextResponse.json({ error: "Error al actualizar transacción" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Se requiere el ID de la transacción" }, { status: 400 })
    }

    // Primero eliminar las cuotas asociadas si existen
    await supabase.from("installments").delete().eq("transaction_id", id)

    // Luego eliminar la transacción
    const { error } = await supabase.from("transactions").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar transacción:", error)
    return NextResponse.json({ error: "Error al eliminar transacción" }, { status: 500 })
  }
}
