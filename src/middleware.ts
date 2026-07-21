import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Rewrite /@username[/...] → /username[/...] for Link.me-style public URLs.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/@')) {
    return NextResponse.next()
  }

  const rest = pathname.slice(2)
  const segments = rest.split('/').filter(Boolean)
  const handle = segments[0] ?? ''

  if (!handle) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const suffix = segments.slice(1).join('/')
  const url = request.nextUrl.clone()
  url.pathname = suffix
    ? `/${decodeURIComponent(handle)}/${suffix}`
    : `/${decodeURIComponent(handle)}`
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: ['/@:path*'],
}
