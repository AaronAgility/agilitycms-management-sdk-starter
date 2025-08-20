import { StoredTokenData } from './tokenStorage';

/**
 * Cookie-based token storage for server-side access
 * Uses HTTP-only cookies for security
 */
export class CookieTokenStorage {
  private cookiePrefix = 'agility_';
  
  constructor(private options: { domain?: string; secure?: boolean } = {}) {}
  
  /**
   * Store tokens in HTTP-only cookies
   */
  async setTokens(tokens: StoredTokenData): Promise<void> {
    if (typeof window === 'undefined') {
      // Server-side - can't set cookies directly, need to use response
      console.warn('Cannot set cookies server-side, use setCookiesOnResponse instead');
      return;
    }
    
    // Client-side - use document.cookie (though this won't be HTTP-only)
    const cookieOptions = this.getCookieOptions();
    
    if (tokens.accessToken) {
      document.cookie = `${this.cookiePrefix}access_token=${tokens.accessToken}; ${cookieOptions}`;
    }
    
    if (tokens.refreshToken) {
      document.cookie = `${this.cookiePrefix}refresh_token=${tokens.refreshToken}; ${cookieOptions}`;
    }
    
    if (tokens.expiresAt) {
      document.cookie = `${this.cookiePrefix}expires_at=${tokens.expiresAt}; ${cookieOptions}`;
    }
  }
  
  /**
   * Set cookies on a Next.js response object (server-side)
   */
  setCookiesOnResponse(tokens: StoredTokenData, response: any): void {
    const cookieOptions = {
      httpOnly: true,
      secure: this.options.secure ?? process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      ...(this.options.domain && { domain: this.options.domain }),
    };
    
    if (tokens.accessToken) {
      response.cookies.set(`${this.cookiePrefix}access_token`, tokens.accessToken, cookieOptions);
    }
    
    if (tokens.refreshToken) {
      response.cookies.set(`${this.cookiePrefix}refresh_token`, tokens.refreshToken, cookieOptions);
    }
    
    if (tokens.expiresAt) {
      response.cookies.set(`${this.cookiePrefix}expires_at`, tokens.expiresAt.toString(), cookieOptions);
    }
  }
  
  /**
   * Get tokens from cookies
   */
  async getTokens(): Promise<StoredTokenData | null> {
    let cookies: Record<string, string> = {};
    
    if (typeof window !== 'undefined') {
      // Client-side - parse document.cookie
      cookies = this.parseCookies(document.cookie);
    } else if (typeof process !== 'undefined' && process.env) {
      // Server-side - would need request object, return null for now
      return null;
    }
    
    const accessToken = cookies[`${this.cookiePrefix}access_token`];
    if (!accessToken) return null;
    
    const expiresAtStr = cookies[`${this.cookiePrefix}expires_at`];
    
    return {
      accessToken,
      refreshToken: cookies[`${this.cookiePrefix}refresh_token`],
      expiresAt: expiresAtStr ? parseInt(expiresAtStr) : undefined,
    };
  }
  
  /**
   * Get tokens from a Next.js request object (server-side)
   */
  getTokensFromRequest(request: any): StoredTokenData | null {
    const accessToken = request.cookies.get(`${this.cookiePrefix}access_token`)?.value;
    if (!accessToken) return null;
    
    const refreshToken = request.cookies.get(`${this.cookiePrefix}refresh_token`)?.value;
    const expiresAt = request.cookies.get(`${this.cookiePrefix}expires_at`)?.value;
    
    return {
      accessToken,
      refreshToken,
      expiresAt: expiresAt ? parseInt(expiresAt) : undefined,
    };
  }
  
  /**
   * Clear all authentication cookies
   */
  async clearTokens(): Promise<void> {
    if (typeof window !== 'undefined') {
      // Client-side
      const expiredDate = new Date(0).toUTCString();
      document.cookie = `${this.cookiePrefix}access_token=; expires=${expiredDate}; path=/`;
      document.cookie = `${this.cookiePrefix}refresh_token=; expires=${expiredDate}; path=/`;
      document.cookie = `${this.cookiePrefix}expires_at=; expires=${expiredDate}; path=/`;
    }
  }
  
  /**
   * Clear cookies on a Next.js response object (server-side)
   */
  clearCookiesOnResponse(response: any): void {
    const cookieOptions = { path: '/', maxAge: 0 };
    
    response.cookies.set(`${this.cookiePrefix}access_token`, '', cookieOptions);
    response.cookies.set(`${this.cookiePrefix}refresh_token`, '', cookieOptions);
    response.cookies.set(`${this.cookiePrefix}expires_at`, '', cookieOptions);
  }
  
  private getCookieOptions(): string {
    const options = [];
    
    if (this.options.secure ?? process.env.NODE_ENV === 'production') {
      options.push('Secure');
    }
    
    options.push('SameSite=Lax');
    options.push('Path=/');
    options.push(`Max-Age=${60 * 60 * 24 * 7}`); // 7 days
    
    if (this.options.domain) {
      options.push(`Domain=${this.options.domain}`);
    }
    
    return options.join('; ');
  }
  
  private parseCookies(cookieString: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    
    cookieString.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name && rest.length > 0) {
        cookies[name] = rest.join('=');
      }
    });
    
    return cookies;
  }
}

// Export a default instance
export const cookieTokenStorage = new CookieTokenStorage();
