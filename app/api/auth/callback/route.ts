import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, getBaseUrl } from '../../../../lib/auth0';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    
    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }
    
    let callbackUrl = '/';
    if (state) {
      try {
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
        if (decodedState.callbackUrl) callbackUrl = decodedState.callbackUrl;
      } catch (e) {}
    }
    
    // Use the dynamic base URL from headers (handles Vercel and local dev correctly)
    const baseUrl = getBaseUrl(request);
    const redirectUri = `${baseUrl}/api/auth/callback`;
    
    const tokenResponse = await exchangeCodeForToken(code, redirectUri);



    
    const response = NextResponse.redirect(new URL(callbackUrl, request.url));
    response.cookies.set({
      name: 'access_token',
      value: tokenResponse.access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokenResponse.expires_in || 86400,
      path: '/'
    });
    
    if (tokenResponse.refresh_token) {
        response.cookies.set({
          name: 'refresh_token',
          value: tokenResponse.refresh_token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/'
        });
    }

    response.cookies.set({
      name: 'token_expires_at',
      value: String(Date.now() + (tokenResponse.expires_in || 86400) * 1000),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: tokenResponse.expires_in || 86400,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('[Auth Callback Error]', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
