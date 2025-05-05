import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Inicializar el cliente de Supabase con la clave de servicio
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Función para verificar si una tabla existe
async function tableExists(tableName: string) {
  try {
    const { data, error, count } = await supabase.from(tableName).select("*", { count: "exact", head: true })
    return {
      exists: !error,
      error: error ? error.message : null,
      count: count || 0,
    }
  } catch (error) {
    console.error(`Error al verificar la tabla ${tableName}:`, error)
    return {
      exists: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      count: 0,
    }
  }
}

// Función para crear las tablas
async function createTables() {
  try {
    // Crear extensión uuid-ossp si no existe
    const { error: extensionError } = await supabase.rpc("create_uuid_extension", {})
    if (extensionError && !extensionError.message.includes("already exists")) {
      console.error("Error al crear extensión uuid-ossp:", extensionError)
      // Continuar de todos modos
    }

    // SQL para crear todas las tablas
    const sql = `
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
    `

    // Ejecutar SQL
    const { error: sqlError } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (sqlError) {
      console.error("Error al ejecutar SQL:", sqlError)
      return {
        success: false,
        error: sqlError.message,
      }
    }

    // Insertar datos iniciales
    const defaultUser = {
      id: "00000000-0000-0000-0000-000000000000",
      name: "Usuario por Defecto",
      email: "default@example.com",
    }

    const { error: userError } = await supabase.from("users").upsert([defaultUser], {
      onConflict: "id",
      ignoreDuplicates: false,
    })

    if (userError && !userError.message.includes("duplicate")) {
      console.error("Error al insertar usuario por defecto:", userError)
    }

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

    const { error: accountsError } = await supabase.from("accounts").upsert(defaultAccounts, {
      onConflict: "name,user_id",
      ignoreDuplicates: true,
    })

    if (accountsError && !accountsError.message.includes("duplicate")) {
      console.error("Error al insertar cuentas por defecto:", accountsError)
    }

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

    const { error: paymentMethodsError } = await supabase.from("payment_methods").upsert(defaultPaymentMethods, {
      onConflict: "name,user_id",
      ignoreDuplicates: true,
    })

    if (paymentMethodsError && !paymentMethodsError.message.includes("duplicate")) {
      console.error("Error al insertar métodos de pago por defecto:", paymentMethodsError)
    }

    return {
      success: true,
      message: "Tablas creadas correctamente",
    }
  } catch (error) {
    console.error("Error al crear tablas:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

// Ruta GET para verificar el estado de la base de datos
export async function GET() {
  try {
    // Verificar conexión a Supabase
    const { data, error } = await supabase.from("_dummy_query_").select("*").limit(1)

    const isConnected = !error || error.code === "PGRST116" // PGRST116 es "relación no existe", lo que significa que la conexión funciona

    // Verificar variables de entorno
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
    }

    // Verificar tablas
    const tables = {
      users: await tableExists("users"),
      accounts: await tableExists("accounts"),
      payment_methods: await tableExists("payment_methods"),
      transactions: await tableExists("transactions"),
      installments: await tableExists("installments"),
    }

    return NextResponse.json({
      status: isConnected ? "success" : "error",
      message: isConnected ? "Conexión exitosa a Supabase" : "Error al conectar con Supabase",
      env: envVars,
      tables,
    })
  } catch (error) {
    console.error("Error al verificar el estado de la base de datos:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error al verificar el estado de la base de datos",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// Ruta POST para crear las tablas
export async function POST() {
  try {
    const result = await createTables()

    if (!result.success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Error al crear las tablas",
          error: result.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "success",
      message: "Tablas creadas correctamente",
    })
  } catch (error) {
    console.error("Error al crear las tablas:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error al crear las tablas",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
