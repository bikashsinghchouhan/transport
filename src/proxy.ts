import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ADMIN_PAGES = new Set([
  '/admin/login',
  '/admin/forgot-password',
  '/admin/reset-password',
]);

const PUBLIC_ADMIN_APIS = new Set([
  '/api/admin/login',
  '/api/admin/forgot-password',
  '/api/admin/reset-password',
]);

// Helper to attach noindex SEO headers to ensure admin surfaces are never indexed
function applySecurityAndSeoHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. If not an admin web route or admin API, let Next.js continue normally
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // 2. Read admin auth cookie
  const token = request.cookies.get('admin_token')?.value?.trim();
  // Basic JWT structure check (3 base64url segments separated by dots)
  const isValidJwtStructure = Boolean(
    token && token.length > 20 && token.split('.').length === 3
  );

  // 3. Handle Admin API Protection
  if (isAdminApi) {
    const isPublicApi = PUBLIC_ADMIN_APIS.has(pathname);
    if (!isPublicApi && !isValidJwtStructure) {
      const unauthorizedResponse = NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
      return applySecurityAndSeoHeaders(unauthorizedResponse);
    }
    const response = NextResponse.next();
    return applySecurityAndSeoHeaders(response);
  }

  // 4. Handle Admin Web Page Protection
  const isPublicPage = PUBLIC_ADMIN_PAGES.has(pathname);

  // If already authenticated and trying to visit login/forgot-password, redirect to dashboard
  if (isPublicPage && isValidJwtStructure) {
    const redirectParam = request.nextUrl.searchParams.get('redirect');
    const targetUrl = redirectParam && redirectParam.startsWith('/admin')
      ? redirectParam
      : '/admin/dashboard';

    const redirectResponse = NextResponse.redirect(new URL(targetUrl, request.url));
    return applySecurityAndSeoHeaders(redirectResponse);
  }

  // If trying to access a private admin page without a valid token, redirect to /admin/login
  if (!isPublicPage && !isValidJwtStructure) {
    const loginUrl = new URL('/admin/login', request.url);
    // Preserve requested path in redirect query so after login user lands right back where they wanted
    if (pathname !== '/admin' && pathname !== '/admin/dashboard') {
      loginUrl.searchParams.set('redirect', pathname + search);
    }
    const redirectResponse = NextResponse.redirect(loginUrl);
    return applySecurityAndSeoHeaders(redirectResponse);
  }

  // User is accessing an authorized admin page or a public admin page
  const response = NextResponse.next();
  return applySecurityAndSeoHeaders(response);
}

export default proxy;

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
