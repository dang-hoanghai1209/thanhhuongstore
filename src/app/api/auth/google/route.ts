import { NextRequest, NextResponse } from 'next/server';

import {
  createOAuthState,
  getOAuthStateCookieName,
  getRequiredOAuthEnv,
  oauthStateCookieOptions,
} from '@/lib/oauth';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  const state = createOAuthState();
  const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

  authorizationUrl.searchParams.set('client_id', getRequiredOAuthEnv('GOOGLE_CLIENT_ID'));
  authorizationUrl.searchParams.set('redirect_uri', getRequiredOAuthEnv('GOOGLE_REDIRECT_URI'));
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', 'openid email profile');
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('prompt', 'select_account');

  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set(getOAuthStateCookieName('google'), state, oauthStateCookieOptions);

  return response;
}
