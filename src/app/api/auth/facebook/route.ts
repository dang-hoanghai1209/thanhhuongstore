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
  const authorizationUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');

  authorizationUrl.searchParams.set('client_id', getRequiredOAuthEnv('FACEBOOK_CLIENT_ID'));
  authorizationUrl.searchParams.set('redirect_uri', getRequiredOAuthEnv('FACEBOOK_REDIRECT_URI'));
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', 'email,public_profile');
  authorizationUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set(getOAuthStateCookieName('facebook'), state, oauthStateCookieOptions);

  return response;
}
