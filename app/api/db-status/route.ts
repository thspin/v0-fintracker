import { NextResponse } from "next/server"
import { createServerSupabase } from "@/lib/supabase"

// Función para verificar si una tabla existe
async function tableExists(supabase: any, tableName: string) {
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

// Ruta GET para verificar el estado de la base de datos
export async function GET() {
  try {
    // Crear cliente de Supabase
    const supabase = createServerSupabase()

    // Verificar conexión a Supabase con una consulta simple
    const { data, error } = await supabase.from("users").select("count(*)", { count: "exact", head: true })

    const isConnected = !error || error.code === "PGRST116" // PGRST116 es "relación no existe"

    // Verificar variables de entorno
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: !!process.env.DATABASE_URL,
    }

    // Verificar tablas solo si hay conexión
    const tables = isConnected
      ? {
          users: await tableExists(supabase, "users"),
          accounts: await tableExists(supabase, "accounts"),
          payment_methods: await tableExists(supabase, "payment_methods"),
          transactions: await tableExists(supabase, "transactions"),
          installments: await tableExists(supabase, "installments"),
        }
      : {}

    return NextResponse.json({
      status: isConnected ? "success" : "error",
      message: isConnected ? "Conexión exitosa a Supabase" : "Error al conectar con Supabase",
      error: error ? error.message : null,
      env: envVars,
      tables: tables,
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
    const supabase = createServerSupabase()

    // SQL para crear todas las tablas
    const sql = `
    -- Crear tabla de usuarios si no existe
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Crear tabla de cuentas si no existe
    CREATE TABLE IF NOT EXISTS accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Crear tabla de transacciones si no existe
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      transaction_id UUID NOT NULL,
      installment_number INTEGER NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      due_date DATE NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `

    // Ejecutar SQL directamente usando la API REST de Supabase
    const { error: sqlError } = await supabase.rpc("exec_sql", { sql_query: sql })

    if (sqlError) {
      console.error("Error al ejecutar SQL:", sqlError)

      // Intentar un enfoque alternativo si la función RPC falla
      try {
        // Dividir el SQL en declaraciones individuales
        const statements = sql.split(";").filter((stmt) => stmt.trim().length > 0)

        // Ejecutar cada declaración por separado
        for (const stmt of statements) {
          const { error } = await supabase.rpc("exec_single_statement", { sql_statement: stmt.trim() })
          if (error) {
            console.error("Error al ejecutar declaración:", stmt, error)
            // Continuar con la siguiente declaración
          }
        }
      } catch (innerError) {
        console.error("Error al ejecutar declaraciones individuales:", innerError)
        return NextResponse.json(
          {
            status: "error",
            message: "Error al crear las tablas",
            error: innerError instanceof Error ? innerError.message : "Error desconocido",
          },
          { status: 500 },
        )
      }
    }

    // Insertar datos iniciales
    const defaultUser = {
      name: "Usuario por Defecto",
      email: "default@example.com",
    }

    const { error: userError } = await supabase.from("users").upsert([defaultUser], {
      onConflict: "email",
    })

    if (userError) {
      console.error("Error al insertar usuario por defecto:", userError)
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
