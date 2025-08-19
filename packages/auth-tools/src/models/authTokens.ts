/**
 * OAuth token response from token exchange
 */
export interface OAuthTokenResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope?: string;
}

/**
 * OAuth authorization URL generation options
 */
export interface AuthUrlOptions {
    redirectUri: string;
    scope?: string;
    state?: string;
    responseType?: string;
    region?: string;
}

/**
 * OAuth token exchange request parameters
 */
export interface TokenExchangeRequest {
    code: string;
    redirectUri: string;
    grantType?: string;
}

/**
 * OAuth token refresh request parameters
 */
export interface TokenRefreshRequest {
    refreshToken: string;
    grantType?: string;
}

/**
 * OAuth token validation response
 */
export interface TokenValidationResponse {
    active: boolean;
    exp?: number;
    iat?: number;
    scope?: string;
    sub?: string;
    aud?: string[];
}

/**
 * OAuth error response
 */
export interface OAuthErrorResponse {
    error: string;
    error_description?: string;
    error_uri?: string;
}

/**
 * Token manager configuration
 */
export interface TokenManagerConfig {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;
    region?: string;
}

/**
 * Authentication state information
 */
export interface AuthState {
    isAuthenticated: boolean;
    token?: string;
    expiresAt?: number;
    scope?: string;
    refreshToken?: string;
}
