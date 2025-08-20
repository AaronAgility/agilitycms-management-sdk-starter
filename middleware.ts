import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const PROTECTED_ROUTES = ['/protected'];
const AUTH_ROUTES = ['/'];

/**
 * Validate JWT token from Agility CMS OAuth
 */
function isValidToken(token: string): boolean {
  try {
    // Basic JWT structure check
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    return payload.exp && payload.exp > now;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}

/**
 * Check if user is authenticated by validating their JWT token
 */
function isAuthenticated(request: NextRequest): boolean {
  // Try to get token from different sources
  const tokenFromCookie = request.cookies.get('agility_access_token')?.value;
  const tokenFromHeader = request.headers.get('authorization')?.replace('Bearer ', '');
  
  const token = tokenFromCookie || tokenFromHeader;
  
  if (!token) {
    console.log('No token found in cookies or headers');
    return false;
  }
  
  const isValid = isValidToken(token);
  console.log('Token validation result:', isValid);
  return isValid;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = isAuthenticated(request);
  
  console.log('Middleware check:', { pathname, authenticated });
  
  // Handle protected routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!authenticated) {
      console.log('Redirecting unauthenticated user to login');
      const loginUrl = new URL('/', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // Handle auth routes (redirect authenticated users away from login)
  if (AUTH_ROUTES.includes(pathname)) {
    if (authenticated) {
      console.log('Redirecting authenticated user to protected area');
      const protectedUrl = new URL('/protected', request.url);
      return NextResponse.redirect(protectedUrl);
    }
  }
  
  // Allow the request to continue
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    // Match all routes except API routes, _next, and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
