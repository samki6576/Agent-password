import { NextRequest, NextResponse } from 'next/server';
import { getLoginUrl } from '../../../../lib/auth0';

export async function GET(request: NextRequest) {
  try {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/';
    const loginUrl = getLoginUrl(callbackUrl);
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error('[Auth Login Error]', error);
    return NextResponse.json(
      { error: 'Failed to initiate login' },
      { status: 500 }
    );
  }
}
