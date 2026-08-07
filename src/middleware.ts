import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Run i18n middleware
  const response = intlMiddleware(request);

  // 2. Update session with Supabase (cookie refresh)
  // We pass the request to updateSession. It returns a response that we use
  // to copy the updated Supabase session cookies into the response.
  const supabaseResponse = await updateSession(request);

  // Copy cookies from Supabase response back to our localized response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      domain: cookie.domain,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
      maxAge: cookie.maxAge,
      expires: cookie.expires,
    });
  });

  return response;
}

export const config = {
  // Match all pathnames except API routes and static asset paths
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
