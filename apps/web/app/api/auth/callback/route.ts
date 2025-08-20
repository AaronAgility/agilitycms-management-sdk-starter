import { NextRequest, NextResponse } from 'next/server';
import { cookieTokenStorage } from '@agility/auth-tools/auth';

export async function POST(request: NextRequest) {
  try {
    const { code, redirectUri, region } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }
    
    console.log('Token exchange API called with:', { code: code.substring(0, 10) + '...', redirectUri, region });
    
    console.log('Exchanging code for real tokens using Agility OAuth endpoint...');
    
    // Use the correct Agility CMS OAuth endpoint from the original implementation
    const tokenUrl = 'https://mgmt.aglty.io/oauth/token';
    
    const tokenData = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    });
    
    console.log('Making token exchange request to:', tokenUrl);
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenData,
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return NextResponse.json(
        { error: 'Token exchange failed', details: errorText },
        { status: 400 }
      );
    }
    
    const tokens = await tokenResponse.json();
    console.log('Real token exchange successful');
    
    // Create response and set HTTP-only cookies
    const response = NextResponse.json({ success: true });
    
    // Set tokens in HTTP-only cookies
    cookieTokenStorage.setCookiesOnResponse({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : undefined,
      tokenType: tokens.token_type,
      scope: tokens.scope,
    }, response);
    
    return response;
    
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Handle sign out - clear cookies
    const response = NextResponse.json({ success: true });
    cookieTokenStorage.clearCookiesOnResponse(response);
    return response;
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
