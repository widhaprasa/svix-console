import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export default function proxy(request: NextRequest) {
  // Check if the request is for the login page or login API
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isLoginAPI = request.nextUrl.pathname === '/api/auth/login';
  
  // Check for authentication cookie
  const authCookie = request.cookies.get('svix-console-auth');
  let isAuthenticated = false;
  
  if (authCookie) {
    try {
      // Verify the auth token (simple implementation)
      const authData = JSON.parse(authCookie.value);
      isAuthenticated = authData.authenticated && authData.expiresAt > Date.now();
    } catch (error) {
      // Invalid cookie format, will be handled below
      isAuthenticated = false;
    }
  }
  
  // If authenticated user tries to access login page, redirect to home
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Allow login API requests to pass through
  if (isLoginAPI) {
    return NextResponse.next();
  }
  
  // Allow unauthenticated access to login page
  if (isLoginPage) {
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    // Clear invalid cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    if (authCookie) {
      response.cookies.delete('svix-console-auth');
    }
    return response;
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};