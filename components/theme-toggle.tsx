"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Asegurarse de que el componente está montado para evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleOpen = () => setIsOpen(!isOpen)

  // Si no está montado, mostrar un placeholder para evitar saltos de UI
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Monitor className="h-5 w-5" />
      </Button>
    )
  }

  // Determinar qué icono mostrar basado en el tema actual
  const currentTheme = theme || resolvedTheme || "light"

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={toggleOpen} className="relative">
        {currentTheme === "light" && <Sun className="h-5 w-5" />}
        {currentTheme === "dark" && <Moon className="h-5 w-5" />}
        {currentTheme === "gray" && <Monitor className="h-5 w-5" />}
        {currentTheme === "system" && <Monitor className="h-5 w-5" />}
        <ChevronDown className={cn("h-3 w-3 ml-1 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-auto bg-background border rounded-md shadow-lg z-50 flex flex-col p-1 gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setTheme("light")
              setIsOpen(false)
            }}
            className={cn("justify-center", currentTheme === "light" && "bg-accent")}
          >
            <Sun className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setTheme("dark")
              setIsOpen(false)
            }}
            className={cn("justify-center", currentTheme === "dark" && "bg-accent")}
          >
            <Moon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setTheme("gray")
              setIsOpen(false)
            }}
            className={cn("justify-center", currentTheme === "gray" && "bg-accent")}
          >
            <Monitor className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
