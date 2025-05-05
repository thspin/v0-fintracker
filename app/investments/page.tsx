"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2 } from "lucide-react"

// Datos de ejemplo para inversiones y patrimonio
const initialInvestments = {
  assets: [
    { id: 1, name: "Departamento", value: 25000000, category: "real-estate", appreciation: 5 },
    { id: 2, name: "Automóvil", value: 3500000, category: "vehicle", appreciation: -10 },
    { id: 3, name: "Cuenta de Ahorro", value: 500000, category: "cash", appreciation: 1 },
  ],
  investments: [
    { id: 1, name: "Acciones Empresa A", value: 250000, category: "stocks", return: 8, risk: "medium" },
    { id: 2, name: "Bonos Gobierno", value: 500000, category: "bonds", return: 4, risk: "low" },
    { id: 3, name: "Fondo Común de Inversión", value: 300000, category: "mutual-funds", return: 6, risk: "medium" },
    { id: 4, name: "Criptomonedas", value: 100000, category: "crypto", return: 15, risk: "high" },
  ],
  liabilities: [
    { id: 1, name: "Hipoteca", value: 15000000, category: "mortgage", interest: 7 },
    { id: 2, name: "Préstamo Automóvil", value: 1500000, category: "auto-loan", interest: 9 },
    { id: 3, name: "Tarjeta de Crédito", value: 50000, category: "credit-card", interest: 35 },
  ],
  futureExpenses: [
    { id: 1, name: "Renovación Hogar", value: 1000000, category: "home", priority: "medium", timeframe: "1-2 años" },
    { id: 2, name: "Viaje Internacional", value: 500000, category: "travel", priority: "low", timeframe: "6 meses" },
    {
      id: 3,
      name: "Curso de Especialización",
      value: 200000,
      category: "education",
      priority: "high",
      timeframe: "3 meses",
    },
  ],
}

// Categorías
const categories = {
  assets: [
    { id: "real-estate", name: "Bienes Raíces" },
    { id: "vehicle", name: "Vehículos" },
    { id: "cash", name: "Efectivo y Equivalentes" },
    { id: "collectibles", name: "Coleccionables" },
    { id: "other-assets", name: "Otros Activos" },
  ],
  investments: [
    { id: "stocks", name: "Acciones" },
    { id: "bonds", name: "Bonos" },
    { id: "mutual-funds", name: "Fondos Comunes" },
    { id: "etfs", name: "ETFs" },
    { id: "crypto", name: "Criptomonedas" },
    { id: "other-investments", name: "Otras Inversiones" },
  ],
  liabilities: [
    { id: "mortgage", name: "Hipoteca" },
    { id: "auto-loan", name: "Préstamo Automóvil" },
    { id: "personal-loan", name: "Préstamo Personal" },
    { id: "credit-card", name: "Tarjeta de Crédito" },
    { id: "other-debt", name: "Otras Deudas" },
  ],
  futureExpenses: [
    { id: "home", name: "Hogar" },
    { id: "travel", name: "Viajes" },
    { id: "education", name: "Educación" },
    { id: "health", name: "Salud" },
    { id: "technology", name: "Tecnología" },
    { id: "other-expenses", name: "Otros Gastos" },
  ],
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState(initialInvestments)
  const [activeTab, setActiveTab] = useState("overview")
  const [isAddingAsset, setIsAddingAsset] = useState(false)
  const [isAddingInvestment, setIsAddingInvestment] = useState(false)
  const [isAddingLiability, setIsAddingLiability] = useState(false)
  const [isAddingFutureExpense, setIsAddingFutureExpense] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    value: "",
    category: "",
    appreciation: "",
    return: "",
    risk: "",
    interest: "",
    priority: "",
    timeframe: "",
  })

  // Calcular totales
  const totalAssets = investments.assets.reduce((sum, item) => sum + item.value, 0)
  const totalInvestments = investments.investments.reduce((sum, item) => sum + item.value, 0)
  const totalLiabilities = investments.liabilities.reduce((sum, item) => sum + item.value, 0)
  const totalFutureExpenses = investments.futureExpenses.reduce((sum, item) => sum + item.value, 0)
  const netWorth = totalAssets + totalInvestments - totalLiabilities

  // Manejar la adición de un nuevo activo
  const handleAddAsset = () => {
    if (!newItem.name || !newItem.value || !newItem.category) return

    const newAsset = {
      id: Math.max(0, ...investments.assets.map((item) => item.id)) + 1,
      name: newItem.name,
      value: Number(newItem.value),
      category: newItem.category,
      appreciation: Number(newItem.appreciation) || 0,
    }

    setInvestments({
      ...investments,
      assets: [...investments.assets, newAsset],
    })

    setNewItem({
      name: "",
      value: "",
      category: "",
      appreciation: "",
      return: "",
      risk: "",
      interest: "",
      priority: "",
      timeframe: "",
    })
    setIsAddingAsset(false)
  }

  // Manejar la adición de una nueva inversión
  const handleAddInvestment = () => {
    if (!newItem.name || !newItem.value || !newItem.category || !newItem.return || !newItem.risk) return

    const newInvestment = {
      id: Math.max(0, ...investments.investments.map((item) => item.id)) + 1,
      name: newItem.name,
      value: Number(newItem.value),
      category: newItem.category,
      return: Number(newItem.return),
      risk: newItem.risk,
    }

    setInvestments({
      ...investments,
      investments: [...investments.investments, newInvestment],
    })

    setNewItem({
      name: "",
      value: "",
      category: "",
      appreciation: "",
      return: "",
      risk: "",
      interest: "",
      priority: "",
      timeframe: "",
    })
    setIsAddingInvestment(false)
  }

  // Manejar la adición de un nuevo pasivo
  const handleAddLiability = () => {
    if (!newItem.name || !newItem.value || !newItem.category || !newItem.interest) return

    const newLiability = {
      id: Math.max(0, ...investments.liabilities.map((item) => item.id)) + 1,
      name: newItem.name,
      value: Number(newItem.value),
      category: newItem.category,
      interest: Number(newItem.interest),
    }

    setInvestments({
      ...investments,
      liabilities: [...investments.liabilities, newLiability],
    })

    setNewItem({
      name: "",
      value: "",
      category: "",
      appreciation: "",
      return: "",
      risk: "",
      interest: "",
      priority: "",
      timeframe: "",
    })
    setIsAddingLiability(false)
  }

  // Manejar la adición de un nuevo gasto futuro
  const handleAddFutureExpense = () => {
    if (!newItem.name || !newItem.value || !newItem.category || !newItem.priority || !newItem.timeframe) return

    const newFutureExpense = {
      id: Math.max(0, ...investments.futureExpenses.map((item) => item.id)) + 1,
      name: newItem.name,
      value: Number(newItem.value),
      category: newItem.category,
      priority: newItem.priority,
      timeframe: newItem.timeframe,
    }

    setInvestments({
      ...investments,
      futureExpenses: [...investments.futureExpenses, newFutureExpense],
    })

    setNewItem({
      name: "",
      value: "",
      category: "",
      appreciation: "",
      return: "",
      risk: "",
      interest: "",
      priority: "",
      timeframe: "",
    })
    setIsAddingFutureExpense(false)
  }

  // Eliminar un activo
  const deleteAsset = (id: number) => {
    setInvestments({
      ...investments,
      assets: investments.assets.filter((item) => item.id !== id),
    })
  }

  // Eliminar una inversión
  const deleteInvestment = (id: number) => {
    setInvestments({
      ...investments,
      investments: investments.investments.filter((item) => item.id !== id),
    })
  }

  // Eliminar un pasivo
  const deleteLiability = (id: number) => {
    setInvestments({
      ...investments,
      liabilities: investments.liabilities.filter((item) => item.id !== id),
    })
  }

  // Eliminar un gasto futuro
  const deleteFutureExpense = (id: number) => {
    setInvestments({
      ...investments,
      futureExpenses: investments.futureExpenses.filter((item) => item.id !== id),
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Inversiones y Patrimonio</h1>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="assets">Activos</TabsTrigger>
          <TabsTrigger value="investments">Inversiones</TabsTrigger>
          <TabsTrigger value="liabilities">Pasivos</TabsTrigger>
          <TabsTrigger value="future-expenses">Gastos Futuros</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Patrimonio Neto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netWorth >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${netWorth.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Activos - Pasivos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Activos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">${totalAssets.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{investments.assets.length} activos registrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Inversiones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">${totalInvestments.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{investments.investments.length} inversiones activas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pasivos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">${totalLiabilities.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{investments.liabilities.length} pasivos registrados</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribución del Patrimonio</CardTitle>
              <CardDescription>Composición de tus activos e inversiones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                      <p className="font-medium">Activos</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">${totalAssets.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((totalAssets / (totalAssets + totalInvestments)) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mr-2" />
                      <p className="font-medium">Inversiones</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">${totalInvestments.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round((totalInvestments / (totalAssets + totalInvestments)) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activos</CardTitle>
              <CardDescription>Lista de tus activos actuales.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Apreciación Anual
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {investments.assets.map((asset) => (
                      <tr key={asset.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{asset.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${asset.value.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {categories.assets.find((cat) => cat.id === asset.category)?.name || "Sin categoría"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{asset.appreciation}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteAsset(asset.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isAddingAsset ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    type="text"
                    placeholder="Nombre del Activo"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Valor del Activo"
                    value={newItem.value}
                    onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                  />
                  <Select onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.assets.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Apreciación Anual (%)"
                    value={newItem.appreciation}
                    onChange={(e) => setNewItem({ ...newItem, appreciation: e.target.value })}
                  />
                  <Button onClick={handleAddAsset} className="col-span-1 md:col-span-2">
                    Agregar Activo
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsAddingAsset(true)}>Agregar Activo</Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Inversiones</CardTitle>
              <CardDescription>Lista de tus inversiones actuales.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Retorno Anual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Riesgo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {investments.investments.map((investment) => (
                      <tr key={investment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{investment.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${investment.value.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {categories.investments.find((cat) => cat.id === investment.category)?.name ||
                            "Sin categoría"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{investment.return}%</td>
                        <td className="px-6 py-4 whitespace-nowrap">{investment.risk}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteInvestment(investment.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isAddingInvestment ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    type="text"
                    placeholder="Nombre de la Inversión"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Valor de la Inversión"
                    value={newItem.value}
                    onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                  />
                  <Select onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.investments.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Retorno Anual (%)"
                    value={newItem.return}
                    onChange={(e) => setNewItem({ ...newItem, return: e.target.value })}
                  />
                  <Select onValueChange={(value) => setNewItem({ ...newItem, risk: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Riesgo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Bajo</SelectItem>
                      <SelectItem value="medium">Medio</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddInvestment} className="col-span-1 md:col-span-2">
                    Agregar Inversión
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsAddingInvestment(true)}>Agregar Inversión</Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="liabilities" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pasivos</CardTitle>
              <CardDescription>Lista de tus pasivos actuales.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interés Anual
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {investments.liabilities.map((liability) => (
                      <tr key={liability.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{liability.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${liability.value.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {categories.liabilities.find((cat) => cat.id === liability.category)?.name || "Sin categoría"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{liability.interest}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteLiability(liability.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isAddingLiability ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    type="text"
                    placeholder="Nombre del Pasivo"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Valor del Pasivo"
                    value={newItem.value}
                    onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                  />
                  <Select onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.liabilities.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Interés Anual (%)"
                    value={newItem.interest}
                    onChange={(e) => setNewItem({ ...newItem, interest: e.target.value })}
                  />
                  <Button onClick={handleAddLiability} className="col-span-1 md:col-span-2">
                    Agregar Pasivo
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsAddingLiability(true)}>Agregar Pasivo</Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="future-expenses" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Gastos Futuros</CardTitle>
              <CardDescription>Lista de tus gastos futuros planificados.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioridad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plazo
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {investments.futureExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{expense.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${expense.value.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {categories.futureExpenses.find((cat) => cat.id === expense.category)?.name ||
                            "Sin categoría"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{expense.priority}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{expense.timeframe}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteFutureExpense(expense.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {isAddingFutureExpense ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    type="text"
                    placeholder="Nombre del Gasto Futuro"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Valor del Gasto Futuro"
                    value={newItem.value}
                    onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                  />
                  <Select onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.futureExpenses.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select onValueChange={(value) => setNewItem({ ...newItem, priority: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={(value) => setNewItem({ ...newItem, timeframe: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Plazo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3 meses">3 meses</SelectItem>
                      <SelectItem value="6 meses">6 meses</SelectItem>
                      <SelectItem value="1-2 años">1-2 años</SelectItem>
                      <SelectItem value="2+ años">2+ años</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddFutureExpense} className="col-span-1 md:col-span-2">
                    Agregar Gasto Futuro
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsAddingFutureExpense(true)}>Agregar Gasto Futuro</Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
