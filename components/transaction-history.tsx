"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownIcon, ArrowUpIcon, CalendarIcon, SearchIcon } from "lucide-react"

// Datos de ejemplo
const transactions = [
  {
    id: 1,
    type: "expense",
    amount: 1250.0,
    category: "housing",
    categoryName: "Vivienda",
    description: "Pago de alquiler",
    date: "2025-05-01",
  },
  {
    id: 2,
    type: "income",
    amount: 3500.0,
    category: "salary",
    categoryName: "Salario",
    description: "Pago mensual",
    date: "2025-05-01",
  },
  {
    id: 3,
    type: "expense",
    amount: 450.0,
    category: "food",
    categoryName: "Alimentación",
    description: "Supermercado",
    date: "2025-05-02",
  },
  {
    id: 4,
    type: "expense",
    amount: 200.0,
    category: "transport",
    categoryName: "Transporte",
    description: "Combustible",
    date: "2025-05-03",
  },
  {
    id: 5,
    type: "expense",
    amount: 800.0,
    category: "utilities",
    categoryName: "Servicios",
    description: "Electricidad y agua",
    date: "2025-05-05",
  },
  {
    id: 6,
    type: "income",
    amount: 500.0,
    category: "freelance",
    categoryName: "Trabajo Freelance",
    description: "Proyecto de diseño",
    date: "2025-05-07",
  },
  {
    id: 7,
    type: "expense",
    amount: 350.0,
    category: "entertainment",
    categoryName: "Entretenimiento",
    description: "Cena y cine",
    date: "2025-05-08",
  },
  {
    id: 8,
    type: "expense",
    amount: 120.0,
    category: "health",
    categoryName: "Salud",
    description: "Medicamentos",
    date: "2025-05-10",
  },
]

export function TransactionHistory() {
  const [filter, setFilter] = useState({
    search: "",
    type: "all",
    dateFrom: "",
    dateTo: "",
  })

  const filteredTransactions = transactions.filter((transaction) => {
    // Filtro por búsqueda
    if (
      filter.search &&
      !transaction.description.toLowerCase().includes(filter.search.toLowerCase()) &&
      !transaction.categoryName.toLowerCase().includes(filter.search.toLowerCase())
    ) {
      return false
    }

    // Filtro por tipo
    if (filter.type !== "all" && transaction.type !== filter.type) {
      return false
    }

    // Filtro por fecha desde
    if (filter.dateFrom && transaction.date < filter.dateFrom) {
      return false
    }

    // Filtro por fecha hasta
    if (filter.dateTo && transaction.date > filter.dateTo) {
      return false
    }

    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Transacciones</CardTitle>
        <CardDescription>Visualiza y filtra tus transacciones recientes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="pl-8"
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </div>

            <div>
              <Select value={filter.type} onValueChange={(value) => setFilter({ ...filter, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Ingresos</SelectItem>
                  <SelectItem value="expense">Gastos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="text-xs">
                Desde
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateFrom"
                  type="date"
                  value={filter.dateFrom}
                  onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo" className="text-xs">
                Hasta
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateTo"
                  type="date"
                  value={filter.dateTo}
                  onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-[1fr_1fr_1fr_auto] md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 p-4 font-medium border-b">
              <div>Fecha</div>
              <div className="hidden md:block">Categoría</div>
              <div>Descripción</div>
              <div className="text-right">Monto</div>
              <div></div>
            </div>
            <div className="divide-y">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="grid grid-cols-[1fr_1fr_1fr_auto] md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 p-4 items-center"
                  >
                    <div>{new Date(transaction.date).toLocaleDateString()}</div>
                    <div className="hidden md:block">{transaction.categoryName}</div>
                    <div>{transaction.description}</div>
                    <div
                      className={`text-right font-medium ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </div>
                    <Button variant="ghost" size="icon">
                      {transaction.type === "income" ? (
                        <ArrowUpIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-red-600" />
                      )}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No se encontraron transacciones con los filtros aplicados
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Mostrando {filteredTransactions.length} de {transactions.length} transacciones
            </div>
            <Button variant="outline" size="sm">
              Ver Más
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
