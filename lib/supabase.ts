import { createClient } from "@supabase/supabase-js"

// Cliente para el navegador (cliente)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Faltan variables de entorno para Supabase (cliente)")
}

// Cliente para el navegador
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Cliente para el servidor (usando la clave de servicio)
export const createServerSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Faltan variables de entorno para Supabase (servidor)")
  }

  return createClient(supabaseUrl || "", supabaseServiceKey || "", {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
