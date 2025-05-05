"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Banknote, Building, Wallet, Bitcoin, PiggyBank, Plus, Edit, Trash2, ArrowUpDown } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

// Tipos de cuentas con iconos
const accountTypes = [
  { id: "cash", name: "Efectivo", icon: <Banknote className="h-5 w-5" /> },
  { id: "bank", name: "Cuenta Bancaria", icon: <Building className="h-5 w-5" /> },
  { id: "digital_wallet", name: "Billetera Digital", icon: <Wallet className="h-5 w-5" /> },
  { id: "crypto_wallet", name: "Wallet Cripto", icon: <Bitcoin className="h-5 w-5" /> },
  { id: "investment", name: "Cuenta Comitente", icon: <PiggyBank className="h-5 w-5" /> },
]

// Monedas disponibles
const currencies = [
  { id: "ARS", name: "Peso Argentino (ARS)" },
  { id: "USD", name: "Dólar Estadounidense (USD)" },
  { id: "BTC", name: "Bitcoin (BTC)" },
  { id: "ETH", name: "Ethereum (ETH)" },
]

// Datos de ejemplo para cuentas
const initialAccounts = [
  { id: 1, name: "Efectivo", type: "cash", balance: 15000, currency: "ARS" },
  { id: 2, name: "Banco Santander", type: "bank", balance: 50000, currency: "ARS" },
  { id: 3, name: "Mercado Pago", type: "digital_wallet", balance: 25000, currency: "ARS" },
  { id: 4, name: "Binance", type: "crypto_wallet", balance: 0.05, currency: "BTC" },
  { id: 5, name: "Cuenta Comitente", type: "investment", balance: 1000, currency: "USD" },
]

export default function AccountsPage() {
  const [accounts, setAccounts] = useState(initialAccounts)
  const [isAddingAccount, setIsAddingAccount] = useState(false)
  const [isEditingAccount, setIsEditingAccount] = useState<number | null>(null)
  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "",
    balance: "",
    currency: "ARS",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { toast } = useToast()

  // Cargar cuentas desde la API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Aquí iría la llamada a la API para obtener las cuentas
        // Por ahora usamos los datos de ejemplo
        setAccounts(initialAccounts)
      } catch (err) {
        setError("Error al cargar las cuentas")
        console.error("Error al cargar las cuentas:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  // Manejar la adición de una nueva cuenta
  const handleAddAccount = async () => {
    if (!newAccount.name || !newAccount.type || !newAccount.balance || !newAccount.currency) {
      setError("Por favor, completa todos los campos")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Aquí iría la llamada a la API para crear la cuenta
      // Por ahora simulamos la creación
      const newId = Math.max(0, ...accounts.map((account) => account.id)) + 1
      const createdAccount = {
        id: newId,
        name: newAccount.name,
        type: newAccount.type,
        balance: Number.parseFloat(newAccount.balance),
        currency: newAccount.currency,
      }

      setAccounts([...accounts, createdAccount])
      setSuccess("Cuenta creada exitosamente")
      toast({
        title: "Cuenta creada",
        description: "La cuenta ha sido creada exitosamente",
      })

      // Resetear el formulario
      setNewAccount({
        name: "",
        type: "",
        balance: "",
        currency: "ARS",
      })
      setIsAddingAccount(false)
    } catch (err) {
      setError("Error al crear la cuenta")
      console.error("Error al crear la cuenta:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar la edición de una cuenta
  const handleEditAccount = (id: number) => {
    const accountToEdit = accounts.find((account) => account.id === id)
    if (!accountToEdit) return

    setNewAccount({
      name: accountToEdit.name,
      type: accountToEdit.type,
      balance: accountToEdit.balance.toString(),
      currency: accountToEdit.currency,
    })
    setIsEditingAccount(id)
    setIsAddingAccount(true)
  }

  // Guardar los cambios de una cuenta editada
  const handleSaveEdit = async () => {
    if (!isEditingAccount) return
    if (!newAccount.name || !newAccount.type || !newAccount.balance || !newAccount.currency) {
      setError("Por favor, completa todos los campos")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Aquí iría la llamada a la API para actualizar la cuenta
      // Por ahora simulamos la actualización
      const updatedAccounts = accounts.map((account) =>
        account.id === isEditingAccount
          ? {
              ...account,
              name: newAccount.name,
              type: newAccount.type,
              balance: Number.parseFloat(newAccount.balance),
              currency: newAccount.currency,
            }
          : account,
      )

      setAccounts(updatedAccounts)
      setSuccess("Cuenta actualizada exitosamente")
      toast({
        title: "Cuenta actualizada",
        description: "La cuenta ha sido actualizada exitosamente",
      })

      // Resetear el formulario
      setNewAccount({
        name: "",
        type: "",
        balance: "",
        currency: "ARS",
      })
      setIsAddingAccount(false)
      setIsEditingAccount(null)
    } catch (err) {
      setError("Error al actualizar la cuenta")
      console.error("Error al actualizar la cuenta:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Eliminar una cuenta
  const handleDeleteAccount = async (id: number) => {
    try {
      setIsLoading(true)
      setError(null)

      // Aquí iría la llamada a la API para eliminar la cuenta
      // Por ahora simulamos la eliminación
      const filteredAccounts = accounts.filter((account) => account.id !== id)

      setAccounts(filteredAccounts)
      setSuccess("Cuenta eliminada exitosamente")
      toast({
        title: "Cuenta eliminada",
        description: "La cuenta ha sido eliminada exitosamente",
      })
    } catch (err) {
      setError("Error al eliminar la cuenta")
      console.error("Error al eliminar la cuenta:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular el balance total en ARS (simplificado)
  const calculateTotalBalance = () => {
    return accounts.reduce((total, account) => {
      let convertedBalance = account.balance

      // Conversión simplificada (en una app real, usarías tasas de cambio actualizadas)
      if (account.currency === "USD") {
        convertedBalance = account.balance * 900 // Tasa de cambio ficticia
      } else if (account.currency === "BTC") {
        convertedBalance = account.balance * 50000000 // Tasa de cambio ficticia
      }

      return total + convertedBalance
    }, 0)
  }

  // Obtener el icono según el tipo de cuenta
  const getAccountIcon = (type: string) => {
    const accountType = accountTypes.find((t) => t.id === type)
    return accountType ? accountType.icon : <Building className="h-5 w-5" />
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mis Cuentas</h1>

      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts">Cuentas</TabsTrigger>
          <TabsTrigger value="transfers">Transferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4 mt-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <AlertTitle>Éxito</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {getAccountIcon(account.type)}
                      <CardTitle className="text-base ml-2">{account.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEditAccount(account.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteAccount(account.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{accountTypes.find((t) => t.id === account.type)?.name || "Cuenta"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-xl font-bold">
                      {account.currency === "BTC"
                        ? `₿ ${account.balance}`
                        : `${account.currency === "USD" ? "$" : "$"} ${account.balance.toLocaleString()}`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="flex items-center justify-center h-full min-h-[150px] border-2 border-dashed border-muted-foreground/20 bg-transparent hover:bg-muted/50">
              <Button
                variant="ghost"
                className="flex flex-col items-center justify-center h-full w-full"
                onClick={() => {
                  setIsAddingAccount(true)
                  setIsEditingAccount(null)
                  setNewAccount({
                    name: "",
                    type: "",
                    balance: "",
                    currency: "ARS",
                  })
                }}
              >
                <Plus className="h-6 w-6 mb-2" />
                <span>Agregar Cuenta</span>
              </Button>
            </Card>
          </div>

          {isAddingAccount && (
            <Card>
              <CardHeader>
                <CardTitle>{isEditingAccount ? "Editar Cuenta" : "Nueva Cuenta"}</CardTitle>
                <CardDescription>
                  {isEditingAccount ? "Modifica los datos de la cuenta" : "Ingresa los datos de la nueva cuenta"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-name">Nombre de la Cuenta</Label>
                    <Input
                      id="account-name"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                      placeholder="Ej: Efectivo, Banco Santander"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-type">Tipo de Cuenta</Label>
                    <Select
                      value={newAccount.type}
                      onValueChange={(value) => setNewAccount({ ...newAccount, type: value })}
                    >
                      <SelectTrigger id="account-type">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center">
                              <span className="mr-2">{type.icon}</span>
                              <span>{type.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-balance">Balance Inicial</Label>
                    <Input
                      id="account-balance"
                      type="number"
                      step="0.01"
                      value={newAccount.balance}
                      onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-currency">Moneda</Label>
                    <Select
                      value={newAccount.currency}
                      onValueChange={(value) => setNewAccount({ ...newAccount, currency: value })}
                    >
                      <SelectTrigger id="account-currency">
                        <SelectValue placeholder="Selecciona una moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.id} value={currency.id}>
                            {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingAccount(false)
                      setIsEditingAccount(null)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={isEditingAccount ? handleSaveEdit : handleAddAccount}>
                    {isEditingAccount ? "Guardar Cambios" : "Agregar Cuenta"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Resumen de Cuentas</CardTitle>
              <CardDescription>Balance total y distribución de tus cuentas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">Balance Total (ARS)</p>
                  <p className="text-2xl font-bold">${calculateTotalBalance().toLocaleString()}</p>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">Distribución por Tipo</p>
                  <div className="space-y-4">
                    {accountTypes.map((type) => {
                      const accountsOfType = accounts.filter((account) => account.type === type.id)
                      if (accountsOfType.length === 0) return null

                      return (
                        <div key={type.id} className="flex justify-between items-center">
                          <div className="flex items-center">
                            {type.icon}
                            <span className="ml-2">{type.name}</span>
                          </div>
                          <p className="font-medium">
                            {accountsOfType.length} {accountsOfType.length === 1 ? "cuenta" : "cuentas"}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transferencias entre Cuentas</CardTitle>
              <CardDescription>Mueve dinero entre tus cuentas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from-account">Cuenta Origen</Label>
                  <Select>
                    <SelectTrigger id="from-account">
                      <SelectValue placeholder="Selecciona una cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name} - {account.currency} {account.balance.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end justify-center">
                  <Button variant="ghost" size="icon" className="mb-2">
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to-account">Cuenta Destino</Label>
                  <Select>
                    <SelectTrigger id="to-account">
                      <SelectValue placeholder="Selecciona una cuenta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name} - {account.currency} {account.balance.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-amount">Monto</Label>
                  <Input id="transfer-amount" type="number" step="0.01" placeholder="0.00" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transfer-description">Descripción (opcional)</Label>
                  <Input id="transfer-description" placeholder="Ej: Transferencia para gastos" />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button>Realizar Transferencia</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Transferencias</CardTitle>
              <CardDescription>Últimas transferencias entre cuentas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">No hay transferencias recientes</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
