import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === "register") {
      return handleRegister(body)
    } else if (action === "login") {
      return handleLogin(body)
    } else {
      return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error en autenticación:", error)
    return NextResponse.json({ error: "Error en autenticación" }, { status: 500 })
  }
}

async function handleRegister(body: any) {
  const { name, email, password } = body

  // Validar datos requeridos
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  // Verificar si el usuario ya existe
  const { data: existingUser } = await supabase.from("users").select("*").eq("email", email).single()

  if (existingUser) {
    return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 })
  }

  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(password, 10)

  // Crear el usuario
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        name,
        email,
        password: hashedPassword,
      },
    ])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Eliminar la contraseña del objeto de respuesta
  const user = data[0]
  delete user.password

  return NextResponse.json({ user }, { status: 201 })
}

async function handleLogin(body: any) {
  const { email, password } = body

  // Validar datos requeridos
  if (!email || !password) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
  }

  // Buscar el usuario
  const { data: user, error } = await supabase.from("users").select("*").eq("email", email).single()

  if (error || !user) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
  }

  // Verificar la contraseña
  const passwordMatch = await bcrypt.compare(password, user.password)

  if (!passwordMatch) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
  }

  // Eliminar la contraseña del objeto de respuesta
  delete user.password

  return NextResponse.json({ user })
}
