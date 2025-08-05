import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({
          request
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      }
    }
  })

  const { pathname } = request.nextUrl

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { data: userData } = await supabase
    .from('users')
    .select('role, name, gender, address, phone')
    .eq('id', user?.id)
    .single()

  const baseAdminURL = `/backend/${user?.id}`
  const baseUserURL = `/users/${user?.id}`

  const protectedAdminRoutes = [
    'dashboard',
    'businesses',
    'users',
    'category',
    'prizes',
    'settings',
    'redeem-prizes'
  ]

  const isProtected = protectedAdminRoutes.some((route) =>
    pathname.endsWith(route)
  )

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (userData?.role === 'user' && pathname.startsWith('/backend')) {
    return NextResponse.redirect(
      new URL(`${baseUserURL}/businesses`, request.url)
    )
  }

  if (userData?.role === 'admin' && pathname.startsWith('/users')) {
    return NextResponse.redirect(
      new URL(`${baseAdminURL}/businesses`, request.url)
    )
  }

  if (user && pathname === '/auth/login' && userData?.role === 'admin') {
    return NextResponse.redirect(
      new URL(`${baseAdminURL}/businesses`, request.url)
    )
  }

  return supabaseResponse
}
