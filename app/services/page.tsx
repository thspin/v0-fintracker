"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Plus, Trash2, Edit, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

// Datos de ejemplo para servicios
const initialServices = [
  {
    id: 1,
    name: "Netflix",
    amount: 3500,
    dueDay: 15,
    category: "entertainment",
    isAutomatic: true,
    isActive: true,
    history: [
      { date: "2025-04-15", amount: 3500, status: "paid" },
      { date: "2025-03-15", amount: 3500, status: "paid" },
      { date: "2025-02-15", amount: 3200, status: "paid" },
    ],
  },
  {
    id: 2,
    name: "Spotify",
    amount: 1200,
    dueDay: 10,
    category: "entertainment",
    isAutomatic: true,
    isActive: true,
    history: [
      { date: "2025-04-10", amount: 1200, status: "paid" },
      { date: "2025-03-10", amount: 1200, status: "paid" },
      { date: "2025-02-10", amount: 1100, status: "paid" },
    ],
  },
  {
    id: 3,
    name: "Gimnasio",
    amount: 5000,
    dueDay: 5,
    category: "health",
    isAutomatic: false,
    isActive: true,
    history: [
      { date: "2025-04-05", amount: 5000, status: "pending" },
      { date: "2025-03-05", amount: 5000, status: "paid" },
      { date: "2025-02-05", amount: 4800, status: "paid" },
    ],
  },
  {
    id: 4,
    name: "Internet",
    amount: 8500,
    dueDay: 20,
    category: "utilities",
    isAutomatic: false,
    isActive: true,
    history: [
      { date: "2025-03-20", amount: 8500, status: "paid" },
      { date: "2025-02-20", amount: 8200, status: "paid" },
      { date: "2025-01-20", amount: 8200, status: "paid" },
    ],
  },
  {
    id: 5,
    name: "Electricidad",
    amount: 4500,
    dueDay: 12,
    category: "utilities",
    isAutomatic: false,
    isActive: true,
    history: [
      { date: "2025-04-12", amount: 4500, status: "pending" },
      { date: "2025-03-12", amount: 4200, status: "paid" },
      { date: "2025-02-12", amount: 3900, status: "paid" },
    ],
  },
]

// Categorías de servicios
const serviceCategories = [
  { id: "utilities", name: "Servicios Públicos" },
  { id: "entertainment", name: "Entretenimiento" },
  { id: "health", name: "Salud" },
  { id: "education", name: "Educación" },
  { id: "insurance", name: "Seguros" },
  { id: "subscription", name: "Suscripciones" },
  { id: "other", name: "Otros" },
]

export default function ServicesPage() {
  const [services, setServices] = useState(initialServices)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isAddingService, setIsAddingService] = useState(false)
  const [newService, setNewService] = useState({
    name: "",
    amount: "",
    dueDay: "",
    category: "",
    isAutomatic: false,
  })
  const [editingService, setEditingService] = useState<number | null>(null)

  // Obtener servicios para el mes seleccionado
  const getServicesForMonth = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()

    return services
      .filter((service) => service.isActive)
      .map((service) => {
        const dueDate = new Date(year, month, service.dueDay)

        // Si el día del mes no existe (ej. 31 de febrero), ajustar al último día del mes
        if (dueDate.getMonth() !== month) {
          dueDate.setDate(0) // Último día del mes anterior
        }

        // Determinar el estado del servicio para este mes
        let status = "upcoming"
        const today = new Date()

        // Verificar si ya pasó la fecha de vencimiento
        if (dueDate < today) {
          // Buscar en el historial si ya fue pagado
          const historyEntry = service.history.find((h) => {
            const historyDate = new Date(h.date)
            return historyDate.getMonth() === month && historyDate.getFullYear() === year
          })

          status = historyEntry ? (historyEntry.status === "paid" ? "paid" : "pending") : "overdue"
        } else if (
          dueDate.getDate() === today.getDate() &&
          dueDate.getMonth() === today.getMonth() &&
          dueDate.getFullYear() === today.getFullYear()
        ) {
          status = "today"
        }

        return {
          ...service,
          dueDate,
          status,
        }
      })
  }

  const monthlyServices = getServicesForMonth()

  // Agrupar servicios por día para el calendario
  const servicesByDay: Record<number, any[]> = {}
  monthlyServices.forEach((service) => {
    const day = service.dueDate.getDate()
    if (!servicesByDay[day]) {
      servicesByDay[day] = []
    }
    servicesByDay[day].push(service)
  })

  // Manejar la adición de un nuevo servicio
  const handleAddService = () => {
    if (!newService.name || !newService.amount || !newService.dueDay || !newService.category) {
      return
    }

    const newId = Math.max(...services.map((s) => s.id)) + 1

    setServices([
      ...services,
      {
        id: newId,
        name: newService.name,
        amount: Number.parseFloat(newService.amount),
        dueDay: Number.parseInt(newService.dueDay),
        category: newService.category,
        isAutomatic: newService.isAutomatic,
        isActive: true,
        history: [],
      },
    ])

    setNewService({
      name: "",
      amount: "",
      dueDay: "",
      category: "",
      isAutomatic: false,
    })

    setIsAddingService(false)
  }

  // Manejar la edición de un servicio
  const handleEditService = (id: number) => {
    const serviceToEdit = services.find((s) => s.id === id)
    if (!serviceToEdit) return

    setEditingService(id)
    setNewService({
      name: serviceToEdit.name,
      amount: serviceToEdit.amount.toString(),
      dueDay: serviceToEdit.dueDay.toString(),
      category: serviceToEdit.category,
      isAutomatic: serviceToEdit.isAutomatic,
    })

    setIsAddingService(true)
  }

  // Guardar cambios en un servicio editado
  const handleSaveEdit = () => {
    if (!editingService) return

    setServices(
      services.map((service) =>
        service.id === editingService
          ? {
              ...service,
              name: newService.name,
              amount: Number.parseFloat(newService.amount),
              dueDay: Number.parseInt(newService.dueDay),
              category: newService.category,
              isAutomatic: newService.isAutomatic,
            }
          : service,
      ),
    )

    setNewService({
      name: "",
      amount: "",
      dueDay: "",
      category: "",
      isAutomatic: false,
    })

    setIsAddingService(false)
    setEditingService(null)
  }

  // Eliminar un servicio
  const handleDeleteService = (id: number) => {
    setServices(services.filter((service) => service.id !== id))
  }

  // Marcar un servicio como pagado
  const handleMarkAsPaid = (id: number) => {
    const today = new Date()

    setServices(
      services.map((service) => {
        if (service.id === id) {
          return {
            ...service,
            history: [
              {
                date: today.toISOString().split("T")[0],
                amount: service.amount,
                status: "paid",
              },
              ...service.history,
            ],
          }
        }
        return service
      }),
    )
  }

  // Renderizar el contenido del día en el calendario
  const renderDay = (day: number) => {
    const dayServices = servicesByDay[day] || []
    if (dayServices.length === 0) return null

    return (
      <div className="w-full h-full flex flex-col justify-center items-center">
        <div className="text-xs font-medium">{day}</div>
        {dayServices.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap justify-center">
            {dayServices.map((service) => (
              <div
                key={service.id}
                className={cn(
                  "w-2 h-2 rounded-full",
                  service.status === "paid" && "bg-green-500",
                  service.status === "pending" && "bg-amber-500",
                  service.status === "overdue" && "bg-red-500",
                  service.status === "upcoming" && "bg-blue-500",
                  service.status === "today" && "bg-purple-500",
                )}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Servicios Recurrentes</h1>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Calendario de Vencimientos</CardTitle>
                <CardDescription>Visualiza los vencimientos de tus servicios recurrentes</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                  locale={es}
                  components={{
                    Day: ({ day, ...props }) => (
                      <div {...props} className={cn(props.className, "relative p-0")}>
                        {renderDay(day.day)}
                      </div>
                    ),
                  }}
                />
                <div className="flex flex-wrap gap-3 mt-4 justify-center">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-xs">Pagado</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-xs">Pendiente</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-xs">Vencido</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs">Próximo</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-xs">Hoy</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Servicios del Mes</CardTitle>
                <CardDescription>{format(selectedDate, "MMMM yyyy", { locale: es })}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyServices.length > 0 ? (
                    monthlyServices.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">{service.name}</p>
                            {service.isAutomatic && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Auto
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Vence: {format(service.dueDate, "dd/MM/yyyy")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${service.amount.toLocaleString()}</p>
                          <div className="flex items-center justify-end">
                            {service.status === "paid" && (
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Pagado
                              </Badge>
                            )}
                            {service.status === "pending" && (
                              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                                <Clock className="h-3 w-3 mr-1" />
                                Pendiente
                              </Badge>
                            )}
                            {service.status === "overdue" && (
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Vencido
                              </Badge>
                            )}
                            {service.status === "upcoming" && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                <Clock className="h-3 w-3 mr-1" />
                                Próximo
                              </Badge>
                            )}
                            {service.status === "today" && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Hoy
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">No hay servicios para este mes</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Mis Servicios</h2>
            <Button
              onClick={() => {
                setIsAddingService(true)
                setEditingService(null)
                setNewService({
                  name: "",
                  amount: "",
                  dueDay: "",
                  category: "",
                  isAutomatic: false,
                })
              }}
              className="animate-pulse hover:scale-105 active:scale-95"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Servicio
            </Button>
          </div>

          {isAddingService && (
            <Card>
              <CardHeader>
                <CardTitle>{editingService ? "Editar Servicio" : "Nuevo Servicio"}</CardTitle>
                <CardDescription>
                  {editingService ? "Modifica los datos del servicio" : "Ingresa los datos del nuevo servicio"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service-name">Nombre del Servicio</Label>
                    <Input
                      id="service-name"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      placeholder="Ej: Netflix, Luz, Internet"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-amount">Monto Mensual</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        id="service-amount"
                        value={newService.amount}
                        onChange={(e) => setNewService({ ...newService, amount: e.target.value })}
                        placeholder="0.00"
                        className="pl-7"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-due-day">Día de Vencimiento</Label>
                    <Input
                      id="service-due-day"
                      type="number"
                      min="1"
                      max="31"
                      value={newService.dueDay}
                      onChange={(e) => setNewService({ ...newService, dueDay: e.target.value })}
                      placeholder="Ej: 15"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service-category">Categoría</Label>
                    <Select
                      value={newService.category}
                      onValueChange={(value) => setNewService({ ...newService, category: value })}
                      required
                    >
                      <SelectTrigger id="service-category">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2 flex items-center space-x-2 pt-2">
                    <Switch
                      id="automatic-payment"
                      checked={newService.isAutomatic}
                      onCheckedChange={(checked) => setNewService({ ...newService, isAutomatic: checked })}
                    />
                    <Label htmlFor="automatic-payment">Pago Automático</Label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingService(false)
                      setEditingService(null)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={editingService ? handleSaveEdit : handleAddService}
                    className="animate-pulse hover:scale-105 active:scale-95"
                  >
                    {editingService ? "Guardar Cambios" : "Agregar Servicio"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{service.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditService(service.id)}
                        className="h-8 w-8 hover:scale-110 active:scale-95"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteService(service.id)}
                        className="h-8 w-8 text-destructive hover:scale-110 active:scale-95"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>Vence el día {service.dueDay} de cada mes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Monto Mensual</p>
                        <p className="text-lg font-bold">${service.amount.toLocaleString()}</p>
                      </div>
                      <Badge variant="outline">
                        {serviceCategories.find((c) => c.id === service.category)?.name || "Otro"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch id={`auto-${service.id}`} checked={service.isAutomatic} disabled />
                        <Label htmlFor={`auto-${service.id}`} className="text-sm">
                          Pago Automático
                        </Label>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(service.id)}
                        className="animate-pulse hover:scale-105 active:scale-95"
                      >
                        Marcar como Pagado
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pagos</CardTitle>
              <CardDescription>Registro de pagos de servicios recurrentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {services
                  .flatMap((service) =>
                    service.history.map((entry, index) => ({
                      ...entry,
                      serviceName: service.name,
                      serviceId: service.id,
                      key: `${service.id}-${index}`,
                    })),
                  )
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((entry) => (
                    <div key={entry.key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{entry.serviceName}</p>
                        <p className="text-xs text-muted-foreground">
                          Fecha: {new Date(entry.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${entry.amount.toLocaleString()}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            entry.status === "paid"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-amber-100 text-amber-800 border-amber-300",
                          )}
                        >
                          {entry.status === "paid" ? "Pagado" : "Pendiente"}
                        </Badge>
                      </div>
                    </div>
                  ))}

                {services.flatMap((service) => service.history).length === 0 && (
                  <div className="text-center text-muted-foreground py-4">No hay historial de pagos disponible</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
