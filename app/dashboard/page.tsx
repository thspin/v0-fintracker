import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Download, FileText, Calendar } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard Financiero</h1>
        <div className="flex items-center space-x-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="from" className="text-xs">
                Desde
              </Label>
              <div className="relative">
                <Input id="from" type="date" className="h-8" />
                <Calendar className="absolute right-2 top-1.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="to" className="text-xs">
                Hasta
              </Label>
              <div className="relative">
                <Input id="to" type="date" className="h-8" />
                <Calendar className="absolute right-2 top-1.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-8 mt-6">
            <FileText className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
          <Button variant="outline" size="sm" className="h-8 mt-6">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <CardDescription>Año actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% respecto al año anterior</p>
            <div className="mt-4 h-1 w-full bg-muted">
              <div className="h-1 bg-green-500 w-[75%]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
            <CardDescription>Año actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$32,450.20</div>
            <p className="text-xs text-muted-foreground">+12.3% respecto al año anterior</p>
            <div className="mt-4 h-1 w-full bg-muted">
              <div className="h-1 bg-red-500 w-[60%]" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Deuda Total</CardTitle>
            <CardDescription>Actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$15,000.00</div>
            <p className="text-xs text-muted-foreground">25% del patrimonio total</p>
            <div className="mt-4 h-1 w-full bg-muted">
              <div className="h-1 bg-blue-500 w-[25%]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monthly">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="monthly">Mensual</TabsTrigger>
            <TabsTrigger value="quarterly">Trimestral</TabsTrigger>
            <TabsTrigger value="yearly">Anual</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flujo de Ingresos y Egresos</CardTitle>
              <CardDescription>Evolución mensual del año actual</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground">[Gráfico de líneas mostrando ingresos y egresos mensuales]</div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Ingresos</CardTitle>
                <CardDescription>Por categoría</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground">[Gráfico de torta mostrando distribución de ingresos]</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución de Egresos</CardTitle>
                <CardDescription>Por categoría</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground">[Gráfico de torta mostrando distribución de egresos]</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quarterly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análisis Trimestral</CardTitle>
              <CardDescription>Comparativa por trimestre</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground">[Gráfico de barras mostrando comparativa trimestral]</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución Anual</CardTitle>
              <CardDescription>Últimos 5 años</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-muted-foreground">[Gráfico de líneas mostrando evolución anual]</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Objetivos de Ahorro</CardTitle>
          <CardDescription>Progreso actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Fondo de Emergencia</p>
                  <p className="text-xs text-muted-foreground">Meta: $10,000</p>
                </div>
                <p className="font-medium">75%</p>
              </div>
              <div className="h-2 w-full bg-muted rounded-full">
                <div className="h-2 bg-green-500 rounded-full w-[75%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Vacaciones</p>
                  <p className="text-xs text-muted-foreground">Meta: $5,000</p>
                </div>
                <p className="font-medium">40%</p>
              </div>
              <div className="h-2 w-full bg-muted rounded-full">
                <div className="h-2 bg-blue-500 rounded-full w-[40%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nuevo Vehículo</p>
                  <p className="text-xs text-muted-foreground">Meta: $20,000</p>
                </div>
                <p className="font-medium">15%</p>
              </div>
              <div className="h-2 w-full bg-muted rounded-full">
                <div className="h-2 bg-purple-500 rounded-full w-[15%]" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
