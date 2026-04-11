import { type NextRequest } from 'next/server';
import { createSupabaseSessionMiddleware } from '@repo/supabase/next';

const updateSession = createSupabaseSessionMiddleware({
  protectedPrefixes: ['/dashboard', '/reservations', '/invoices'],
  authPages: ['/login', '/signup'],
  loginPath: '/login',
  accessDeniedPath: '/access-denied',
  employeeHomePath: '/dashboard',
  requiredRoleForProtectedRoutes: 'employee',
});

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
