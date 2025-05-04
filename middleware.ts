// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Simplemente dejamos seguir a todas las rutas
  return NextResponse.next();
}

// No protegemos ninguna ruta
export const config = {
  matcher: [],
};
