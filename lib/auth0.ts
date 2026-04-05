import { NextRequest } from 'next/server';
import {jwtDecode} from 'jwt-decode';

export interface Auth0Config {
  domain: string;
  clientId: string;
  clientSecret: string;
  appUrl: string;
  m2mClientId: string;
  m2mClientSecret: string;
}

export function getAuth0Config(): Auth0Config {
  // Prefer values from environment variables.
  const domain = process.env.AUTH0_DOMAIN || 'dev-p5rzimkpdjozgn20.us.auth0.com';
  const clientId = process.env.AUTH0_CLIENT_ID || 'UKqA81XdXJNQDqulOeWj7bxC0ev5qDiv';
  const clientSecret = process.env.AUTH0_CLIENT_SECRET || 'Z8sxPMUzX-X7AtGe6tYsfCHKFw6Pd4_xE0LqfrLjEYFshblApihxIy5eDtnxX58p';
  
  // Use NEXT_PUBLIC_APP_URL if available, otherwise fallback to localhost for development.
  // In production (Vercel), we'll try to get the origin from the request headers in the API routes.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const m2mClientId = process.env.AUTH0_M2M_CLIENT_ID || clientId;
  const m2mClientSecret = process.env.AUTH0_M2M_CLIENT_SECRET || clientSecret;

  if (!domain || !clientId || !clientSecret) {
    throw new Error(
      'Missing Auth0 environment variables. Please set AUTH0_DOMAIN, AUTH0_CLIENT_ID, and AUTH0_CLIENT_SECRET'
    );
  }

  return { domain, clientId, clientSecret, appUrl, m2mClientId, m2mClientSecret };
}

export function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  
  if (host) {
    return `${protocol}://${host}`;
  }
  
  // Fallback to config
  const config = getAuth0Config();
  return config.appUrl;
}

export function getAuth0Url(): string {
  const config = getAuth0Config();
  return `https://${config.domain}`;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<TokenResponse> {
  const config = getAuth0Config();
  const auth0Url = getAuth0Url();

  const response = await fetch(`${auth0Url}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      audience: `https://${config.domain}/api/v2/`,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Auth0 token exchange failed: ${error.error_description || error.error}`);
  }

  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const config = getAuth0Config();
  const auth0Url = getAuth0Url();

  const response = await fetch(`${auth0Url}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Token refresh failed: ${error.error_description || error.error}`);
  }

  return response.json();
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    if (!decoded.exp) return false;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

export function getLoginUrl(callbackUrl: string, baseUrl?: string): string {
  const config = getAuth0Config();
  // Prioritize passed baseUrl (from request origin), then env var, then fallback.
  const appUrl = baseUrl || config.appUrl;
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    scope: 'openid profile email offline_access',
    redirect_uri: `${appUrl}/api/auth/callback`,
    state: Buffer.from(JSON.stringify({ callbackUrl })).toString('base64'),
    prompt: 'consent',
    // Force Google Connection
    connection: 'google-oauth2',
    // Request Google-specific scopes for Calendar
    connection_scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
  });
  return `https://${config.domain}/authorize?${params.toString()}`;
}


export async function getGoogleAccessToken(auth0AccessToken: string): Promise<string> {
  const config = getAuth0Config();

  // 1. Get User ID by calling /userinfo with the Auth0 access token
  const userInfoRes = await fetch(`https://${config.domain}/userinfo`, {
    headers: { Authorization: `Bearer ${auth0AccessToken}` }
  });
  
  if (!userInfoRes.ok) {
    const errText = await userInfoRes.text();
    throw new Error(`Failed to get user info from Auth0. Status: ${userInfoRes.status}, Body: ${errText}`);
  }
  
  const userInfo = await userInfoRes.json();
  const userId = userInfo.sub;
  console.log('[Token Vault] User sub:', userId);
  if (!userId) throw new Error('No user ID found in /userinfo response');

  // 2. Get Management API Token securely server-side
  const m2mTokenRes = await fetch(`https://${config.domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: config.m2mClientId,
      client_secret: config.m2mClientSecret,
      audience: `https://${config.domain}/api/v2/`
    })
  });
  
  if (!m2mTokenRes.ok) {
    const err = await m2mTokenRes.json();
    throw new Error(`Failed to get Management API token: ${err.error_description || err.error}`);
  }
  const m2mData = await m2mTokenRes.json();
  const mgmtToken = m2mData.access_token;
  console.log('[Token Vault] Got M2M token successfully');

  // 3. Fetch User Profile to get the Google Identity Token
  const userRes = await fetch(`https://${config.domain}/api/v2/users/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${mgmtToken}` }
  });

  if (!userRes.ok) {
    const errorText = await userRes.text();
    throw new Error(`Failed to fetch user profile from Auth0 Management API. Status: ${userRes.status}, Body: ${errorText}`);
  }

  const user = await userRes.json();
  
  // Log all identity providers and the full response for deep debugging
  const providers = user.identities?.map((i: any) => ({
    provider: i.provider,
    has_token: !!i.access_token,
    is_google: i.provider.includes('google')
  })) || [];
  
  console.log('[Token Vault] User identity overview:', JSON.stringify(providers, null, 2));

  // Try both 'google-oauth2' and 'google-workspace' provider names
  const googleIdentity = user.identities?.find(
    (i: any) => i.provider === 'google-oauth2' || i.provider === 'google-workspace' || i.provider?.startsWith('google')
  );

  if (!googleIdentity || !googleIdentity.access_token) {
    console.error('[Token Vault] Google identity lookup failed. Current providers:', providers);
    throw new Error(`No Google access token found in Auth0 identity. Providers: [${providers.map((p: any) => p.provider).join(', ')}]. Please re-login with Google.`);
  }

  console.log('[Token Vault] Successfully found real Google Access Token');
  return googleIdentity.access_token;
}

