"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error no controlado:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Algo salió mal</CardTitle>
            </div>
            <CardDescription>Se ha producido un error al cargar este componente.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p>Detalles del error:</p>
              <pre className="mt-2 rounded-md bg-muted p-4 overflow-auto text-xs">
                {this.state.error?.message || "Error desconocido"}
              </pre>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => this.setState({ hasError: false })}>Intentar de nuevo</Button>
          </CardFooter>
        </Card>
      )
    }

    return this.props.children
  }
}
