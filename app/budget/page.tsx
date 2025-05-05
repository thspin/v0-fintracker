"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, Edit, Trash2, CheckCircle } from "lucide-react"

// Datos de ejemplo para el presupuesto
const initialBudget = {
  income: [
    { id: 1, name: "Salario", amount: 150000, category: "salary" },
    { id: 2, name: "Freelance", amount: 50000, category: "freelance" },
  ],
  expenses: [
    { id: 1, name: "Alquiler", amount: 45000, category: "housing", isPaid: true },
    { id: 2, name: "Servicios", amount: 15000, category: "utilities", isPaid: false },
    { id: 3, name: "Comida", amount: 30000, category: "food", isPaid: false },
    { id: 4, name: "Transporte", amount: 10000, category: "transport", isPaid: true },
    { id: 5, name: "Entretenimiento", amount: 15000, category: "entertainment", isPaid: false },
    { id: 6, name: "Salud", amount: 8000, category: "health", isPaid: false },
    { id: 7, name: "Educación", amount: 5000, category: "education", isPaid: true },
  ],
  savings: [
    { id: 1, name: "Fondo de Emergencia", amount: 20000, category: "emergency" },
    { id: 2, name: "Vacaciones", amount: 10000, category: "travel" },
  ],
  taxes: [
    { id: 1, name: "Impuesto a las Ganancias", amount: 15000, dueDate: "2025-06-15", isPaid: false },
    { id: 2, name: "Impuesto Municipal", amount: 5000, dueDate: "2025-05-20", isPaid: true },
  ],
}

// Categorías
const categories = {
  income: [
    { id: "salary", name: "Salario" },
    { id: "freelance", name: "Freelance" },
    { id: "investment", name: "Inversiones" },
    { id: "other", name: "Otros" },
  ],
  expenses: [
    { id: "housing", name: "Vivienda" },
    { id: "utilities", name: "Servicios" },
    { id: "food", name: "Alimentación" },
    { id: "transport", name: "Transporte" },
    { id: "entertainment", name: "Entretenimiento" },
    { id: "health", name: "Salud" },
    { id: "education", name: "Educación" },
    { id: "other", name: "Otros" },
  ],
  savings: [
    { id: "emergency", name: "Emergencia" },
    { id: "retirement", name: "Jubilación" },
    { id: "travel", name: "Viajes" },
    { id: "home", name: "Vivienda" },
    { id: "other", name: "Otros" },
  ],
}

export default function BudgetPage() {
  const [budget, setBudget] = useState(initialBudget)
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddingIncome, setIsAddingIncome] = useState(false)
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [isAddingSaving, setIsAddingSaving] = useState(false)
  const [isAddingTax, setIsAddingTax] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    amount: "",
    category: "",
    dueDate: "",
  })

  // Calcular totales
  const totalIncome = budget.income.reduce((sum, item) => sum + item.amount, 0)
  const totalExpenses = budget.expenses.reduce((sum, item) => sum + item.amount, 0)
  const totalSavings = budget.savings.reduce((sum, item) => sum + item.amount, 0)
  const totalTaxes = budget.taxes.reduce((sum, item) => sum + item.amount, 0)
  const balance = totalIncome - totalExpenses - totalSavings - totalTaxes
  const expensesPaid = budget.expenses.filter((item) => item.isPaid).reduce((sum, item) => sum + item.amount, 0)
  const expensesRemaining = totalExpenses - expensesPaid
  const taxesPaid = budget.taxes.filter((item) => item.isPaid).reduce((sum, item) => sum + item.amount, 0)
  const taxesRemaining = totalTaxes - taxesPaid

  // Manejar la adición de un nuevo ingreso
  const handleAddIncome = () => {
    if (!newItem.name || !newItem.amount || !newItem.category) return

    const newIncome = {
      id: Math.max(0, ...budget.income.map((item) => item.id)) + 1,
      name: newItem.name,
      amount: Number(newItem.amount),
      category: newItem.category,
    }

    setBudget({
      ...budget,
      income: [...budget.income, newIncome],
    })

    setNewItem({
      name: "",
      amount: "",
      category: "",
      dueDate: "",
    })
    setIsAddingIncome(false)
  }

  // Manejar la adición de un nuevo gasto
  const handleAddExpense = () => {
    if (!newItem.name || !newItem.amount || !newItem.category) return

    const newExpense = {
      id: Math.max(0, ...budget.expenses.map((item) => item.id)) + 1,
      name: newItem.name,
      amount: Number(newItem.amount),
      category: newItem.category,
      isPaid: false,
    }

    setBudget({
      ...budget,
      expenses: [...budget.expenses, newExpense],
    })

    setNewItem({
      name: "",
      amount: "",
      category: "",
      dueDate: "",
    })
    setIsAddingExpense(false)
  }

  // Manejar la adición de un nuevo ahorro
  const handleAddSaving = () => {
    if (!newItem.name || !newItem.amount || !newItem.category) return

    const newSaving = {
      id: Math.max(0, ...budget.savings.map((item) => item.id)) + 1,
      name: newItem.name,
      amount: Number(newItem.amount),
      category: newItem.category,
    }

    setBudget({
      ...budget,
      savings: [...budget.savings, newSaving],
    })

    setNewItem({
      name: "",
      amount: "",
      category: "",
      dueDate: "",
    })
    setIsAddingSaving(false)
  }

  // Manejar la adición de un nuevo impuesto
  const handleAddTax = () => {
    if (!newItem.name || !newItem.amount || !newItem.dueDate) return

    const newTax = {
      id: Math.max(0, ...budget.taxes.map((item) => item.id)) + 1,
      name: newItem.name,
      amount: Number(newItem.amount),
      dueDate: newItem.dueDate,
      isPaid: false,
    }

    setBudget({
      ...budget,
      taxes: [...budget.taxes, newTax],
    })

    setNewItem({
      name: "",
      amount: "",
      category: "",
      dueDate: "",
    })
    setIsAddingTax(false)
  }

  // Marcar un gasto como pagado
  const toggleExpensePaid = (id: number) => {
    setBudget({
      ...budget,
      expenses: budget.expenses.map((item) => (item.id === id ? { ...item, isPaid: !item.isPaid } : item)),
    })
  }

  // Marcar un impuesto como pagado
  const toggleTaxPaid = (id: number) => {
    setBudget({
      ...budget,
      taxes: budget.taxes.map((item) => (item.id === id ? { ...item, isPaid: !item.isPaid } : item)),
    })
  }

  // Eliminar un ingreso
  const deleteIncome = (id: number) => {
    setBudget({
      ...budget,
      income: budget.income.filter((item) => item.id !== id),
    })
  }

  // Eliminar un gasto
  const deleteExpense = (id: number) => {
    setBudget({
      ...budget,
      expenses: budget.expenses.filter((item) => item.id !== id),
    })
  }

  // Eliminar un ahorro
  const deleteSaving = (id: number) => {
    setBudget({
      ...budget,
      savings: budget.savings.filter((item) => item.id !== id),
    })
  }

  // Eliminar un impuesto
  const deleteTax = (id: number) => {
    setBudget({
      ...budget,
      taxes: budget.taxes.filter((item) => item.id !== id),
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Presupuesto Mensual</h1>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="income">Ingresos</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="savings">Ahorros</TabsTrigger>
          <TabsTrigger value="taxes">Impuestos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{budget.income.length} fuentes de ingreso</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pagado: ${expensesPaid.toLocaleString()}</span>
                  <span>Pendiente: ${expensesRemaining.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Ahorros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">${totalSavings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{budget.savings.length} objetivos de ahorro</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${balance.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">{balance >= 0 ? "Superávit" : "Déficit"} presupuestario</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribución del Presupuesto</CardTitle>
              <CardDescription>Cómo se distribuyen tus ingresos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                      <p className="font-medium">Gastos</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">${totalExpenses.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((totalExpenses / totalIncome) * 100)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={(totalExpenses / totalIncome) * 100} className="h-2" indicatorColor="bg-red-500" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                      <p className="font-medium">Ahorros</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">${totalSavings.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{Math.round((totalSavings / totalIncome) * 100)}%</p>
                    </div>
                  </div>
                  <Progress value={(totalSavings / totalIncome) * 100} className="h-2" indicatorColor="bg-blue-500" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2" />
                      <p className="font-medium">Impuestos</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">${totalTaxes.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{Math.round((totalTaxes / totalIncome) * 100)}%</p>
                    </div>
                  </div>
                  <Progress value={(totalTaxes / totalIncome) * 100} className="h-2" indicatorColor="bg-amber-500" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                      <p className="font-medium">Balance</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">${balance.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{Math.round((balance / totalIncome) * 100)}%</p>
                    </div>
                  </div>
                  <Progress
                    value={(balance / totalIncome) * 100}
                    className="h-2"
                    indicatorColor={balance >= 0 ? "bg-green-500" : "bg-red-500"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoría</CardTitle>
                <CardDescription>Distribución de tus gastos mensuales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.expenses.map((category) => {
                    const categoryExpenses = budget.expenses.filter((item) => item.category === category.id)
                    const categoryTotal = categoryExpenses.reduce((sum, item) => sum + item.amount, 0)
                    const categoryPercentage = totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0

                    if (categoryTotal === 0) return null

                    return (
                      <div key={category.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{category.name}</p>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">${categoryTotal.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{Math.round(categoryPercentage)}%</p>
                          </div>
                        </div>
                        <Progress value={categoryPercentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Pagos</CardTitle>
                <CardDescription>Seguimiento de gastos e impuestos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Gastos Pagados</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">${expensesPaid.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {totalExpenses > 0 ? Math.round((expensesPaid / totalExpenses) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={totalExpenses > 0 ? (expensesPaid / totalExpenses) * 100 : 0}
                      className="h-2"
                      indicatorColor="bg-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Gastos Pendientes</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">${expensesRemaining.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {totalExpenses > 0 ? Math.round((expensesRemaining / totalExpenses) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={totalExpenses > 0 ? (expensesRemaining / totalExpenses) * 100 : 0}
                      className="h-2"
                      indicatorColor="bg-red-500"
                    />
                  </div>

                  <Separator className="my-2" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Impuestos Pagados</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">${taxesPaid.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {totalTaxes > 0 ? Math.round((taxesPaid / totalTaxes) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={totalTaxes > 0 ? (taxesPaid / totalTaxes) * 100 : 0}
                      className="h-2"
                      indicatorColor="bg-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Impuestos Pendientes</p>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">${taxesRemaining.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {totalTaxes > 0 ? Math.round((taxesRemaining / totalTaxes) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={totalTaxes > 0 ? (taxesRemaining / totalTaxes) * 100 : 0}
                      className="h-2"
                      indicatorColor="bg-amber-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="income" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Ingresos</h2>
              <p className="text-sm text-muted-foreground">Total: ${totalIncome.toLocaleString()}</p>
            </div>
            <Button onClick={() => setIsAddingIncome(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Ingreso
            </Button>
          </div>

          {isAddingIncome && (
            <Card>
              <CardHeader>
                <CardTitle>Nuevo Ingreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="income-name">Descripción</Label>
                    <Input
                      id="income-name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Ej: Salario, Freelance"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="income-amount">Monto</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        id="income-amount"
                        type="number"
                        value={newItem.amount}
                        onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="income-category">Categoría</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                    >
                      <SelectTrigger id="income-category">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.income.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsAddingIncome(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddIncome}>Guardar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {budget.income.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {categories.income.find((c) => c.id === item.category)?.name || "Otro"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-green-600">${item.amount.toLocaleString()}</p>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteIncome(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Gastos</h2>
              <p className="text-sm text-muted-foreground">Total: ${totalExpenses.toLocaleString()}</p>
            </div>
            <Button onClick={() => setIsAddingExpense(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Gasto
            </Button>
          </div>

          {isAddingExpense && (
            <Card>
              <CardHeader>
                <CardTitle>Nuevo Gasto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expense-name">Descripción</Label>
                    <Input
                      id="expense-name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Ej: Alquiler, Comida"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expense-amount">Monto</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        id="expense-amount"
                        type="number"
                        value={newItem.amount}
                        onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expense-category">Categoría</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                    >
                      <SelectTrigger id="expense-category">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.expenses.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsAddingExpense(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddExpense}>Guardar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {budget.expenses.map((item) => (
              <Card key={item.id} className={item.isPaid ? "border-green-200" : ""}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {categories.expenses.find((c) => c.id === item.category)?.name || "Otro"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-red-600">${item.amount.toLocaleString()}</p>
                      <div className="flex gap-1">
                        <Button
                          variant={item.isPaid ? "outline" : "default"}
                          size="sm"
                          className={item.isPaid ? "bg-green-50 text-green-700 border-green-200" : ""}
                          onClick={() => toggleExpensePaid(item.id)}
                        >
                          {item.isPaid ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" /> Pagado
                            </>
                          ) : (
                            "Marcar como Pagado"
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteExpense(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="savings" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Ahorros</h2>
              <p className="text-sm text-muted-foreground">Total: ${totalSavings.toLocaleString()}</p>
            </div>
            <Button onClick={() => setIsAddingSaving(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Ahorro
            </Button>
          </div>

          {isAddingSaving && (
            <Card>
              <CardHeader>
                <CardTitle>Nuevo Ahorro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="saving-name">Descripción</Label>
                    <Input
                      id="saving-name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Ej: Fondo de Emergencia"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="saving-amount">Monto</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        id="saving-amount"
                        type="number"
                        value={newItem.amount}
                        onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="saving-category">Categoría</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                    >
                      <SelectTrigger id="saving-category">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.savings.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsAddingSaving(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddSaving}>Guardar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {budget.savings.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {categories.savings.find((c) => c.id === item.category)?.name || "Otro"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-blue-600">${item.amount.toLocaleString()}</p>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteSaving(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="taxes" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Impuestos</h2>
              <p className="text-sm text-muted-foreground">Total: ${totalTaxes.toLocaleString()}</p>
            </div>
            <Button onClick={() => setIsAddingTax(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Impuesto
            </Button>
          </div>

          {isAddingTax && (
            <Card>
              <CardHeader>
                <CardTitle>Nuevo Impuesto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax-name">Descripción</Label>
                    <Input
                      id="tax-name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Ej: Impuesto a las Ganancias"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax-amount">Monto</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        id="tax-amount"
                        type="number"
                        value={newItem.amount}
                        onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax-due-date">Fecha de Vencimiento</Label>
                    <Input
                      id="tax-due-date"
                      type="date"
                      value={newItem.dueDate}
                      onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setIsAddingTax(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddTax}>Guardar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {budget.taxes.map((item) => (
              <Card key={item.id} className={item.isPaid ? "border-green-200" : ""}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Vencimiento: {item.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-amber-600">${item.amount.toLocaleString()}</p>
                      <div className="flex gap-1">
                        <Button
                          variant={item.isPaid ? "outline" : "default"}
                          size="sm"
                          className={item.isPaid ? "bg-green-50 text-green-700 border-green-200" : ""}
                          onClick={() => toggleTaxPaid(item.id)}
                        >
                          {item.isPaid ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" /> Pagado
                            </>
                          ) : (
                            "Marcar como Pagado"
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteTax(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
