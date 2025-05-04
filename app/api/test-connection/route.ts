import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Obtener las variables de entorno
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          error: "Faltan variables de entorno",
          variables: {
            supabaseUrl: !!supabaseUrl,
            supabaseKey: !!supabaseKey,
          },
        },
        { status: 500 },
      )
    }

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Probar la conexión listando las tablas
    const { data: tables, error } = await supabase.from("pg_tables").select("tablename").eq("schemaname", "public")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Verificar si las tablas necesarias existen
    const requiredTables = [
      "users",
      "transactions",
      "installments",
      "services",
      "service_history",
      "savings_goals",
      "savings_deposits",
    ]
    const existingTables = tables.map((t) => t.tablename)
    const missingTables = requiredTables.filter((t) => !existingTables.includes(t))

    // Si faltan tablas, intentar crearlas
    if (missingTables.length > 0) {
      // Intentar crear las tablas que faltan
      await createTables(supabase)

      // Verificar nuevamente las tablas
      const { data: updatedTables, error: updateError } = await supabase
        .from("pg_tables")
        .select("tablename")
        .eq("schemaname", "public")

      if (updateError) {
        return NextResponse.json(
          {
            error: updateError.message,
            message: "Error al verificar tablas después de la creación",
          },
          { status: 500 },
        )
      }

      const updatedExistingTables = updatedTables.map((t) => t.tablename)
      const stillMissingTables = requiredTables.filter((t) => !updatedExistingTables.includes(t))

      if (stillMissingTables.length > 0) {
        return NextResponse.json({
          status: "warning",
          message: "Conexión exitosa pero faltan algunas tablas",
          missingTables: stillMissingTables,
          existingTables: updatedExistingTables,
        })
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Conexión exitosa a la base de datos",
      tables: existingTables,
    })
  } catch (error) {
    console.error("Error al probar la conexión:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error desconocido",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

async function createTables(supabase: any) {
  try {
    // Crear extensión uuid-ossp si no existe
    await supabase
      .rpc("create_uuid_extension", {
        sql_query: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
      })
      .catch(() => {
        // Si falla, es posible que la función RPC no exista
        console.log("No se pudo crear la extensión uuid-ossp mediante RPC")
      })

    // Crear tabla de usuarios
    await supabase
      .rpc("execute_sql", {
        sql_query: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      })
      .catch((err: any) => console.error("Error al crear tabla users:", err))

    // Crear tabla de transacciones
    await supabase
      .rpc("execute_sql", {
        sql_query: `
        CREATE TABLE IF NOT EXISTS transactions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense', 'credit')),
          amount DECIMAL(12, 2) NOT NULL,
          currency VARCHAR(10) NOT NULL DEFAULT 'ARS',
          category VARCHAR(100) NOT NULL,
          date DATE NOT NULL,
          payment_method VARCHAR(100) NOT NULL,
          description TEXT,
          interest DECIMAL(12, 2) NULL,
          installments INTEGER NULL,
          installment_type VARCHAR(50) NULL CHECK (installment_type IN ('equal', 'custom')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      })
      .catch((err: any) => console.error("Error al crear tabla transactions:", err))

    // Crear tabla de cuotas
    await supabase
      .rpc("execute_sql", {
        sql_query: `
        CREATE TABLE IF NOT EXISTS installments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
          installment_number INTEGER NOT NULL,
          amount DECIMAL(12, 2) NOT NULL,
          due_date DATE NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      })
      .catch((err: any) => console.error("Error al crear tabla installments:", err))

    // Crear tabla de servicios
    await supabase
      .rpc("execute_sql", {
        sql_query: `
        CREATE TABLE IF NOT EXISTS services (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          amount DECIMAL(12, 2) NOT NULL,
          due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
          category VARCHAR(100) NOT NULL,
          is_automatic BOOLEAN NOT NULL DEFAULT FALSE,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      })
      .catch((err: any) => console.error("Error al crear tabla services:", err))

    // Crear tabla de historial de servicios
    await supabase
      .rpc("execute_sql", {
        sql_query: `
        CREATE TABLE IF NOT EXISTS service_history (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          service_id UUID REFERENCES services(id) ON DELETE CASCADE,
          amount DECIMAL(12, 2) NOT NULL,
          date DATE NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'overdue')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      })
      .catch((err: any) => console.error("Error al crear tabla service_history:", err))

    // Crear tabla de objetivos de ahorro
    await supabase
      .rpc("execute_sql", {
        sql_query: `
        CREATE TABLE IF NOT EXISTS savings_goals (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          target_amount DECIMAL(12, 2) NOT NULL,
          current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
          deadline DATE NULL,
          category VARCHAR(100) NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      })
      .catch((err: any) => console.error("Error al crear tabla savings_goals:", err))

    // Crear tabla de depósitos de ahorro
    await supabase
      .rpc("execute_sql", {
        sql_query: `
        CREATE TABLE IF NOT EXISTS savings_deposits (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          goal_id UUID REFERENCES savings_goals(id) ON DELETE CASCADE,
          amount DECIMAL(12, 2) NOT NULL,
          date DATE NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
      })
      .catch((err: any) => console.error("Error al crear tabla savings_deposits:", err))

    // Crear índices para mejorar el rendimiento
    await supabase
      .rpc("execute_sql", {
        sql_query: `
        CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
        CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
        CREATE INDEX IF NOT EXISTS idx_services_user_id ON services(user_id);
        CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
      `,
      })
      .catch((err: any) => console.error("Error al crear índices:", err))

    // Crear función para actualizar timestamps
    await supabase
      .rpc("execute_sql", {
        sql_query: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `,
      })
      .catch((err: any) => console.error("Error al crear función update_updated_at_column:", err))

    // Crear triggers
    await supabase
      .rpc("execute_sql", {
        sql_query: `
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `,
      })
      .catch((err: any) => console.error("Error al crear trigger para users:", err))

    await supabase
      .rpc("execute_sql", {
        sql_query: `
        DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
        CREATE TRIGGER update_transactions_updated_at
        BEFORE UPDATE ON transactions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `,
      })
      .catch((err: any) => console.error("Error al crear trigger para transactions:", err))

    await supabase
      .rpc("execute_sql", {
        sql_query: `
        DROP TRIGGER IF EXISTS update_services_updated_at ON services;
        CREATE TRIGGER update_services_updated_at
        BEFORE UPDATE ON services
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `,
      })
      .catch((err: any) => console.error("Error al crear trigger para services:", err))

    await supabase
      .rpc("execute_sql", {
        sql_query: `
        DROP TRIGGER IF EXISTS update_savings_goals_updated_at ON savings_goals;
        CREATE TRIGGER update_savings_goals_updated_at
        BEFORE UPDATE ON savings_goals
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `,
      })
      .catch((err: any) => console.error("Error al crear trigger para savings_goals:", err))
  } catch (error) {
    console.error("Error al crear tablas:", error)
    throw error
  }
}
