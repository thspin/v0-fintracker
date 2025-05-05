import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabase()
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
      console.error("Error al obtener transacciones:", error)
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
    const supabase = createServerSupabase()
    const body = await request.json()

    console.log("Datos recibidos:", JSON.stringify(body, null, 2))

    // Validar datos requeridos
    if (!body.type || !body.amount || !body.category || !body.date) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Preparar los datos para insertar
    const transactionData = {
      user_id: body.user_id || "00000000-0000-0000-0000-000000000000", // Usar un ID de usuario por defecto
      type: body.type,
      amount: body.amount,
      currency: body.currency || "ARS",
      category: body.category,
      date: body.date,
      account: body.account || null,
      payment_method: body.payment_method || body.paymentMethod || null,
      description: body.description || "",
      interest: body.interest || null,
      installments: body.installments || null,
      installment_type: body.installment_type || body.installmentType || null,
    }

    // Insertar la transacción
    const { data, error } = await supabase.from("transactions").insert([transactionData]).select()

    if (error) {
      console.error("Error al crear transacción:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Si hay cuotas personalizadas, guardarlas
    if (
      body.type === "credit" &&
      (body.installment_type === "custom" || body.installmentType === "custom") &&
      body.customInstallments
    ) {
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
        console.error("Error al guardar cuotas:", installmentsError)
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
    const supabase = createServerSupabase()
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
        account: body.account,
        payment_method: body.payment_method || body.paymentMethod,
        description: body.description,
        interest: body.interest,
        installments: body.installments,
        installment_type: body.installment_type || body.installmentType,
      })
      .eq("id", body.id)
      .select()

    if (error) {
      console.error("Error al actualizar transacción:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Actualizar cuotas personalizadas si es necesario
    if (
      body.type === "credit" &&
      (body.installment_type === "custom" || body.installmentType === "custom") &&
      body.customInstallments
    ) {
      // Primero eliminar las cuotas existentes
      const { error: deleteError } = await supabase.from("installments").delete().eq("transaction_id", body.id)

      if (deleteError) {
        console.error("Error al eliminar cuotas:", deleteError)
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
        console.error("Error al guardar cuotas:", installmentsError)
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
    const supabase = createServerSupabase()
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
      console.error("Error al eliminar transacción:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar transacción:", error)
    return NextResponse.json({ error: "Error al eliminar transacción" }, { status: 500 })
  }
}
