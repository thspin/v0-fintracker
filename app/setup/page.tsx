"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertCircle, Database, RefreshCw, Code } from "lucide-react"

export default function SetupPage() {
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [executingSql, setExecutingSql] = useState(false)
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const checkDbStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/check-connection")
      const data = await response.json()
      console.log("Estado de la base de datos:", data)
      setDbStatus(data)
      if (data.status === "error") {
        setError(data.message || "Error al verificar el estado de la base de datos")
      }
    } catch (err) {
      setError("Error al verificar el estado de la base de datos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const createTables = async () => {
    setCreating(true)
    setError(null)
    setSuccess(null)
    try {
      const sql = `
      -- Crear tabla de usuarios si no existe
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Crear tabla de cuentas si no existe
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
        currency VARCHAR(10) NOT NULL DEFAULT 'ARS',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Crear tabla de métodos de pago si no existe
      CREATE TABLE IF NOT EXISTS payment_methods (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Crear tabla de transacciones si no existe
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'ARS',
        category VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        account VARCHAR(100),
        payment_method VARCHAR(100),
        description TEXT,
        interest DECIMAL(12, 2),
        installments INTEGER,
        installment_type VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Crear tabla de cuotas para transacciones de crédito si no existe
      CREATE TABLE IF NOT EXISTS installments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_id UUID NOT NULL,
        installment_number INTEGER NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      `

      const response = await fetch("/api/execute-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql }),
      })

      const data = await response.json()
      console.log("Resultado de crear tablas:", data)

      if (data.error) {
        setError(data.error)
      } else {
        setSuccess("Tablas creadas correctamente")
        await checkDbStatus()
      }
    } catch (err) {
      setError("Error al crear las tablas")
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const insertSampleData = async () => {
    setExecutingSql(true)
    setError(null)
    setSuccess(null)
    try {
      const sql = `
      -- Insertar usuario por defecto
      INSERT INTO users (name, email)
      VALUES ('Usuario por Defecto', 'default@example.com')
      ON CONFLICT (email) DO NOTHING;

      -- Obtener el ID del usuario por defecto
      DO $$
      DECLARE
        default_user_id UUID;
      BEGIN
        SELECT id INTO default_user_id FROM users WHERE email = 'default@example.com';

        -- Insertar cuentas por defecto
        INSERT INTO accounts (user_id, name, type, balance, currency)
        VALUES 
          (default_user_id, 'Efectivo', 'cash', 1000, 'ARS'),
          (default_user_id, 'Banco Santander', 'bank', 5000, 'ARS'),
          (default_user_id, 'Mercado Pago', 'digital_wallet', 2500, 'ARS')
        ON CONFLICT (user_id, name) DO NOTHING;

        -- Insertar métodos de pago por defecto
        INSERT INTO payment_methods (user_id, name, type)
        VALUES 
          (default_user_id, 'Efectivo', 'cash'),
          (default_user_id, 'Tarjeta de Débito', 'debit'),
          (default_user_id, 'Tarjeta de Crédito', 'credit'),
          (default_user_id, 'Transferencia', 'transfer')
        ON CONFLICT (user_id, name) DO NOTHING;

        -- Insertar algunas transacciones de ejemplo
        INSERT INTO transactions (user_id, type, amount, currency, category, date, account, payment_method, description)
        VALUES
          (default_user_id, 'expense', 150.50, 'ARS', 'Alimentación', CURRENT_DATE - INTERVAL '5 days', 'Efectivo', 'Efectivo', 'Compra en supermercado'),
          (default_user_id, 'expense', 300.00, 'ARS', 'Transporte', CURRENT_DATE - INTERVAL '3 days', 'Banco Santander', 'Tarjeta de Débito', 'Combustible'),
          (default_user_id, 'income', 5000.00, 'ARS', 'Salario', CURRENT_DATE - INTERVAL '10 days', 'Banco Santander', 'Transferencia', 'Pago de salario'),
          (default_user_id, 'expense', 1200.00, 'ARS', 'Entretenimiento', CURRENT_DATE - INTERVAL '2 days', 'Mercado Pago', 'Tarjeta de Crédito', 'Cena en restaurante');
      END $$;
      `

      const response = await fetch("/api/execute-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql }),
      })

      const data = await response.json()
      console.log("Resultado de insertar datos de ejemplo:", data)

      if (data.error) {
        setError(data.error)
      } else {
        setSuccess("Datos de ejemplo insertados correctamente")
        await checkDbStatus()
      }
    } catch (err) {
      setError("Error al insertar datos de ejemplo")
      console.error(err)
    } finally {
      setExecutingSql(false)
    }
  }

  useEffect(() => {
    checkDbStatus()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Configuración de la Base de Datos</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Éxito</AlertTitle>
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estado de la Base de Datos
          </CardTitle>
          <CardDescription>Verifica la conexión y las tablas necesarias</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Conexión */}
              <div>
                <h3 className="text-lg font-medium mb-2">Conexión</h3>
                <div className="flex items-center gap-2">
                  {dbStatus?.status === "success" ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Conectado correctamente</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span>Error de conexión</span>
                      {dbStatus?.error && <span className="text-xs text-red-500 ml-2">({dbStatus.error})</span>}
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Variables de Entorno */}
              <div>
                <h3 className="text-lg font-medium mb-2">Variables de Entorno</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dbStatus?.env &&
                    Object.entries(dbStatus.env).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center gap-2">
                        {value ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>{key}</span>
                      </div>
                    ))}
                </div>
              </div>

              <Separator />

              {/* Tablas */}
              <div>
                <h3 className="text-lg font-medium mb-2">Tablas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {dbStatus?.tables &&
                    Object.entries(dbStatus.tables).map(([table, status]: [string, any]) => (
                      <div key={table} className="flex items-center gap-2">
                        {status.exists ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>
                          {table} {status.exists && `(${status.count} registro${status.count !== 1 ? "s" : ""})`}
                        </span>
                        {status.error && <span className="text-xs text-red-500 ml-2">({status.error})</span>}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={checkDbStatus} disabled={loading} className="flex-1 sm:flex-none">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button onClick={createTables} disabled={creating || loading} className="flex-1 sm:flex-none">
            {creating ? "Creando..." : "Crear Tablas"}
          </Button>
          <Button
            variant="secondary"
            onClick={insertSampleData}
            disabled={executingSql || loading}
            className="flex-1 sm:flex-none"
          >
            <Code className="h-4 w-4 mr-2" />
            {executingSql ? "Insertando..." : "Insertar Datos de Ejemplo"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
