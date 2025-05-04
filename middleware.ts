import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Definir rutas públicas que no requieren autenticación
  const isPublicPath = path === "/login" || path === "/api/auth" || path.startsWith("/api/auth/")

  // Obtener la cookie de sesión
  const userSession = request.cookies.get("user_session")?.value

  // Si el usuario no está autenticado y la ruta no es pública, redirigir al login
  if (!userSession && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si el usuario está autenticado y la ruta es pública, redirigir al dashboard
  if (userSession && isPublicPath && path !== "/api/auth/google/callback") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configurar las rutas que deben ser manejadas por el middleware
export const config = {
  matcher: [
    /*
     * Rutas que requieren autenticación:
     * - Dashboard y todas sus subrutas
     * - Transacciones y todas sus subrutas
     * - Pagos y todas sus subrutas
     * - Ahorros y todas sus subrutas
     * - Servicios y todas sus subrutas
     * - Configuración y todas sus subrutas
     *
     * Rutas públicas (no requieren autenticación):
     * - Login
     * - API de autenticación
     */
    "/dashboard/:path*",
    "/transactions/:path*",
    "/payments/:path*",
    "/savings/:path*",
    "/services/:path*",
    "/settings/:path*",
    "/login",
  ],
}
