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
import { defaultSdkAdapter } from '../../adapters/sdkAdapter';

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
   * Update token information from storage
   */
  const updateTokenInfo = useCallback(async () => {
    try {
      const tokenStorage = authMethods.getTokenStorage();
      if (tokenStorage) {
        const tokens = await tokenStorage.getTokens();
        if (tokens) {
          setTokenInfo({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: tokens.expiresAt,
            tokenType: tokens.tokenType,
            scope: tokens.scope
          });
        }
      }
    } catch (error) {
      console.error('Failed to update token info:', error);
    }
  }, [authMethods]);

  /**
   * Check if user is already authenticated
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      const isAuthenticated = await authMethods.isAuthenticated();
      
      if (isAuthenticated) {
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        
        // Try to get user info and website access if SDK is available
        if (defaultSdkAdapter.isMainSdkAvailable()) {
          try {
            const apiClient = defaultSdkAdapter.createApiClient(options?.sdkOptions);
            const user = await apiClient.serverUserMethods.me();
            dispatch({ type: 'SET_USER', payload: user });
            
            // Extract website access information
            const websites: WebsiteAccess[] = user.websiteAccess?.map((access: any, index: number) => ({
              websiteGuid: access.guid || `website-${index}`,
              websiteName: (access.displayName || access.websiteName) || access.guid || `Website ${index + 1}`,
              websiteDescription: access.description || access.websiteName || access.guid || `Website ${index + 1}`
            })) || [];
            
            dispatch({ type: 'SET_WEBSITE_ACCESS', payload: websites });
          } catch (error) {
            console.warn('Failed to get user info from SDK:', error);
            // Still authenticated, just no user info available
          }
        }
        
        // Update token info
        await updateTokenInfo();
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to check authentication status' });
    }
  }, [authMethods, options?.sdkOptions, updateTokenInfo]);

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
              resolve();
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
  }, [authMethods, options, checkAuthStatus]);

  /**
   * Sign out user and clear all state
   */
  const signOut = useCallback(async () => {
    try {
      // Try to sign out from SDK if available
      if (defaultSdkAdapter.isMainSdkAvailable()) {
        try {
          const apiClient = defaultSdkAdapter.createApiClient(options?.sdkOptions);
          await apiClient.signOut();
        } catch (error) {
          console.warn('Failed to sign out from SDK:', error);
        }
      }
      
      // Clear local authentication
      await authMethods.clearAuthentication();
      dispatch({ type: 'SIGN_OUT' });
      setTokenInfo({});
    } catch (error) {
      console.error('Sign out failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sign out. Please try again.' });
    }
  }, [authMethods, options?.sdkOptions]);

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
      if (defaultSdkAdapter.isMainSdkAvailable()) {
        const apiClient = defaultSdkAdapter.createApiClient(options?.sdkOptions);
        const localesList = await apiClient.instanceMethods.getLocales(websiteGuid);
        
        // Convert to our expected format
        const formattedLocales: LocaleInfo[] = localesList.map((locale: any, index: number) => ({
          localeCode: locale.code || locale || `locale-${index}`,
          localeID: locale.id || index,
          localeName: locale.name || locale.description || locale || `Locale ${index + 1}`,
          isDefault: locale.isDefault || false,
          isEnabled: locale.isEnabled !== false
        }));

        dispatch({ type: 'SET_LOCALES', payload: formattedLocales });
      } else {
        throw new Error('SDK not available for fetching locales');
      }
    } catch (error) {
      console.error('Failed to fetch locales:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch locales for selected website' });
    } finally {
      dispatch({ type: 'SET_LOADING_LOCALES', payload: false });
    }
  }, [options?.sdkOptions]);

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
   */
  const getApiClient = useCallback(() => {
    if (defaultSdkAdapter.isMainSdkAvailable()) {
      return defaultSdkAdapter.createApiClient(options?.sdkOptions);
    }
    return null;
  }, [options?.sdkOptions]);

  // Computed values
  const isReady = useMemo(() => 
    state.isAuthenticated && !state.isLoading && !state.isLoadingLocales,
    [state.isAuthenticated, state.isLoading, state.isLoadingLocales]
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
    hasSelection,
    currentSelection,
    
    // Token and debug info
    tokenInfo,
    getTokens,
    getApiClient,
  };
}
