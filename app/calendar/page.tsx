"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, isSameDay, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, CheckCircle, Plus } from "lucide-react"

// Datos de ejemplo para eventos
const events = [
  {
    id: 1,
    title: "Pago de Tarjeta Visa",
    date: new Date(2025, 4, 10),
    type: "payment",
    amount: "$12,500.00",
    status: "pending",
  },
  {
    id: 2,
    title: "Vencimiento Seguro Auto",
    date: new Date(2025, 4, 20),
    type: "insurance",
    amount: "$4,800.00",
    status: "pending",
  },
  {
    id: 3,
    title: "Pago de Alquiler",
    date: new Date(2025, 4, 5),
    type: "rent",
    amount: "$25,000.00",
    status: "completed",
  },
  {
    id: 4,
    title: "Revisión de Presupuesto",
    date: new Date(2025, 4, 15),
    type: "task",
    status: "pending",
  },
  {
    id: 5,
    title: "Depósito Fondo de Emergencia",
    date: new Date(2025, 4, 25),
    type: "saving",
    amount: "$5,000.00",
    status: "pending",
  },
  {
    id: 6,
    title: "Pago de Internet",
    date: new Date(2025, 4, 15),
    type: "service",
    amount: "$3,200.00",
    status: "pending",
  },
  {
    id: 7,
    title: "Facturación a Cliente",
    date: new Date(2025, 4, 28),
    type: "income",
    amount: "$45,000.00",
    status: "pending",
  },
]

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTab, setSelectedTab] = useState("upcoming")

  // Eventos para el día seleccionado
  const eventsForSelectedDay = selectedDate ? events.filter((event) => isSameDay(event.date, selectedDate)) : []

  // Eventos próximos (próximos 30 días)
  const upcomingEvents = events
    .filter((event) => event.date >= new Date() && event.date <= addDays(new Date(), 30))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  // Eventos completados
  const completedEvents = events.filter((event) => event.status === "completed")

  // Función para renderizar el contenido del día en el calendario
  const renderDay = (day: Date) => {
    const eventsForDay = events.filter((event) => isSameDay(event.date, day))
    if (eventsForDay.length === 0) return null

    return (
      <div className="relative h-full w-full flex flex-col justify-center items-center">
        <div className="text-xs font-medium">{day.getDate()}</div>
        {eventsForDay.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap justify-center">
            {eventsForDay.map((event) => (
              <div
                key={event.id}
                className={`w-2 h-2 rounded-full ${
                  event.type === "payment"
                    ? "bg-red-500"
                    : event.type === "insurance"
                      ? "bg-amber-500"
                      : event.type === "rent"
                        ? "bg-purple-500"
                        : event.type === "task"
                          ? "bg-blue-500"
                          : event.type === "saving"
                            ? "bg-green-500"
                            : event.type === "service"
                              ? "bg-cyan-500"
                              : "bg-indigo-500"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Calendario Financiero</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Calendario de Eventos</CardTitle>
            <CardDescription>
              {selectedDate ? format(selectedDate, "MMMM yyyy", { locale: es }) : "Selecciona una fecha"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              locale={es}
              components={{
                Day: ({ day, ...props }) => (
                  <div {...props} className={`${props.className} relative p-0`}>
                    {renderDay(day)}
                  </div>
                ),
              }}
            />
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs">Pagos</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs">Seguros</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-xs">Alquiler</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs">Tareas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs">Ahorros</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-xs">Servicios</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-xs">Ingresos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos del Día</CardTitle>
            <CardDescription>
              {selectedDate ? format(selectedDate, "d 'de' MMMM, yyyy", { locale: es }) : "Selecciona una fecha"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsForSelectedDay.length > 0 ? (
              <div className="space-y-4">
                {eventsForSelectedDay.map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.date, "d MMM yyyy", { locale: es })}
                        </p>
                      </div>
                      {event.amount && <p className="font-bold">{event.amount}</p>}
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <Badge
                        variant="outline"
                        className={
                          event.type === "payment"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : event.type === "insurance"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : event.type === "rent"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : event.type === "task"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : event.type === "saving"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : event.type === "service"
                                      ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                                      : "bg-indigo-50 text-indigo-700 border-indigo-200"
                        }
                      >
                        {event.type === "payment"
                          ? "Pago"
                          : event.type === "insurance"
                            ? "Seguro"
                            : event.type === "rent"
                              ? "Alquiler"
                              : event.type === "task"
                                ? "Tarea"
                                : event.type === "saving"
                                  ? "Ahorro"
                                  : event.type === "service"
                                    ? "Servicio"
                                    : "Ingreso"}
                      </Badge>
                      {event.status === "completed" ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completado
                        </Badge>
                      ) : (
                        <Button size="sm" variant="outline">
                          Completar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay eventos para esta fecha
                <div className="mt-4">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Evento
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
          <CardDescription>Eventos financieros programados</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Próximos</TabsTrigger>
              <TabsTrigger value="completed">Completados</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {format(event.date, "d MMM yyyy", { locale: es })}
                        </div>
                      </div>
                      <div className="text-right">
                        {event.amount && <p className="font-bold">{event.amount}</p>}
                        <div className="flex items-center mt-1">
                          <Badge
                            variant="outline"
                            className={
                              event.type === "payment"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : event.type === "insurance"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : event.type === "rent"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : event.type === "task"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : event.type === "saving"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : event.type === "service"
                                          ? "bg-cyan-50 text-cyan-700 border-cyan-200"
                                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                            }
                          >
                            {event.type === "payment"
                              ? "Pago"
                              : event.type === "insurance"
                                ? "Seguro"
                                : event.type === "rent"
                                  ? "Alquiler"
                                  : event.type === "task"
                                    ? "Tarea"
                                    : event.type === "saving"
                                      ? "Ahorro"
                                      : event.type === "service"
                                        ? "Servicio"
                                        : "Ingreso"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No hay eventos próximos</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="space-y-4">
                {completedEvents.length > 0 ? (
                  completedEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {format(event.date, "d MMM yyyy", { locale: es })}
                        </div>
                      </div>
                      <div className="text-right">
                        {event.amount && <p className="font-bold">{event.amount}</p>}
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Completado
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No hay eventos completados</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
