import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Configuración de Google OAuth
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
const GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Verificar si hay un error en la respuesta de Google
    if (error) {
      return NextResponse.redirect(`/login?error=${encodeURIComponent(error)}`)
    }

    // Verificar que el código y el estado estén presentes
    if (!code || !state) {
      return NextResponse.redirect(`/login?error=${encodeURIComponent("Parámetros de autenticación inválidos")}`)
    }

    // Verificar el estado para prevenir CSRF
    const storedState = request.cookies.get("google_oauth_state")?.value
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(`/login?error=${encodeURIComponent("Estado de autenticación inválido")}`)
    }

    // Intercambiar el código por un token de acceso
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error("Error al obtener token de Google:", tokenData)
      return NextResponse.redirect(`/login?error=${encodeURIComponent("Error al obtener token de acceso")}`)
    }

    // Obtener información del usuario con el token de acceso
    const userInfoResponse = await fetch(GOOGLE_USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userInfoResponse.json()

    if (!userInfoResponse.ok) {
      console.error("Error al obtener información del usuario de Google:", userData)
      return NextResponse.redirect(`/login?error=${encodeURIComponent("Error al obtener información del usuario")}`)
    }

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verificar si el usuario ya existe en la base de datos
    const { data: existingUser, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", userData.email)
      .single()

    let user

    if (findError && findError.code !== "PGRST116") {
      console.error("Error al buscar usuario:", findError)
      return NextResponse.redirect(`/login?error=${encodeURIComponent("Error al verificar usuario")}`)
    }

    // Si el usuario no existe, crearlo
    if (!existingUser) {
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            name: userData.name,
            email: userData.email,
            password: "", // No se necesita contraseña para autenticación con Google
            provider: "google",
            provider_id: userData.sub,
            picture: userData.picture,
          },
        ])
        .select()

      if (createError) {
        console.error("Error al crear usuario:", createError)
        return NextResponse.redirect(`/login?error=${encodeURIComponent("Error al crear usuario")}`)
      }

      user = newUser[0]
    } else {
      user = existingUser
    }

    // Eliminar la contraseña del objeto de usuario
    delete user.password

    // Crear una cookie con la sesión del usuario
    const response = NextResponse.redirect("/dashboard")

    // Eliminar la cookie de estado
    response.cookies.delete("google_oauth_state")

    // Establecer la cookie de sesión
    response.cookies.set({
      name: "user_session",
      value: JSON.stringify(user),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      sameSite: "lax" as const,
    })

    return response
  } catch (error) {
    console.error("Error en el callback de Google:", error)
    return NextResponse.redirect(`/login?error=${encodeURIComponent("Error en la autenticación con Google")}`)
  }
}
