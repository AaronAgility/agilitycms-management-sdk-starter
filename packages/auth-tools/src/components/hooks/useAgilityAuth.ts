import { useEffect, useReducer, useCallback, useMemo, useState } from 'react';
import { AuthMethods } from '../../auth/authMethods';
import { ServerUser, Options } from '../../models/shared';
import { WebsiteAccess, LocaleInfo } from '../../models/authComponent';
import { 
  AuthReducerState, 
  AuthAction, 
  UseAgilityAuthReturn, 
  initialAuthState 
} from '../../models/authState';

/**
 * Authentication reducer to manage complex state updates
 */
function authReducer(state: AuthReducerState, action: AuthAction): AuthReducerState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_LOADING_LOCALES':
      return { ...state, isLoadingLocales: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_WEBSITE_ACCESS':
      return { ...state, websiteAccess: action.payload };
    
    case 'SET_SELECTED_WEBSITE':
      return { ...state, selectedWebsite: action.payload };
    
    case 'SET_SELECTED_LOCALE':
      return { ...state, selectedLocale: action.payload };
    
    case 'SET_LOCALES':
      return { ...state, locales: action.payload };
    
    case 'SIGN_OUT':
      return {
        ...initialAuthState,
        // Keep any non-auth related state if needed
      };
    
    case 'RESET_STATE':
      return initialAuthState;
    
    default:
      return state;
  }
}

/**
 * Custom hook for Agility CMS authentication
 * Handles OAuth flow, token management, and user state
 */
export function useAgilityAuth(options?: {
  redirectUri?: string;
  scope?: string;
  region?: string;
  autoCheckAuth?: boolean;
  sdkOptions?: Options;
}): UseAgilityAuthReturn {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const [tokenInfo, setTokenInfo] = useState<{
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    tokenType?: string;
    scope?: string;
  }>({});
  
  const authMethods = useMemo(() => new AuthMethods(options?.sdkOptions || {}), [options?.sdkOptions]);

  // Auto-check authentication status on mount
  useEffect(() => {
    if (options?.autoCheckAuth !== false) {
      checkAuthStatus();
    }
  }, []);

  // Update token info whenever authentication state changes
  useEffect(() => {
    if (state.isAuthenticated) {
      updateTokenInfo();
    } else {
      setTokenInfo({});
    }
  }, [state.isAuthenticated]);

  /**
   * Update token information from auth status endpoint
   */
  const updateTokenInfo = useCallback(async () => {
    try {
      // With HTTP-only cookies, we can't access token details directly
      // Get basic info from the auth status endpoint
      if (typeof window !== 'undefined') {
        const response = await fetch('/api/auth/status');
        if (response.ok) {
          const result = await response.json();
          if (result.authenticated) {
            setTokenInfo({
              accessToken: 'stored_in_httponly_cookie',
              refreshToken: 'stored_in_httponly_cookie', 
              expiresAt: result.expiresAt,
              tokenType: 'Bearer',
              scope: 'openid profile email offline_access'
            });
          } else {
            setTokenInfo({});
          }
        }
      }
    } catch (error) {
      console.error('Failed to update token info:', error);
      setTokenInfo({});
    }
  }, [authMethods]);

  /**
   * Check if user is already authenticated
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('checkAuthStatus: Starting auth check...');
      const isAuthenticated = await authMethods.isAuthenticated();
      console.log('checkAuthStatus: isAuthenticated =', isAuthenticated);
      
      if (isAuthenticated) {
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        // Update token info
        await updateTokenInfo();
      } else {
        console.log('checkAuthStatus: User not authenticated');
        dispatch({ type: 'SET_AUTHENTICATED', payload: false });
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_WEBSITE_ACCESS', payload: [] });
      }
    } catch (error) {
      console.error('checkAuthStatus: Authentication check failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to check authentication status' });
    }
  }, [authMethods, updateTokenInfo]);

  /**
   * Fetch user info and website access using the management SDK
   * This is separate from authentication and can fail without affecting auth status
   */
  const fetchUserInfo = useCallback(async () => {
    try {
      const accessToken = await authMethods.getValidAccessToken();
      
      if (!accessToken) {
        console.warn('fetchUserInfo: No valid access token available');
        return;
      }

      console.log('fetchUserInfo: Creating SDK client with token...');
      
      // Try to dynamically import the management SDK
      try {
        const { ApiClient } = await import('@agility/management-sdk');
        
        // Create the client directly with the token
        const client = new ApiClient({ token: accessToken } as any);
        
        console.log('fetchUserInfo: Fetching user info from management SDK...');
        const user = await client.serverUserMethods.me('');
        console.log('fetchUserInfo: User fetched successfully:', user?.userName || user?.emailAddress);
        dispatch({ type: 'SET_USER', payload: user });
        
        // Extract website access information
        const websites: WebsiteAccess[] = user.websiteAccess?.map((access: any, index: number) => ({
          websiteGuid: access.guid || `website-${index}`,
          websiteName: (access.displayName || access.websiteName) || access.guid || `Website ${index + 1}`,
          websiteDescription: access.description || access.websiteName || access.guid || `Website ${index + 1}`
        })) || [];
        
        dispatch({ type: 'SET_WEBSITE_ACCESS', payload: websites });
      } catch (sdkError) {
        console.error('fetchUserInfo: Management SDK error:', sdkError);
        // Don't throw - user info is optional
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_WEBSITE_ACCESS', payload: [] });
      }
    } catch (error) {
      console.error('fetchUserInfo: Failed to get user info:', error);
      // Don't throw - user info is optional
      dispatch({ type: 'SET_USER', payload: null });
      dispatch({ type: 'SET_WEBSITE_ACCESS', payload: [] });
    }
  }, [authMethods]);

  /**
   * Authenticate user using OAuth flow
   */
  const authenticate = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('OAuth flow requires a browser environment.');
      }

      const defaultOptions = {
        redirectUri: options?.redirectUri || `${window.location.origin}/auth-callback.html`,
        scope: options?.scope || 'openid profile email offline_access',
        region: options?.region
      };

      const authUrl = authMethods.generateAuthUrl({
        ...defaultOptions,
        state: authMethods.generateState()
      });

      // Open popup window for OAuth
      const popup = window.open(
        authUrl,
        'agilityAuth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Listen for auth completion
      return new Promise<void>((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            reject(new Error('Authentication was cancelled by user'));
          }
        }, 1000);

        const handleMessage = async (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === 'AGILITY_AUTH_SUCCESS') {
            clearInterval(checkClosed);
            popup.close();
            window.removeEventListener('message', handleMessage);

            try {
              // Exchange code for tokens
              await authMethods.exchangeCodeForToken({
                code: event.data.code,
                redirectUri: defaultOptions.redirectUri
              }, options?.region);

              // Re-check auth status to update state
              await checkAuthStatus();
              
              // Verify that authentication was successful
              const isAuthenticated = await authMethods.isAuthenticated();
              if (isAuthenticated) {
                console.log('Authentication completed successfully');
                
                // Fetch user info asynchronously (non-blocking)
                fetchUserInfo().catch(error => {
                  console.warn('Failed to fetch user info after authentication:', error);
                });
                
                dispatch({ type: 'SET_LOADING', payload: false });
                resolve();
              } else {
                reject(new Error('Authentication verification failed'));
              }
            } catch (error) {
              reject(error);
            }
          } else if (event.data.type === 'AGILITY_AUTH_ERROR') {
            clearInterval(checkClosed);
            popup.close();
            window.removeEventListener('message', handleMessage);
            reject(new Error(event.data.error || 'Authentication failed'));
          }
        };

        window.addEventListener('message', handleMessage);
      });
      
    } catch (error) {
      console.error('Authentication failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Authentication failed. Please try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [authMethods, options, checkAuthStatus, fetchUserInfo]);

  /**
   * Sign out user and clear all state
   */
  const signOut = useCallback(async () => {
    try {
      // Clear local authentication - this handles token revocation
      await authMethods.clearAuthentication();
      dispatch({ type: 'SIGN_OUT' });
      setTokenInfo({});
    } catch (error) {
      console.error('Sign out failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sign out. Please try again.' });
    }
  }, [authMethods]);

  /**
   * Select a website and load its locales
   */
  const selectWebsite = useCallback(async (websiteGuid: string) => {
    dispatch({ type: 'SET_SELECTED_WEBSITE', payload: websiteGuid });
    dispatch({ type: 'SET_SELECTED_LOCALE', payload: '' });
    dispatch({ type: 'SET_LOCALES', payload: [] });

    if (!websiteGuid) return;

    dispatch({ type: 'SET_LOADING_LOCALES', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // Get access token and create SDK client directly
      const accessToken = await authMethods.getValidAccessToken();
      
      if (!accessToken) {
        throw new Error('No valid access token available for fetching locales');
      }
      
      // Try to import and use the management SDK directly
      try {
        const { ApiClient } = await import('@agility/management-sdk');
        
        const client = new ApiClient({ token: accessToken } as any);
        
        const localesList = await client.instanceMethods.getLocales(websiteGuid);
        
        // Convert to our expected format
        const formattedLocales: LocaleInfo[] = localesList.map((locale: any, index: number) => ({
          localeCode: locale.code || locale || `locale-${index}`,
          localeID: locale.id || index,
          localeName: locale.name || locale.description || locale || `Locale ${index + 1}`,
          isDefault: locale.isDefault || false,
          isEnabled: locale.isEnabled !== false
        }));

        dispatch({ type: 'SET_LOCALES', payload: formattedLocales });
      } catch (sdkError) {
        console.warn('Management SDK not available for fetching locales:', sdkError);
        throw new Error('Management SDK not available for fetching locales');
      }
    } catch (error) {
      console.error('Failed to fetch locales:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch locales for selected website' });
    } finally {
      dispatch({ type: 'SET_LOADING_LOCALES', payload: false });
    }
  }, [authMethods]);

  /**
   * Select a locale
   */
  const selectLocale = useCallback((localeCode: string) => {
    dispatch({ type: 'SET_SELECTED_LOCALE', payload: localeCode });
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  /**
   * Get current authentication tokens
   */
  const getTokens = useCallback(async () => {
    try {
      const tokenStorage = authMethods.getTokenStorage();
      if (tokenStorage) {
        return await tokenStorage.getTokens();
      }
      return null;
    } catch (error) {
      console.error('Failed to get tokens:', error);
      return null;
    }
  }, [authMethods]);

  /**
   * Get API client instance for direct access
   * Returns a properly initialized management SDK client
   */
  const getApiClient = useCallback(async () => {
    try {
      const accessToken = await authMethods.getValidAccessToken();
      
      if (!accessToken) {
        console.warn('No valid access token available for creating API client');
        return null;
      }
      
      const { ApiClient } = await import('@agility/management-sdk');
      
      return new ApiClient({ token: accessToken } as any);
    } catch (error) {
      console.error('Failed to create API client:', error);
      return null;
    }
  }, [authMethods, options?.sdkOptions]);

  /**
   * Get the full management SDK client for advanced usage
   * Returns the complete management SDK with all methods
   */
  const getFullApiClient = useCallback(async () => {
    try {
      const accessToken = await authMethods.getValidAccessToken();
      
      if (!accessToken) {
        console.warn('No valid access token available for creating full API client');
        return null;
      }
      
      const { ApiClient } = await import('@agility/management-sdk');
      
      return new ApiClient({ token: accessToken } as any);
    } catch (error) {
      console.error('Failed to create full API client:', error);
      return null;
    }
  }, [authMethods, options?.sdkOptions]);

  // Computed values
  const isReady = useMemo(() => 
    state.isAuthenticated && !state.isLoading && !state.isLoadingLocales,
    [state.isAuthenticated, state.isLoading, state.isLoadingLocales]
  );

  // Enhanced auth ready state that considers user data loading
  const isAuthReady = useMemo(() => 
    state.isAuthenticated && !state.isLoading,
    [state.isAuthenticated, state.isLoading]
  );

  const hasSelection = useMemo(() => 
    Boolean(state.selectedWebsite && state.selectedLocale),
    [state.selectedWebsite, state.selectedLocale]
  );

  const currentSelection = useMemo(() => {
    if (!hasSelection) return null;
    
    const website = state.websiteAccess.find(w => w.websiteGuid === state.selectedWebsite);
    const locale = state.locales.find(l => l.localeCode === state.selectedLocale);
    
    return website && locale ? {
      websiteName: website.websiteName,
      localeName: locale.localeName
    } : null;
  }, [hasSelection, state.websiteAccess, state.selectedWebsite, state.locales, state.selectedLocale]);

  return {
    // State
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    isLoadingLocales: state.isLoadingLocales,
    user: state.user,
    websiteAccess: state.websiteAccess,
    selectedWebsite: state.selectedWebsite,
    selectedLocale: state.selectedLocale,
    locales: state.locales,
    error: state.error,
    
    // Actions
    authenticate,
    signOut,
    selectWebsite,
    selectLocale,
    clearError,
    
    // Computed
    isReady,
    isAuthReady,
    hasSelection,
    currentSelection,
    
    // Token and debug info
    tokenInfo,
    getTokens,
    getApiClient,
    getFullApiClient,
  };
}
