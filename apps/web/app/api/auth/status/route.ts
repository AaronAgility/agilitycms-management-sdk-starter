import { NextRequest, NextResponse } from 'next/server';
import { cookieTokenStorage } from '@agility/auth-tools/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if user has valid tokens in cookies
    const tokens = cookieTokenStorage.getTokensFromRequest(request);
    
    if (!tokens?.accessToken) {
      return NextResponse.json({ authenticated: false });
    }
    
    // Basic token expiration check
    if (tokens.expiresAt && tokens.expiresAt <= Math.floor(Date.now() / 1000)) {
      return NextResponse.json({ authenticated: false });
    }
    
    return NextResponse.json({ 
      authenticated: true,
      expiresAt: tokens.expiresAt 
    });
    
  } catch (error) {
    console.error('Auth status check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
