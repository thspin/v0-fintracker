// Configuración para autenticación
export const authConfig = {
  // Tiempo de expiración del token en segundos (1 día)
  tokenExpiration: 86400,

  // Configuración para cookies
  cookies: {
    name: "fintracker_session",
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      secure: process.env.NODE_ENV === "production",
    },
  },

  // URLs de redirección
  redirects: {
    login: "/login",
    afterLogin: "/dashboard",
    afterLogout: "/login",
  },
}
