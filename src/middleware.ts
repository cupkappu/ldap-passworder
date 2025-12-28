import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const nextIntlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const remoteUser = request.headers.get('Remote-user') ?? request.headers.get('remote-user') ?? request.headers.get('remote_user');
  const remoteEmail = request.headers.get('Remote-email') ?? request.headers.get('remote-email') ?? request.headers.get('remote_email');

  if (remoteUser || remoteEmail) {
    console.log(`Remote-user: ${remoteUser ?? '-'}, Remote-email: ${remoteEmail ?? '-'}`);
  }

  // Let next-intl handle localization first
  const res = await nextIntlMiddleware(request) as NextResponse;

  // Set cookies so the client can read them and pre-fill fields
  try {
    if (remoteUser) {
      res.cookies.set('remote-user', encodeURIComponent(remoteUser), { path: '/', sameSite: 'lax' });
    }
    if (remoteEmail) {
      res.cookies.set('remote-email', encodeURIComponent(remoteEmail), { path: '/', sameSite: 'lax' });
    }
  } catch (err) {
    // If cookies API isn't available, fall back to setting Set-Cookie header (best-effort)
    console.warn('Failed to set cookies via Response.cookies, attempting header fallback', err);
    try {
      if (remoteUser) {
        const c = `remote-user=${encodeURIComponent(remoteUser)}; Path=/; SameSite=Lax`;
        const existing = res.headers.get('set-cookie');
        res.headers.set('set-cookie', existing ? `${existing}, ${c}` : c);
      }
      if (remoteEmail) {
        const c2 = `remote-email=${encodeURIComponent(remoteEmail)}; Path=/; SameSite=Lax`;
        const existing2 = res.headers.get('set-cookie');
        res.headers.set('set-cookie', existing2 ? `${existing2}, ${c2}` : c2);
      }
    } catch (err2) {
      console.warn('Failed to set Set-Cookie header for remote user/email', err2);
    }
  }

  return res;
}

export const config = {
  matcher: ['/', '/(zh|en)/:path*']
};
