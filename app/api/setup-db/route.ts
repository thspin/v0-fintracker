import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabase()

    // Verificar si las tablas existen
    const { error: usersError } = await supabase.from("users").select("id").limit(1)
    const { error: transactionsError } = await supabase.from("transactions").select("id").limit(1)
    const { error: accountsError } = await supabase.from("accounts").select("id").limit(1)
    const { error: paymentMethodsError } = await supabase.from("payment_methods").select("id").limit(1)
    const { error: installmentsError } = await supabase.from("installments").select("id").limit(1)

    const tablesStatus = {
      users: !usersError,
      transactions: !transactionsError,
      accounts: !accountsError,
      payment_methods: !paymentMethodsError,
      installments: !installmentsError,
    }

    // Si todas las tablas existen, no necesitamos hacer nada más
    if (Object.values(tablesStatus).every((exists) => exists)) {
      return NextResponse.json({
        success: true,
        message: "Todas las tablas ya existen",
        tablesStatus,
      })
    }

    // Crear tablas una por una
    const createTables = async () => {
      // Crear tabla de usuarios
      if (usersError) {
        const { error } = await supabase.rpc("create_users_table")
        if (error) console.error("Error al crear tabla users:", error)
      }

      // Crear tabla de cuentas
      if (accountsError) {
        const { error } = await supabase.rpc("create_accounts_table")
        if (error) console.error("Error al crear tabla accounts:", error)
      }

      // Crear tabla de métodos de pago
      if (paymentMethodsError) {
        const { error } = await supabase.rpc("create_payment_methods_table")
        if (error) console.error("Error al crear tabla payment_methods:", error)
      }

      // Crear tabla de transacciones
      if (transactionsError) {
        const { error } = await supabase.rpc("create_transactions_table")
        if (error) console.error("Error al crear tabla transactions:", error)
      }

      // Crear tabla de cuotas
      if (installmentsError) {
        const { error } = await supabase.rpc("create_installments_table")
        if (error) console.error("Error al crear tabla installments:", error)
      }
    }

    // Intentar crear las tablas
    try {
      await createTables()
    } catch (error) {
      console.error("Error al crear tablas:", error)

      // Si falla, intentar crear las tablas usando SQL en línea
      return NextResponse.json({
        success: false,
        message: "Error al crear tablas usando RPC. Por favor, crea las tablas manualmente usando SQL.",
        error: error instanceof Error ? error.message : "Error desconocido",
        instructions: "Visita /api/setup-db/sql para ver el SQL necesario para crear las tablas.",
      })
    }

    // Insertar datos iniciales
    if (usersError) {
      // Insertar usuario por defecto
      const { error: insertUserError } = await supabase
        .from("users")
        .insert([
          { id: "00000000-0000-0000-0000-000000000000", name: "Usuario por Defecto", email: "default@example.com" },
        ])

      if (insertUserError) {
        console.error("Error al insertar usuario por defecto:", insertUserError)
      }
    }

    if (accountsError) {
      // Insertar cuentas por defecto
      const defaultAccounts = [
        {
          user_id: "00000000-0000-0000-0000-000000000000",
          name: "Efectivo",
          type: "cash",
          balance: 0,
          currency: "ARS",
        },
        {
          user_id: "00000000-0000-0000-0000-000000000000",
          name: "Banco Santander",
          type: "bank",
          balance: 0,
          currency: "ARS",
        },
        {
          user_id: "00000000-0000-0000-0000-000000000000",
          name: "Mercado Pago",
          type: "digital_wallet",
          balance: 0,
          currency: "ARS",
        },
      ]

      const { error: insertAccountsError } = await supabase.from("accounts").insert(defaultAccounts)

      if (insertAccountsError) {
        console.error("Error al insertar cuentas por defecto:", insertAccountsError)
      }
    }

    if (paymentMethodsError) {
      // Insertar métodos de pago por defecto
      const defaultPaymentMethods = [
        {
          user_id: "00000000-0000-0000-0000-000000000000",
          name: "Efectivo",
          type: "cash",
        },
        {
          user_id: "00000000-0000-0000-0000-000000000000",
          name: "Tarjeta de Débito",
          type: "debit",
        },
        {
          user_id: "00000000-0000-0000-0000-000000000000",
          name: "Tarjeta de Crédito",
          type: "credit",
        },
        {
          user_id: "00000000-0000-0000-0000-000000000000",
          name: "Transferencia",
          type: "transfer",
        },
      ]

      const { error: insertPaymentMethodsError } = await supabase.from("payment_methods").insert(defaultPaymentMethods)

      if (insertPaymentMethodsError) {
        console.error("Error al insertar métodos de pago por defecto:", insertPaymentMethodsError)
      }
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
