"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, Plus, Database } from "lucide-react"

interface PruebaItem {
  id: number
  created_at: string
}

export default function PruebaPage() {
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [items, setItems] = useState<PruebaItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/prueba1")
      const data = await response.json()

      if (data.status === "error") {
        setError(data.message || "Error al obtener datos")
      } else {
        setItems(data.data || [])
      }
    } catch (err) {
      setError("Error al obtener datos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createItem = async () => {
    setCreating(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch("/api/prueba1", {
        method: "POST",
      })
      const data = await response.json()

      if (data.status === "error") {
        setError(data.message || "Error al crear registro")
      } else {
        setSuccess("Registro creado correctamente")
        fetchItems() // Actualizar la lista
      }
    } catch (err) {
      setError("Error al crear registro")
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Tabla de Prueba</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <AlertTitle className="text-green-700">Éxito</AlertTitle>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Registros en prueba1
          </CardTitle>
          <CardDescription>Tabla de prueba para verificar la conexión a Supabase</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                      No hay registros
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleString("es-ES", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={fetchItems} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button onClick={createItem} disabled={creating}>
            <Plus className="h-4 w-4 mr-2" />
            {creating ? "Creando..." : "Crear Registro"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Crear Tablas para la Aplicación</CardTitle>
          <CardDescription>
            La tabla de prueba funciona correctamente. Ahora puedes crear las tablas necesarias para la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Para crear las tablas necesarias para la aplicación de finanzas personales, puedes ejecutar el siguiente SQL
            en la consola de Supabase o usar la página de configuración.
          </p>
          <Button onClick={() => (window.location.href = "/setup")}>Ir a la Página de Configuración</Button>
        </CardContent>
      </Card>
    </div>
  )
}
