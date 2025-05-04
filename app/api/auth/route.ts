import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    // Crear el cliente de Supabase dentro del try para capturar errores de inicialización
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      db: { schema: "public" },
    })

    if (action === "register") {
      return handleRegister(body, supabase)
    } else if (action === "login") {
      return handleLogin(body, supabase)
    } else {
      return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error en autenticación:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error en autenticación",
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 },
    )
  }
}

async function handleRegister(body: any, supabase: any) {
  try {
    const { name, email, password } = body

    // Validar datos requeridos
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle()

    if (checkError) {
      console.error("Error al verificar usuario existente:", checkError)
      return NextResponse.json({ error: "Error al verificar usuario existente" }, { status: 500 })
    }

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
          provider: "email",
        },
      ])
      .select()

    if (error) {
      console.error("Error al crear usuario:", error)
      return NextResponse.json({ error: error.message || "Error al crear usuario" }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "No se pudo crear el usuario" }, { status: 500 })
    }

    // Eliminar la contraseña del objeto de respuesta
    const user = { ...data[0] }
    delete user.password

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error en registro",
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 },
    )
  }
}

async function handleLogin(body: any, supabase: any) {
  try {
    const { email, password } = body

    // Validar datos requeridos
    if (!email || !password) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Buscar el usuario
    const { data: user, error } = await supabase.from("users").select("*").eq("email", email).maybeSingle()

    if (error) {
      console.error("Error al buscar usuario:", error)
      return NextResponse.json({ error: "Error al verificar credenciales" }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Si el usuario se registró con Google, no debería tener contraseña
    if (user.provider === "google" && !user.password) {
      return NextResponse.json({ error: "Por favor, inicia sesión con Google" }, { status: 401 })
    }

    // Verificar la contraseña
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Eliminar la contraseña del objeto de respuesta
    const safeUser = { ...user }
    delete safeUser.password

    return NextResponse.json({ user: safeUser })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error en login",
        stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
      },
      { status: 500 },
    )
  }
}
