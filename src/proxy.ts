import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { locales, defaultLocale } from '@/i18n/config';

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Only add prefix for non-default locale
});

// Routes requiring authentication
const PROTECTED_ROUTES = ['/dashboard', '/dashboard/(.*)'];
// Routes requiring admin/superadmin role
const ADMIN_ROUTES = ['/dashboard/admin', '/dashboard/admin/(.*)'];
// Routes that should redirect to /dashboard if already logged in
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

function matchesPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const regex = new RegExp(`^${pattern.replace('(.*)', '.*')}$`);
    return regex.test(pathname);
  });
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Workaround for Next.js 15 proxy port bug
  req.nextUrl.port = '3002';
  req.headers.set('host', 'localhost:3002');
  req.headers.set('x-forwarded-host', 'localhost:3002');

  // Strip locale prefix for route matching
  const pathnameWithoutLocale = pathname.replace(/^\/(en|fr)/, '') || '/';

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;
  const userRole = token?.role as string | undefined;
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';

  // Protect admin routes
  if (matchesPattern(pathnameWithoutLocale, ADMIN_ROUTES)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Protect dashboard routes
  if (matchesPattern(pathnameWithoutLocale, PROTECTED_ROUTES)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && matchesPattern(pathnameWithoutLocale, AUTH_ROUTES)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Apply i18n middleware
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Match all request paths except static files, _next, and api
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons|images).*)',
  ],
};
