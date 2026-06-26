import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const rotasPublicas = createRouteMatcher([
  '/', 
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/api/webhooks(.*)', 
  '/api/analyze(.*)',
  '/api/models(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  if (!rotasPublicas(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
