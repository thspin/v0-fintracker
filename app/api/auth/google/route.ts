import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// URL de redirección de Google OAuth
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`

export async function GET(request: Request) {
  try {
    // Generar un estado único para prevenir CSRF
    const state = uuidv4()

    // Guardar el estado en una cookie para verificarlo después
    const cookieStore = {
      name: "google_oauth_state",
      value: state,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutos
      sameSite: "lax" as const,
    }

    // Construir la URL de autorización de Google
    const authUrl = new URL(GOOGLE_AUTH_URL)
    authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID)
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI)
    authUrl.searchParams.append("response_type", "code")
    authUrl.searchParams.append("scope", "openid email profile")
    authUrl.searchParams.append("state", state)
    authUrl.searchParams.append("prompt", "select_account")
    authUrl.searchParams.append("access_type", "offline")

    // Redirigir al usuario a la URL de autorización de Google
    const response = NextResponse.redirect(authUrl.toString())

    // Establecer la cookie de estado
    response.cookies.set(cookieStore)

    return response
  } catch (error) {
    console.error("Error al iniciar autenticación con Google:", error)
    return NextResponse.redirect(`/login?error=${encodeURIComponent("Error al iniciar sesión con Google")}`)
  }
}
