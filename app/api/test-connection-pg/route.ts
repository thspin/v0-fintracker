// app/api/test-connection-pg/route.ts

// ① Deshabilita la verificación de certificados TLS
//    🛑 NO recomendado para producción con datos sensibles
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { NextResponse } from "next/server";
import type { PoolClient } from "pg";

export async function GET() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    return NextResponse.json(
      { error: "Falta la variable de entorno POSTGRES_URL" },
      { status: 500 }
    );
  }

  // ② Import dinámico solo de Pool; el tipo PoolClient viene del import type
  const { Pool } = await import("pg");
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  let client: PoolClient | undefined;

  try {
    client = await pool.connect();

    // 1) Listar tablas existentes
    const { rows } = await client.query<{ tablename: string }>(`
      SELECT tablename
        FROM pg_catalog.pg_tables
       WHERE schemaname = 'public';
    `);
    const existingTables = rows.map(r => r.tablename);

    const requiredTables = [
      "users",
      "transactions",
      "installments",
      "services",
      "service_history",
      "savings_goals",
      "savings_deposits",
    ];
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    // 2) Crear tablas que falten
    if (missingTables.length > 0) {
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

      if (missingTables.includes("users")) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
      }
      if (missingTables.includes("transactions")) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS transactions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(50) NOT NULL CHECK (type IN ('income','expense','credit')),
            amount DECIMAL(12,2) NOT NULL,
            currency VARCHAR(10) NOT NULL DEFAULT 'ARS',
            category VARCHAR(100) NOT NULL,
            date DATE NOT NULL,
            payment_method VARCHAR(100) NOT NULL,
            description TEXT,
            interest DECIMAL(12,2),
            installments INTEGER,
            installment_type VARCHAR(50) CHECK (installment_type IN ('equal','custom')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
      }
      if (missingTables.includes("installments")) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS installments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
            installment_number INTEGER NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            due_date DATE NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
      }
      if (missingTables.includes("services")) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS services (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            amount DECIMAL(12,2) NOT NULL,
            due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
            category VARCHAR(100) NOT NULL,
            is_automatic BOOLEAN NOT NULL DEFAULT FALSE,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
      }
      if (missingTables.includes("service_history")) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS service_history (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            service_id UUID REFERENCES services(id) ON DELETE CASCADE,
            amount DECIMAL(12,2) NOT NULL,
            date DATE NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'paid' CHECK (status IN ('pending','paid','overdue')),
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
      }
      if (missingTables.includes("savings_goals")) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS savings_goals (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            target_amount DECIMAL(12,2) NOT NULL,
            current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
            deadline DATE,
            category VARCHAR(100) NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
      }
      if (missingTables.includes("savings_deposits")) {
        await client.query(`
          CREATE TABLE IF NOT EXISTS savings_deposits (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            goal_id UUID REFERENCES savings_goals(id) ON DELETE CASCADE,
            amount DECIMAL(12,2) NOT NULL,
            date DATE NOT NULL,
            description TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
      }

      // Índices
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
        CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
        CREATE INDEX IF NOT EXISTS idx_services_user_id ON services(user_id);
        CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
      `);

      // Función y triggers para timestamps
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END; $$ LANGUAGE plpgsql;
      `);

      const triggers: Record<string,string> = {
        users: "update_users_updated_at",
        transactions: "update_transactions_updated_at",
        services: "update_services_updated_at",
        savings_goals: "update_savings_goals_updated_at",
      };
      for (const [table, triggerName] of Object.entries(triggers)) {
        await client.query(`
          DROP TRIGGER IF EXISTS ${triggerName} ON ${table};
          CREATE TRIGGER ${triggerName}
            BEFORE UPDATE ON ${table}
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        `);
      }
    }

    // 3) Re-listar tablas finales
    const { rows: finalRows } = await client.query<{ tablename: string }>(`
      SELECT tablename
        FROM pg_catalog.pg_tables
       WHERE schemaname = 'public';
    `);
    const allTables = finalRows.map(r => r.tablename);

    return NextResponse.json({
      status: "success",
      message: missingTables.length > 0
        ? "Conexión exitosa y tablas creadas correctamente"
        : "Conexión exitosa a la base de datos PostgreSQL",
      tables: allTables,
    });

  } catch (err) {
    console.error("Error al probar la conexión PostgreSQL:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
    await pool.end();
  }
}
