import { unauthorizedResponse } from '@/app/api/helpers/response'
import { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server'

export function authMiddlware(next: NextMiddleware) {
  return async (req: NextRequest, event: NextFetchEvent) => {
    const isAuthenticated = req.cookies.get('sb-127-auth-token')

    if (req.nextUrl.pathname.startsWith('/api/protected')) {
      if (!isAuthenticated) {
        return unauthorizedResponse()
      }
    }

    return next(req, event)
  }
}

export const config = {
  matcher: '/api/protected/:path*'
}
