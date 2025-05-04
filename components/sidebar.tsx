"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, CreditCard, PiggyBank, ArrowLeftRight, Settings, ChevronRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useMobile } from "@/hooks/use-mobile"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Transacciones",
    href: "/transactions",
    icon: <ArrowLeftRight className="h-5 w-5" />,
  },
  {
    title: "Pagos",
    href: "/payments",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    title: "Ahorros",
    href: "/savings",
    icon: <PiggyBank className="h-5 w-5" />,
  },
  {
    title: "Configuración",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const sidebarContent = (
    <>
      <div className="px-3 py-4">
        <div className="flex items-center justify-between mb-8 px-2">
          <Link href="/" className="flex items-center">
            <PiggyBank className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-xl">FinTracker</span>
          </Link>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between py-2 px-3 rounded-md text-sm font-medium transition-colors",
                pathname === item.href ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-muted",
              )}
              onClick={isMobile ? toggleSidebar : undefined}
            >
              <div className="flex items-center">
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </div>
              {pathname === item.href && <ChevronRight className="h-4 w-4" />}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-auto p-4">
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Resumen Rápido</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Balance:</span>
              <span className="font-medium">$12,781.69</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ingresos:</span>
              <span className="font-medium text-green-500">+$3,500.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gastos:</span>
              <span className="font-medium text-red-500">-$2,245.30</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {isMobile && (
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {isMobile ? (
        <div
          className={cn(
            "fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="bg-background h-full w-64 shadow-lg flex flex-col">{sidebarContent}</div>
          {isOpen && (
            <div className="fixed inset-0 bg-black/50 z-[-1]" onClick={toggleSidebar} aria-hidden="true"></div>
          )}
        </div>
      ) : (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-background border-r h-screen">
          <div className="flex-1 flex flex-col min-h-0">{sidebarContent}</div>
        </div>
      )}

      {!isMobile && <div className="md:w-64" />}
    </>
  )
}
