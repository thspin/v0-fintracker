import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

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

    // Crear tablas usando SQL directo a través de la API REST de Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        query: `
          -- Crear tabla de usuarios si no existe
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Crear tabla de cuentas si no existe
          CREATE TABLE IF NOT EXISTS accounts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
            currency VARCHAR(10) NOT NULL DEFAULT 'ARS',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Crear tabla de métodos de pago si no existe
          CREATE TABLE IF NOT EXISTS payment_methods (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Crear tabla de transacciones si no existe
          CREATE TABLE IF NOT EXISTS transactions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            type VARCHAR(50) NOT NULL,
            amount DECIMAL(12, 2) NOT NULL,
            currency VARCHAR(10) NOT NULL DEFAULT 'ARS',
            category VARCHAR(100) NOT NULL,
            date DATE NOT NULL,
            account VARCHAR(100),
            payment_method VARCHAR(100),
            description TEXT,
            interest DECIMAL(12, 2),
            installments INTEGER,
            installment_type VARCHAR(50),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Crear tabla de cuotas para transacciones de crédito si no existe
          CREATE TABLE IF NOT EXISTS installments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            transaction_id UUID NOT NULL,
            installment_number INTEGER NOT NULL,
            amount DECIMAL(12, 2) NOT NULL,
            due_date DATE NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        {
          error: "Error al crear tablas",
          details: errorData,
        },
        { status: 500 },
      )
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
