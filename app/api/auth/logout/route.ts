import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.delete('access_token');
  response.cookies.delete('refresh_token');
  response.cookies.delete('token_expires_at');
  return response;
}
