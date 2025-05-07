// Función para verificar las variables de entorno
export function checkEnvVariables() {
  const variables = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  const missing = Object.entries(variables)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  return {
    isValid: missing.length === 0,
    missing,
    variables: Object.fromEntries(
      Object.entries(variables).map(([key, value]) => [
        key,
        value ? `${value.substring(0, 5)}...${value.substring(value.length - 5)}` : null,
      ]),
    ),
  }
}
