import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // 1. Create an initial response
  // We need this to apply cookies to the response if the session refreshes
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update the request cookies so the server component sees the new session
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          // Re-create the response with the updated request
          response = NextResponse.next({
            request,
          });
          // Update the response cookies so the browser sees the new session
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. Get the User (Securely)
  // This helps refresh the token if it's expired
  const { data: { user } } = await supabase.auth.getUser();

  // console.log('User data:', user);

  const ALLOWED_EMAILS = process.env.NEXT_PUBLIC_ALLOWED_EMAILS?.split(',') || [];

  const url = request.nextUrl.clone();
  const path = url.pathname;

  // --- REQUIREMENT 1: Redirect Signed-In Users away from Auth Pages ---
  // If user is logged in, they shouldn't see /login or /signup
  if (user) {
    if (path === "/login" || path === "/signup") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // --- REQUIREMENT 2: Protect /dashboard (Admin Only) ---
  if (path.startsWith("/dashboard")) {
    
    // A. Check if user exists at all
    if (!user) {
      // If they aren't logged in, send them to root (or login)
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // B. Check if user's email is in ALLOWED_EMAILS
    if (!ALLOWED_EMAILS.includes(user.email || '')) {
      // User is logged in, but email not allowed. Kick them out.
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (system files)
     * - favicon.ico
     * - images (.svg, .png, etc.)
     * * IMPORTANT: We do NOT exclude 'login' or 'signup' here, 
     * because we need the middleware to run on those pages to redirect logged-in users.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};