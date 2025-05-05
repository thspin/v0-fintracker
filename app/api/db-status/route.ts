import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    // Obtener las variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
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

    // Verificar la conexión
    const { data: tablesData, error: tablesError } = await supabase
      .from("transactions")
      .select("*", { count: "exact" })
      .limit(1)

    if (tablesError) {
      // Si hay un error, verificar si es porque la tabla no existe
      return NextResponse.json(
        {
          error: "Error al consultar la tabla transactions",
          details: tablesError.message,
          hint: "Es posible que la tabla no exista. Ejecuta el script de creación de tablas.",
        },
        { status: 500 },
      )
    }

    // Verificar otras tablas importantes
    const tables = ["transactions", "users", "accounts", "payment_methods"]
    const tableStatus = {}

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*", { count: "exact" }).limit(1)
      tableStatus[table] = {
        exists: !error,
        error: error ? error.message : null,
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Conexión exitosa a la base de datos",
      tables: tableStatus,
      env: {
        supabaseUrl: supabaseUrl.substring(0, 15) + "...", // Solo mostrar parte de la URL por seguridad
        supabaseKeyPresent: !!supabaseKey,
      },
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
