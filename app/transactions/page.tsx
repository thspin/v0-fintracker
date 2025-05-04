import { TransactionForm } from "@/components/transaction-form"
import { TransactionHistory } from "@/components/transaction-history"
import { ErrorBoundary } from "@/components/error-boundary"
import { Suspense } from "react"
import Loading from "../loading"

export default function TransactionsPage() {
  return (
    <div className="container mx-auto p-6 space-y-12">
      <div className="max-w-3xl mx-auto">
        <ErrorBoundary>
          <Suspense fallback={<Loading />}>
            <TransactionForm />
          </Suspense>
        </ErrorBoundary>
      </div>

      <div className="relative min-h-[100vh] mt-24">
        <div className="sticky top-20 left-1/2 -translate-x-1/2 text-center text-muted-foreground text-sm py-2 px-4 rounded-full bg-muted/50 backdrop-blur-sm animate-pulse z-10 w-max mx-auto">
          Desplázate hacia abajo para ver el historial de transacciones
        </div>
        <div className="pt-16">
          <ErrorBoundary>
            <Suspense fallback={<Loading />}>
              <TransactionHistory />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
