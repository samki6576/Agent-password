import { NextRequest, NextResponse } from 'next/server';
import { getLoginUrl, getBaseUrl } from '../../../../lib/auth0';

export async function GET(request: NextRequest) {
  try {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/';
    // Get the base URL dynamically from headers (handles Vercel and local dev correctly)
    const baseUrl = getBaseUrl(request);
    const loginUrl = getLoginUrl(callbackUrl, baseUrl);
    console.log('[Auth Login] Request Host:', request.headers.get('host'));
    console.log('[Auth Login] Redirecting to:', loginUrl);

    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error('[Auth Login Error]', error);
    return NextResponse.json(
      { error: 'Failed to initiate login' },
      { status: 500 }
    );
  }
}

