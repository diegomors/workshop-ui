import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/reset-password')
  
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role || 'cliente'

    // If logged in and on auth route, redirect to their home
    if (isAuthRoute) {
      const url = request.nextUrl.clone()
      switch (role) {
        case 'admin':
          url.pathname = '/admin'
          break
        case 'cozinha':
          url.pathname = '/admin/orders'
          break
        case 'entregador':
          url.pathname = '/delivery'
          break
        default:
          url.pathname = '/'
      }
      return NextResponse.redirect(url)
    }

    // Role protection
    if (pathname.startsWith('/admin') && role !== 'admin' && role !== 'cozinha') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'entregador' ? '/delivery' : '/'
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith('/delivery') && role !== 'entregador') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'admin' ? '/admin' : role === 'cozinha' ? '/admin/orders' : '/'
      return NextResponse.redirect(url)
    }

    if (pathname === '/' && role !== 'cliente') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'admin' ? '/admin' : role === 'cozinha' ? '/admin/orders' : '/delivery'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
