"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, DollarSign, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PaymentCardProps {
  title: string
  description: string
  amount: string
  type: "credit-card" | "loan" | "service" | "rent" | "insurance"
  urgent: boolean
}

export function PaymentCard({ title, description, amount, type, urgent }: PaymentCardProps) {
  const [isPaying, setIsPaying] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const { toast } = useToast()

  const handlePayment = async () => {
    setIsPaying(true)

    try {
      // Simulamos una llamada a la API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Marcamos como pagado
      setIsPaid(true)

      // Mostramos mensaje de éxito
      toast({
        title: "¡Pago realizado!",
        description: `Se ha registrado el pago de ${amount} para ${title}`,
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al procesar el pago",
        description: "Por favor, intenta nuevamente más tarde.",
      })
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <Card className={urgent ? "border-red-300" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {type === "credit-card" && <CreditCard className="h-5 w-5 text-blue-500" />}
          {type === "loan" && <DollarSign className="h-5 w-5 text-purple-500" />}
          {type === "service" && <AlertCircle className="h-5 w-5 text-amber-500" />}
          {type === "rent" && <AlertCircle className="h-5 w-5 text-green-500" />}
          {type === "insurance" && <AlertCircle className="h-5 w-5 text-red-500" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <p className="text-lg font-bold">{amount}</p>
          {isPaid ? (
            <Button size="sm" variant="outline" className="bg-green-50 text-green-700 border-green-200" disabled>
              Pagado
            </Button>
          ) : (
            <Button
              size="sm"
              className="transition-all hover:scale-105 active:scale-95"
              onClick={handlePayment}
              disabled={isPaying}
            >
              {isPaying ? "Procesando..." : "Pagar"}
            </Button>
          )}
        </div>
        {urgent && !isPaid && (
          <div className="mt-2 text-xs text-red-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Vencimiento próximo
          </div>
        )}
      </CardContent>
    </Card>
  )
}
