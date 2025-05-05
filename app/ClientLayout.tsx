"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  // Usamos un componente cliente para acceder a usePathname
  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
}

// Componente cliente para usar hooks
function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

export default LayoutWrapper
