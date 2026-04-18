// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/worker', '/verifier', '/advocate'];

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const token = request.cookies.get('accessToken')?.value;

    if (!token) {
      // 1. Create the base URL for the login page
      const loginUrl = new URL('/', request.url);
      
      // 2. Append the path they were trying to visit (including any query parameters)
      // e.g., ?callbackUrl=/worker?tab=shifts
      loginUrl.searchParams.set('callbackUrl', pathname + search);
      
      // 3. Redirect them with the new parameter attached
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};