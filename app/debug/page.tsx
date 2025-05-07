"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertCircle, Database, RefreshCw } from "lucide-react"

export default function DebugPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkConnection = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/check-connection")
      const result = await response.json()
      console.log("Resultado de la verificación:", result)
      setData(result)
      if (result.status === "error") {
        setError(result.message || "Error al verificar la conexión")
      }
    } catch (err) {
      setError("Error al verificar la conexión")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Depuración de Conexión a Supabase</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estado de la Conexión
          </CardTitle>
          <CardDescription>Información detallada sobre la conexión a Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Estado general */}
              <div>
                <h3 className="text-lg font-medium mb-2">Estado</h3>
                <div className="flex items-center gap-2">
                  {data?.status === "success" ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-700">{data.message}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-700">{data?.message || "Error desconocido"}</span>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Variables de entorno */}
              <div>
                <h3 className="text-lg font-medium mb-2">Variables de Entorno</h3>
                <div className="grid grid-cols-1 gap-2">
                  {data?.env &&
                    Object.entries(data.env).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center gap-2">
                        {value ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="font-mono text-sm">
                          {key}: {value || "No definida"}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <Separator />

              {/* Detalles del error */}
              {data?.details && (
                <>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Detalles del Error</h3>
                    <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60">
                      <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(data.details, null, 2)}</pre>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Tablas */}
              {data?.tables && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Tablas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(data.tables).map(([table, status]: [string, any]) => (
                      <div key={table} className="flex items-center gap-2">
                        {status.exists ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>
                          {table} {status.exists && `(${status.count} registro${status.count !== 1 ? "s" : ""})`}
                        </span>
                        {status.error && (
                          <span className="text-xs text-red-500 ml-2 truncate max-w-[200px]" title={status.error}>
                            ({status.error})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={checkConnection} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Verificar Conexión
          </Button>
        </CardFooter>
      </Card>

      {/* Instrucciones */}
      <Card>
        <CardHeader>
          <CardTitle>Solución de Problemas</CardTitle>
          <CardDescription>Pasos para resolver problemas de conexión con Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">1. Verificar Variables de Entorno</h3>
              <p className="text-sm text-gray-600">
                Asegúrate de que todas las variables de entorno necesarias estén definidas correctamente.
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                <li>NEXT_PUBLIC_SUPABASE_URL</li>
                <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                <li>SUPABASE_URL</li>
                <li>SUPABASE_SERVICE_ROLE_KEY</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium">2. Verificar Acceso a Supabase</h3>
              <p className="text-sm text-gray-600">
                Asegúrate de que puedes acceder al panel de control de Supabase y que el proyecto está activo.
              </p>
            </div>

            <div>
              <h3 className="font-medium">3. Crear Tablas Manualmente</h3>
              <p className="text-sm text-gray-600">
                Si la creación automática de tablas falla, puedes crearlas manualmente desde el Editor SQL de Supabase.
              </p>
              <div className="bg-gray-100 p-2 rounded-md mt-2">
                <code className="text-xs">CREATE TABLE IF NOT EXISTS users (...)</code>
              </div>
            </div>

            <div>
              <h3 className="font-medium">4. Reiniciar la Aplicación</h3>
              <p className="text-sm text-gray-600">
                A veces, reiniciar la aplicación puede resolver problemas de conexión.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
