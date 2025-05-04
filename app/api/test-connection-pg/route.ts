import { NextResponse } from "next/server"
import { Pool } from "pg"

export async function GET() {
  try {
    // Obtener la URL de conexión de PostgreSQL
    const connectionString = process.env.POSTGRES_URL

    if (!connectionString) {
      return NextResponse.json({ error: "Falta la variable de entorno POSTGRES_URL" }, { status: 500 })
    }

    // Crear un pool de conexiones
    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    })

    // Probar la conexión
    const client = await pool.connect()

    try {
      // Verificar las tablas existentes
      const { rows } = await client.query(`
        SELECT tablename 
        FROM pg_catalog.pg_tables 
        WHERE schemaname = 'public';
      `)

      const existingTables = rows.map((row) => row.tablename)
      const requiredTables = [
        "users",
        "transactions",
        "installments",
        "services",
        "service_history",
        "savings_goals",
        "savings_deposits",
      ]
      const missingTables = requiredTables.filter((t) => !existingTables.includes(t))

      // Si faltan tablas, intentar crearlas
      if (missingTables.length > 0) {
        // Crear extensión uuid-ossp si no existe
        await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

        // Crear tablas que faltan
        if (!existingTables.includes("users")) {
          await client.query(`
            CREATE TABLE IF NOT EXISTS users (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              name VARCHAR(255) NOT NULL,
              email VARCHAR(255) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `)
        }

        if (!existingTables.includes("transactions")) {
          await client.query(`
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
          `)
        }

        if (!existingTables.includes("installments")) {
          await client.query(`
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
          `)
        }

        if (!existingTables.includes("services")) {
          await client.query(`
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
          `)
        }

        if (!existingTables.includes("service_history")) {
          await client.query(`
            CREATE TABLE IF NOT EXISTS service_history (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              service_id UUID REFERENCES services(id) ON DELETE CASCADE,
              amount DECIMAL(12, 2) NOT NULL,
              date DATE NOT NULL,
              status VARCHAR(50) NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'overdue')),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `)
        }

        if (!existingTables.includes("savings_goals")) {
          await client.query(`
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
          `)
        }

        if (!existingTables.includes("savings_deposits")) {
          await client.query(`
            CREATE TABLE IF NOT EXISTS savings_deposits (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              goal_id UUID REFERENCES savings_goals(id) ON DELETE CASCADE,
              amount DECIMAL(12, 2) NOT NULL,
              date DATE NOT NULL,
              description TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `)
        }

        // Crear índices
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
          CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
          CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
          CREATE INDEX IF NOT EXISTS idx_services_user_id ON services(user_id);
          CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
        `)

        // Crear función para actualizar timestamps
        await client.query(`
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `)

        // Crear triggers
        await client.query(`
          DROP TRIGGER IF EXISTS update_users_updated_at ON users;
          CREATE TRIGGER update_users_updated_at
          BEFORE UPDATE ON users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        `)

        await client.query(`
          DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
          CREATE TRIGGER update_transactions_updated_at
          BEFORE UPDATE ON transactions
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        `)

        await client.query(`
          DROP TRIGGER IF EXISTS update_services_updated_at ON services;
          CREATE TRIGGER update_services_updated_at
          BEFORE UPDATE ON services
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        `)

        await client.query(`
          DROP TRIGGER IF EXISTS update_savings_goals_updated_at ON savings_goals;
          CREATE TRIGGER update_savings_goals_updated_at
          BEFORE UPDATE ON savings_goals
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
        `)

        // Verificar nuevamente las tablas
        const { rows: updatedRows } = await client.query(`
          SELECT tablename 
          FROM pg_catalog.pg_tables 
          WHERE schemaname = 'public';
        `)

        const updatedExistingTables = updatedRows.map((row) => row.tablename)
        const stillMissingTables = requiredTables.filter((t) => !updatedExistingTables.includes(t))

        if (stillMissingTables.length > 0) {
          return NextResponse.json({
            status: "warning",
            message: "Conexión exitosa pero faltan algunas tablas",
            missingTables: stillMissingTables,
            existingTables: updatedExistingTables,
          })
        }

        return NextResponse.json({
          status: "success",
          message: "Conexión exitosa y tablas creadas correctamente",
          tables: updatedExistingTables,
        })
      }

      return NextResponse.json({
        status: "success",
        message: "Conexión exitosa a la base de datos PostgreSQL",
        tables: existingTables,
      })
    } finally {
      // Liberar el cliente
      client.release()

      // Cerrar el pool
      await pool.end()
    }
  } catch (error) {
    console.error("Error al probar la conexión PostgreSQL:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error desconocido",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
