"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CreditCard,
  DollarSign,
  ShoppingBag,
  Home,
  Car,
  Coffee,
  Utensils,
  Briefcase,
  Gift,
  Heart,
  BookOpen,
  Plane,
  Smartphone,
  Zap,
  Bitcoin,
  Wallet,
  Building,
  Landmark,
  PiggyBank,
  Banknote,
  CreditCardIcon,
  Coins,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const transactionFormSchema = z.object({
  type: z.enum(["income", "expense", "credit"]),
  amount: z.string().min(1, {
    message: "El monto es requerido.",
  }),
  currency: z.enum(["ARS", "USD", "BTC"]),
  category: z.string().min(1, {
    message: "La categoría es requerida.",
  }),
  date: z.string().min(1, {
    message: "La fecha es requerida.",
  }),
  account: z.string().min(1, {
    message: "La cuenta es requerida.",
  }),
  paymentMethod: z.string().min(1, {
    message: "El método de pago es requerido.",
  }),
  description: z.string().optional(),
  // Campos específicos para crédito
  interest: z.string().optional(),
  installments: z.string().optional(),
  installmentType: z.enum(["equal", "custom"]).optional(),
})

type TransactionFormValues = z.infer<typeof transactionFormSchema>

const defaultValues: Partial<TransactionFormValues> = {
  type: "expense",
  amount: "",
  currency: "ARS",
  category: "",
  date: new Date().toISOString().split("T")[0],
  account: "",
  paymentMethod: "",
  description: "",
  interest: "",
  installments: "",
  installmentType: "equal",
}

// Categorías con iconos
const categories = {
  income: [
    { id: "salary", name: "Salario", icon: <Briefcase className="h-5 w-5" /> },
    { id: "freelance", name: "Freelance", icon: <Smartphone className="h-5 w-5" /> },
    { id: "investment", name: "Inversiones", icon: <DollarSign className="h-5 w-5" /> },
    { id: "gift", name: "Regalos", icon: <Gift className="h-5 w-5" /> },
    { id: "other-income", name: "Otros", icon: <ArrowUpIcon className="h-5 w-5" /> },
  ],
  expense: [
    { id: "food", name: "Alimentación", icon: <Utensils className="h-5 w-5" /> },
    { id: "transport", name: "Transporte", icon: <Car className="h-5 w-5" /> },
    { id: "housing", name: "Vivienda", icon: <Home className="h-5 w-5" /> },
    { id: "utilities", name: "Servicios", icon: <Zap className="h-5 w-5" /> },
    { id: "entertainment", name: "Entretenimiento", icon: <Coffee className="h-5 w-5" /> },
    { id: "health", name: "Salud", icon: <Heart className="h-5 w-5" /> },
    { id: "education", name: "Educación", icon: <BookOpen className="h-5 w-5" /> },
    { id: "shopping", name: "Compras", icon: <ShoppingBag className="h-5 w-5" /> },
    { id: "travel", name: "Viajes", icon: <Plane className="h-5 w-5" /> },
    { id: "other-expense", name: "Otros", icon: <ArrowDownIcon className="h-5 w-5" /> },
  ],
  credit: [
    { id: "credit-card", name: "Tarjeta de Crédito", icon: <CreditCard className="h-5 w-5" /> },
    { id: "loan", name: "Préstamo", icon: <DollarSign className="h-5 w-5" /> },
    { id: "mortgage", name: "Hipoteca", icon: <Home className="h-5 w-5" /> },
    { id: "car-loan", name: "Préstamo Auto", icon: <Car className="h-5 w-5" /> },
    { id: "other-credit", name: "Otro Crédito", icon: <ArrowDownIcon className="h-5 w-5" /> },
  ],
}

// Cuentas
const accounts = [
  { id: "cash", name: "Efectivo", icon: <Banknote className="h-5 w-5" /> },
  { id: "bank-santander", name: "Santander", icon: <Building className="h-5 w-5" /> },
  { id: "bank-bbva", name: "BBVA", icon: <Landmark className="h-5 w-5" /> },
  { id: "bank-galicia", name: "Galicia", icon: <Building className="h-5 w-5" /> },
  { id: "mercado-pago", name: "Mercado Pago", icon: <Wallet className="h-5 w-5" /> },
  { id: "uala", name: "Ualá", icon: <Wallet className="h-5 w-5" /> },
  { id: "binance", name: "Binance", icon: <Bitcoin className="h-5 w-5" /> },
  { id: "investment-account", name: "Cuenta Comitente", icon: <PiggyBank className="h-5 w-5" /> },
]

// Métodos de pago
const paymentMethods = [
  { id: "cash", name: "Efectivo", icon: <Banknote className="h-5 w-5" /> },
  { id: "debit", name: "Débito", icon: <CreditCardIcon className="h-5 w-5" /> },
  { id: "credit", name: "Crédito", icon: <CreditCard className="h-5 w-5" /> },
  { id: "transfer", name: "Transferencia", icon: <Landmark className="h-5 w-5" /> },
  { id: "qr", name: "Código QR", icon: <Smartphone className="h-5 w-5" /> },
  { id: "crypto", name: "Cripto", icon: <Bitcoin className="h-5 w-5" /> },
  { id: "other", name: "Otro", icon: <Coins className="h-5 w-5" /> },
]

export function TransactionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCustomInstallments, setShowCustomInstallments] = useState(false)
  const [customInstallments, setCustomInstallments] = useState<{ number: number; amount: string }[]>([])
  const [resizeObserverError, setResizeObserverError] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ status: "idle" | "success" | "error"; message: string }>({
    status: "idle",
    message: "",
  })
  const { toast } = useToast()

  // Manejar el error de ResizeObserver
  useEffect(() => {
    const originalError = console.error
    console.error = (...args) => {
      if (args[0] && typeof args[0] === "string" && args[0].includes("ResizeObserver")) {
        setResizeObserverError(true)
        return
      }
      originalError.apply(console, args)
    }

    return () => {
      console.error = originalError
    }
  }, [])

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues,
  })

  const transactionType = form.watch("type")
  const currency = form.watch("currency")
  const installmentType = form.watch("installmentType")
  const installments = form.watch("installments")

  // Actualizar las cuotas personalizadas cuando cambia el número de cuotas
  const updateCustomInstallments = (numInstallments: string) => {
    if (!numInstallments || isNaN(Number.parseInt(numInstallments))) return

    const num = Number.parseInt(numInstallments)
    const amount = form.getValues("amount") || "0"
    const interest = form.getValues("interest") || "0"

    const totalAmount = Number.parseFloat(amount) + Number.parseFloat(interest)
    const baseInstallment = totalAmount / num

    const newInstallments = Array.from({ length: num }, (_, i) => ({
      number: i + 1,
      amount: baseInstallment.toFixed(2),
    }))

    setCustomInstallments(newInstallments)
  }

  // Manejar cambio de tipo de cuota
  const handleInstallmentTypeChange = (value: "equal" | "custom") => {
    form.setValue("installmentType", value)
    setShowCustomInstallments(value === "custom")

    if (value === "custom") {
      updateCustomInstallments(form.getValues("installments") || "0")
    }
  }

  // Manejar cambio en el número de cuotas
  const handleInstallmentsChange = (value: string) => {
    form.setValue("installments", value)

    if (installmentType === "custom") {
      updateCustomInstallments(value)
    }
  }

  // Manejar cambio de divisa
  const handleCurrencyChange = () => {
    const currentCurrency = form.getValues("currency")
    let newCurrency: "ARS" | "USD" | "BTC"

    switch (currentCurrency) {
      case "ARS":
        newCurrency = "USD"
        break
      case "USD":
        newCurrency = "BTC"
        break
      default:
        newCurrency = "ARS"
    }

    form.setValue("currency", newCurrency)
  }

  async function onSubmit(data: TransactionFormValues) {
    setIsSubmitting(true)
    setSubmitStatus({ status: "idle", message: "" })

    try {
      // Crear un objeto de usuario ficticio para pruebas
      const mockUser = {
        id: "test-user-id",
        name: "Usuario de Prueba",
        email: "test@example.com",
      }

      // Preparar los datos para enviar a la API
      const transactionData = {
        user_id: mockUser.id,
        type: data.type,
        amount: Number.parseFloat(data.amount),
        currency: data.currency,
        category: data.category,
        date: data.date,
        account: data.account,
        payment_method: data.paymentMethod,
        description: data.description || "",
      }

      // Si es crédito, agregar campos adicionales
      if (data.type === "credit") {
        Object.assign(transactionData, {
          interest: data.interest ? Number.parseFloat(data.interest) : 0,
          installments: data.installments ? Number.parseInt(data.installments) : 1,
          installment_type: data.installmentType || "equal",
        })

        // Si son cuotas personalizadas, incluir esa información
        if (data.installmentType === "custom") {
          Object.assign(transactionData, {
            customInstallments: customInstallments,
          })
        }
      }

      // Enviar los datos a la API
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar la transacción")
      }

      const result = await response.json()

      // Mostrar mensaje de éxito
      setSubmitStatus({
        status: "success",
        message: `Se ha guardado correctamente la ${
          data.type === "income" ? "entrada" : data.type === "expense" ? "salida" : "operación de crédito"
        } por ${data.currency} ${data.amount}`,
      })

      toast({
        title: "¡Transacción registrada!",
        description: `Se ha guardado correctamente la ${
          data.type === "income" ? "entrada" : data.type === "expense" ? "salida" : "operación de crédito"
        } por ${data.currency} ${data.amount}`,
        action: <ToastAction altText="Cerrar">OK</ToastAction>,
      })

      // Resetear el formulario
      form.reset(defaultValues)
      setShowCustomInstallments(false)
      setCustomInstallments([])
    } catch (error) {
      console.error("Error al guardar la transacción:", error)
      setSubmitStatus({
        status: "error",
        message: error instanceof Error ? error.message : "No se pudo guardar la transacción",
      })
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar la transacción",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Formatear el monto con .00 si no tiene decimales
  const formatAmount = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value && !value.includes(".")) {
      form.setValue("amount", `${value}.00`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Transacción</CardTitle>
        <CardDescription>Añade un nuevo ingreso, gasto o crédito a tu registro financiero</CardDescription>
      </CardHeader>
      <CardContent>
        {submitStatus.status === "success" && (
          <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>¡Transacción registrada!</AlertTitle>
            <AlertDescription>{submitStatus.message}</AlertDescription>
          </Alert>
        )}

        {submitStatus.status === "error" && (
          <Alert className="mb-6 bg-red-50 text-red-800 border-red-200" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitStatus.message}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs
              defaultValue="expense"
              value={transactionType}
              onValueChange={(value) => form.setValue("type", value as "income" | "expense" | "credit")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger
                  value="income"
                  className={transactionType === "income" ? "bg-green-500 text-white hover:bg-green-600" : ""}
                >
                  <ArrowUpIcon className="mr-2 h-4 w-4" />
                  Ingreso
                </TabsTrigger>
                <TabsTrigger
                  value="expense"
                  className={transactionType === "expense" ? "bg-red-500 text-white hover:bg-red-600" : ""}
                >
                  <ArrowDownIcon className="mr-2 h-4 w-4" />
                  Gasto
                </TabsTrigger>
                <TabsTrigger
                  value="credit"
                  className={transactionType === "credit" ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Crédito
                </TabsTrigger>
              </TabsList>

              <TabsContent value="income" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto</FormLabel>
                        <FormControl>
                          <div className="relative flex">
                            <span className="absolute left-3 top-2.5">$</span>
                            <Input
                              placeholder="0.00"
                              className="pl-7 flex-1"
                              {...field}
                              onBlur={formatAmount}
                              required
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "h-10 px-3 ml-2 border",
                                currency === "ARS"
                                  ? "text-blue-500"
                                  : currency === "USD"
                                    ? "text-green-500"
                                    : "text-orange-500",
                              )}
                              onClick={handleCurrencyChange}
                            >
                              {currency === "ARS" ? (
                                "ARS"
                              ) : currency === "USD" ? (
                                "USD"
                              ) : (
                                <Bitcoin className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} required className="w-auto" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="account"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuenta Destino</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                          >
                            {accounts.map((account) => (
                              <FormItem key={account.id} className="space-y-0">
                                <FormControl>
                                  <RadioGroupItem
                                    value={account.id}
                                    id={`account-${account.id}`}
                                    className="peer sr-only"
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={`account-${account.id}`}
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                  {account.icon}
                                  <span className="mt-2 text-xs font-normal">{account.name}</span>
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2"
                        >
                          {categories.income.map((category) => (
                            <FormItem key={category.id} className="space-y-0">
                              <FormControl>
                                <RadioGroupItem value={category.id} id={category.id} className="peer sr-only" />
                              </FormControl>
                              <FormLabel
                                htmlFor={category.id}
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                              >
                                {category.icon}
                                <span className="mt-2 text-xs font-normal">{category.name}</span>
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Añade detalles sobre esta transacción" {...field} />
                      </FormControl>
                      <FormDescription>Opcional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="expense" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto</FormLabel>
                        <FormControl>
                          <div className="relative flex">
                            <span className="absolute left-3 top-2.5">$</span>
                            <Input
                              placeholder="0.00"
                              className="pl-7 flex-1"
                              {...field}
                              onBlur={formatAmount}
                              required
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "h-10 px-3 ml-2 border",
                                currency === "ARS"
                                  ? "text-blue-500"
                                  : currency === "USD"
                                    ? "text-green-500"
                                    : "text-orange-500",
                              )}
                              onClick={handleCurrencyChange}
                            >
                              {currency === "ARS" ? (
                                "ARS"
                              ) : currency === "USD" ? (
                                "USD"
                              ) : (
                                <Bitcoin className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} required className="w-auto" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="account"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuenta Origen</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                          >
                            {accounts.map((account) => (
                              <FormItem key={account.id} className="space-y-0">
                                <FormControl>
                                  <RadioGroupItem
                                    value={account.id}
                                    id={`account-${account.id}-expense`}
                                    className="peer sr-only"
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={`account-${account.id}-expense`}
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                  {account.icon}
                                  <span className="mt-2 text-xs font-normal">{account.name}</span>
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de Pago</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                          >
                            {paymentMethods.map((method) => (
                              <FormItem key={method.id} className="space-y-0">
                                <FormControl>
                                  <RadioGroupItem
                                    value={method.id}
                                    id={`payment-${method.id}`}
                                    className="peer sr-only"
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={`payment-${method.id}`}
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                  {method.icon}
                                  <span className="mt-2 text-xs font-normal">{method.name}</span>
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2"
                        >
                          {categories.expense.map((category) => (
                            <FormItem key={category.id} className="space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value={category.id}
                                  id={`category-${category.id}`}
                                  className="peer sr-only"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={`category-${category.id}`}
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                              >
                                {category.icon}
                                <span className="mt-2 text-xs font-normal">{category.name}</span>
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Añade detalles sobre esta transacción" {...field} />
                      </FormControl>
                      <FormDescription>Opcional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="credit" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto</FormLabel>
                        <FormControl>
                          <div className="relative flex">
                            <span className="absolute left-3 top-2.5">$</span>
                            <Input
                              placeholder="0.00"
                              className="pl-7 flex-1"
                              {...field}
                              onBlur={formatAmount}
                              required
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "h-10 px-3 ml-2 border",
                                currency === "ARS"
                                  ? "text-blue-500"
                                  : currency === "USD"
                                    ? "text-green-500"
                                    : "text-orange-500",
                              )}
                              onClick={handleCurrencyChange}
                            >
                              {currency === "ARS" ? (
                                "ARS"
                              ) : currency === "USD" ? (
                                "USD"
                              ) : (
                                <Bitcoin className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interés (en dinero)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5">$</span>
                            <Input
                              placeholder="0.00"
                              className="pl-7"
                              {...field}
                              required={transactionType === "credit"}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad de Cuotas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="1"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              handleInstallmentsChange(e.target.value)
                            }}
                            required={transactionType === "credit"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fecha</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} required className="w-auto" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="account"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuenta Origen</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                          >
                            {accounts.map((account) => (
                              <FormItem key={account.id} className="space-y-0">
                                <FormControl>
                                  <RadioGroupItem
                                    value={account.id}
                                    id={`account-${account.id}-credit`}
                                    className="peer sr-only"
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={`account-${account.id}-credit`}
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                  {account.icon}
                                  <span className="mt-2 text-xs font-normal">{account.name}</span>
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de Pago</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                          >
                            {paymentMethods.map((method) => (
                              <FormItem key={method.id} className="space-y-0">
                                <FormControl>
                                  <RadioGroupItem
                                    value={method.id}
                                    id={`payment-${method.id}-credit`}
                                    className="peer sr-only"
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor={`payment-${method.id}-credit`}
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                  {method.icon}
                                  <span className="mt-2 text-xs font-normal">{method.name}</span>
                                </FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="installmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Cuotas</FormLabel>
                        <Select
                          onValueChange={(value) => handleInstallmentTypeChange(value as "equal" | "custom")}
                          defaultValue={field.value}
                          required={transactionType === "credit"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo de cuotas" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="equal">Cuotas Iguales</SelectItem>
                            <SelectItem value="custom">Cuotas Personalizadas</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {showCustomInstallments && installments && Number.parseInt(installments) > 0 && (
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-3">Detalle de Cuotas Personalizadas</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {customInstallments.map((installment, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <span className="text-sm font-medium w-16">Cuota {installment.number}:</span>
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-2.5">$</span>
                            <Input
                              value={installment.amount}
                              onChange={(e) => {
                                const newInstallments = [...customInstallments]
                                newInstallments[index].amount = e.target.value
                                setCustomInstallments(newInstallments)
                              }}
                              className="pl-7"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2"
                        >
                          {categories.credit.map((category) => (
                            <FormItem key={category.id} className="space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value={category.id}
                                  id={`category-${category.id}-credit`}
                                  className="peer sr-only"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={`category-${category.id}-credit`}
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                              >
                                {category.icon}
                                <span className="mt-2 text-xs font-normal">{category.name}</span>
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Input placeholder="Añade detalles sobre esta transacción" {...field} />
                      </FormControl>
                      <FormDescription>Opcional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <Button
              type="submit"
              className="w-full transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar Transacción"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
