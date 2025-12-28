import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const nextIntlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const remoteUser = request.headers.get('Remote-user') ?? request.headers.get('remote-user') ?? request.headers.get('remote_user');
  const remoteEmail = request.headers.get('Remote-email') ?? request.headers.get('remote-email') ?? request.headers.get('remote_email');
  if (remoteUser || remoteEmail) {
    console.log(`Remote-user: ${remoteUser ?? '-'}, Remote-email: ${remoteEmail ?? '-'}`);
  }
  return nextIntlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(zh|en)/:path*']
};
