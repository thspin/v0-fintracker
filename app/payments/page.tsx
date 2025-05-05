import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PaymentCard } from "@/components/payment-card"

export default function PaymentsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Gestión de Pagos</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="upcoming">Próximos</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PaymentCard
              title="Tarjeta de Crédito Visa"
              description="Vencimiento: 10/05/2025"
              amount="$12,500.00"
              type="credit-card"
              urgent={true}
            />

            <PaymentCard
              title="Préstamo Personal"
              description="Cuota 5 de 24"
              amount="$8,500.00"
              type="loan"
              urgent={false}
            />

            <PaymentCard
              title="Servicio de Internet"
              description="Vencimiento: 15/05/2025"
              amount="$3,200.00"
              type="service"
              urgent={false}
            />

            <PaymentCard
              title="Alquiler"
              description="Vencimiento: 05/05/2025"
              amount="$25,000.00"
              type="rent"
              urgent={true}
            />

            <PaymentCard
              title="Seguro del Automóvil"
              description="Vencimiento: 20/05/2025"
              amount="$4,800.00"
              type="insurance"
              urgent={false}
            />
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagos Próximos</CardTitle>
              <CardDescription>Pagos programados para los próximos 30 días</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <UpcomingPaymentRow
                  title="Tarjeta de Crédito Mastercard"
                  date="15/05/2025"
                  amount="$9,800.00"
                  daysLeft={12}
                />

                <UpcomingPaymentRow title="Servicio de Luz" date="18/05/2025" amount="$2,300.00" daysLeft={15} />

                <UpcomingPaymentRow title="Servicio de Agua" date="20/05/2025" amount="$1,500.00" daysLeft={17} />

                <UpcomingPaymentRow title="Cuota Gimnasio" date="01/06/2025" amount="$3,000.00" daysLeft={29} />

                <UpcomingPaymentRow title="Impuesto Municipal" date="10/06/2025" amount="$4,200.00" daysLeft={38} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Pagos</CardTitle>
              <CardDescription>Últimos pagos realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <HistoryPaymentRow
                  title="Tarjeta de Crédito Visa"
                  date="10/04/2025"
                  amount="$11,800.00"
                  status="completed"
                />

                <HistoryPaymentRow title="Préstamo Personal" date="05/04/2025" amount="$8,500.00" status="completed" />

                <HistoryPaymentRow
                  title="Servicio de Internet"
                  date="15/04/2025"
                  amount="$3,200.00"
                  status="completed"
                />

                <HistoryPaymentRow title="Alquiler" date="05/04/2025" amount="$25,000.00" status="completed" />

                <HistoryPaymentRow
                  title="Seguro del Automóvil"
                  date="20/03/2025"
                  amount="$4,800.00"
                  status="completed"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Deudas</CardTitle>
          <CardDescription>Estado actual de tus deudas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tarjetas de Crédito</p>
                  <p className="text-xs text-muted-foreground">2 tarjetas activas</p>
                </div>
                <p className="font-medium">$22,300.00</p>
              </div>
              <div className="h-2 w-full bg-muted rounded-full">
                <div className="h-2 bg-red-500 rounded-full w-[45%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Préstamos</p>
                  <p className="text-xs text-muted-foreground">1 préstamo activo</p>
                </div>
                <p className="font-medium">$85,000.00</p>
              </div>
              <div className="h-2 w-full bg-muted rounded-full">
                <div className="h-2 bg-blue-500 rounded-full w-[70%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Servicios</p>
                  <p className="text-xs text-muted-foreground">3 servicios mensuales</p>
                </div>
                <p className="font-medium">$7,000.00</p>
              </div>
              <div className="h-2 w-full bg-muted rounded-full">
                <div className="h-2 bg-green-500 rounded-full w-[25%]" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UpcomingPaymentRow({
  title,
  date,
  amount,
  daysLeft,
}: {
  title: string
  date: string
  amount: string
  daysLeft: number
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">Vencimiento: {date}</p>
      </div>
      <div className="text-right">
        <p className="font-bold">{amount}</p>
        <p className={`text-xs ${daysLeft <= 7 ? "text-red-500" : "text-muted-foreground"}`}>
          {daysLeft} días restantes
        </p>
      </div>
    </div>
  )
}

function HistoryPaymentRow({
  title,
  date,
  amount,
  status,
}: {
  title: string
  date: string
  amount: string
  status: "completed" | "failed" | "pending"
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">Fecha: {date}</p>
      </div>
      <div className="text-right">
        <p className="font-bold">{amount}</p>
        <p
          className={`text-xs ${
            status === "completed" ? "text-green-500" : status === "failed" ? "text-red-500" : "text-amber-500"
          }`}
        >
          {status === "completed" ? "Completado" : status === "failed" ? "Fallido" : "Pendiente"}
        </p>
      </div>
    </div>
  )
}
