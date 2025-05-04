import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PiggyBank, TrendingUp, Target, ArrowUpRight } from "lucide-react"

export default function SavingsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Objetivos de Ahorro</h1>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Activos</TabsTrigger>
          <TabsTrigger value="completed">Completados</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SavingGoalCard
              title="Fondo de Emergencia"
              currentAmount={7500}
              targetAmount={10000}
              deadline="Sin fecha límite"
              icon={<PiggyBank className="h-5 w-5" />}
              progress={75}
            />

            <SavingGoalCard
              title="Vacaciones"
              currentAmount={2000}
              targetAmount={5000}
              deadline="01/12/2025"
              icon={<Target className="h-5 w-5" />}
              progress={40}
            />

            <SavingGoalCard
              title="Nuevo Vehículo"
              currentAmount={3000}
              targetAmount={20000}
              deadline="01/06/2026"
              icon={<Target className="h-5 w-5" />}
              progress={15}
            />

            <Button className="flex items-center justify-center h-full min-h-[200px] border-2 border-dashed border-muted-foreground/20 bg-transparent hover:bg-muted/50">
              <PiggyBank className="h-6 w-6 mr-2" />
              Crear Nuevo Objetivo
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Objetivos Completados</CardTitle>
              <CardDescription>Historial de objetivos alcanzados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <CompletedGoalRow
                  title="Laptop Nueva"
                  amount="$15,000.00"
                  completedDate="15/01/2025"
                  duration="6 meses"
                />

                <CompletedGoalRow
                  title="Curso de Inversiones"
                  amount="$5,000.00"
                  completedDate="10/03/2025"
                  duration="3 meses"
                />

                <CompletedGoalRow
                  title="Renovación Hogar"
                  amount="$25,000.00"
                  completedDate="20/12/2024"
                  duration="12 meses"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento de Ahorro</CardTitle>
              <CardDescription>Análisis de tu capacidad de ahorro</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="font-medium">Tasa de Ahorro Mensual</p>
                    <p className="font-bold text-green-600">18%</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Porcentaje de tus ingresos que estás destinando al ahorro
                  </p>
                  <Progress value={18} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="font-medium">Progreso General</p>
                    <p className="font-bold">42%</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Progreso promedio en todos tus objetivos activos</p>
                  <Progress value={42} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="font-medium">Tiempo Estimado</p>
                    <p className="font-bold">18 meses</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tiempo estimado para completar todos tus objetivos actuales
                  </p>
                </div>

                <div className="pt-4">
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Recomendación</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Aumentando tu tasa de ahorro al 25%, podrías reducir el tiempo para alcanzar tus objetivos en 6
                        meses.
                      </p>
                      <Button variant="link" className="p-0 h-auto mt-2 text-sm">
                        Ver estrategias de ahorro
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Proyección de Ahorro</CardTitle>
          <CardDescription>Estimación de crecimiento de tus ahorros</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground">[Gráfico de proyección de ahorro a 5 años]</div>
        </CardContent>
      </Card>
    </div>
  )
}

function SavingGoalCard({
  title,
  currentAmount,
  targetAmount,
  deadline,
  icon,
  progress,
}: {
  title: string
  currentAmount: number
  targetAmount: number
  deadline: string
  icon: React.ReactNode
  progress: number
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
        </div>
        <CardDescription>Meta: ${targetAmount.toLocaleString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-sm text-muted-foreground">Progreso</p>
              <p className="text-sm font-medium">{progress}%</p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex justify-between text-sm">
            <p className="font-medium">${currentAmount.toLocaleString()}</p>
            <p className="text-muted-foreground">${targetAmount.toLocaleString()}</p>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Fecha límite: {deadline}</p>
            <Button size="sm" variant="outline" className="h-8">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              Depositar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CompletedGoalRow({
  title,
  amount,
  completedDate,
  duration,
}: {
  title: string
  amount: string
  completedDate: string
  duration: string
}) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">Completado: {completedDate}</p>
      </div>
      <div className="text-right">
        <p className="font-bold">{amount}</p>
        <p className="text-xs text-muted-foreground">Duración: {duration}</p>
      </div>
    </div>
  )
}
