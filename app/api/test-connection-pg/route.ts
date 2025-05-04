// app/api/test-connection-pg/route.ts

import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Obtener la URL de conexión de PostgreSQL
    const connectionString = process.env.POSTGRES_URL

    if (!connectionString) {
      return NextResponse.json({ error: "Falta la variable de entorno POSTGRES_URL" }, { status: 500 })
    }

    // Importar dinámicamente pg para evitar problemas con SSR
    const { Pool } = await import("pg")

    // Crear un pool de conexiones con SSL desactivado para evitar problemas de certificado
    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false, // Esto permite conexiones con certificados autofirmados
      },
    })

    try {
      // Probar la conexión con una consulta simple
      const result = await pool.query("SELECT NOW() as current_time")

      return NextResponse.json({
        status: "success",
        message: "Conexión exitosa a la base de datos PostgreSQL",
        timestamp: result.rows[0].current_time,
      })
    } finally {
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
