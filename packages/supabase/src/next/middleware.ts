import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseKey, supabaseUrl } from "../config";

export type SupabaseSessionMiddlewareConfig = {
  /** Path prefixes that require a session */
  protectedPrefixes: string[];
  /** Paths treated as auth UI (login, signup, …) */
  authPages: string[];
  loginPath: string;
  accessDeniedPath: string;
  /** Redirect employees here when they land on an auth page while signed in */
  employeeHomePath: string;
  /** Required `user_role` claim on protected routes (e.g. `"employee"` for CRM) */
  requiredRoleForProtectedRoutes: string;
};

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Next.js middleware: Supabase cookie session, optional employee-only protected areas,
 * redirect signed-in users away from auth pages.
 */
export function createSupabaseSessionMiddleware(
  config: SupabaseSessionMiddlewareConfig,
) {
  const {
    protectedPrefixes,
    authPages,
    loginPath,
    accessDeniedPath,
    employeeHomePath,
    requiredRoleForProtectedRoutes,
  } = config;

  return async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    });

    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    let userRole: string | undefined;

    if (accessToken) {
      const { data: claimsData } = await supabase.auth.getClaims(accessToken);
      const payload = claimsData?.claims as { user_role?: string } | undefined;
      userRole = payload?.user_role;
    }
    const hasSession = !!accessToken;

    const pathname = request.nextUrl.pathname;
    const isProtected = matchesPrefix(pathname, protectedPrefixes);
    const isAuth = matchesPrefix(pathname, authPages);

    if (isProtected && !hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = loginPath;
      return NextResponse.redirect(url);
    }

    if (
      isProtected &&
      hasSession &&
      userRole !== requiredRoleForProtectedRoutes
    ) {
      const url = request.nextUrl.clone();
      url.pathname = accessDeniedPath;
      return NextResponse.redirect(url);
    }

    if (isAuth && hasSession) {
      const url = request.nextUrl.clone();
      if (userRole === requiredRoleForProtectedRoutes) {
        url.pathname = employeeHomePath;
      } else {
        url.pathname = accessDeniedPath;
      }
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  };
}
