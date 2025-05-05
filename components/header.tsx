"use client"

import { useState, useEffect } from "react"
import { Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useMobile } from "@/hooks/use-mobile"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  const isMobile = useMobile()
  const [showSearch, setShowSearch] = useState(false)
  const [dateTime, setDateTime] = useState({
    time: "",
    date: "",
    week: 0,
    quarter: 0,
  })

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()

      // Formato de hora en 24h
      const time = now.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })

      // Formato de fecha MM/DD/AAAA
      const date = now.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })

      // Calcular número de semana
      const start = new Date(now.getFullYear(), 0, 1)
      const diff = now - start
      const oneWeek = 604800000
      const week = Math.ceil((diff + start.getDay() * 86400000) / oneWeek)

      // Calcular trimestre
      const quarter = Math.ceil((now.getMonth() + 1) / 3)

      setDateTime({ time, date, week, quarter })
    }

    updateDateTime()
    const interval = setInterval(updateDateTime, 60000) // Actualizar cada minuto

    return () => clearInterval(interval)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex flex-1 items-center justify-end md:justify-between">
        {!isMobile && (
          <div className="flex-1 md:flex md:justify-start">
            <form className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-96 lg:w-96"
              />
            </form>
          </div>
        )}

        {isMobile && (
          <div className="flex-1 flex justify-center">
            {showSearch ? (
              <form className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar..."
                  className="w-full appearance-none bg-background pl-8 shadow-none"
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                />
              </form>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
                <Search className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          {!isMobile && (
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {dateTime.time} • {dateTime.date} • W{dateTime.week} • Q{dateTime.quarter}
              </div>
            </div>
          )}

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative animate-pulse">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span className="font-medium">Pago próximo</span>
                  <span className="text-xs text-muted-foreground">Tarjeta de Crédito Visa - 10/05/2025</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col">
                  <span className="font-medium">Objetivo alcanzado</span>
                  <span className="text-xs text-muted-foreground">Fondo de Emergencia - 75%</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center">Ver todas</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">US</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Preferencias</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
