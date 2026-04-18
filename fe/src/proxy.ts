import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Comment out the route matcher
// const isProtectedRoute = createRouteMatcher(["/posts(.*)", "/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // 2. Comment out the protection logic so everything passes through
  // if (isProtectedRoute(req)) {
  //   await auth.protect();
  // }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};