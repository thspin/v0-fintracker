import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verificar si la tabla de usuarios existe
    const { error: checkError } = await supabase.from("users").select("id").limit(1)

    if (checkError) {
      // Si la tabla no existe, crearla
      const { error: createError } = await supabase.rpc("setup_database")

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }
    } else {
      // Si la tabla existe, verificar si necesitamos agregar las columnas para Google
      const { error: alterError } = await supabase.rpc("update_users_table_for_google")

      if (alterError) {
        return NextResponse.json({ error: alterError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: "Base de datos configurada correctamente" })
  } catch (error) {
    console.error("Error al configurar la base de datos:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
  }
}
