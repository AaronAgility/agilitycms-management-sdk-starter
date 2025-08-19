import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import { 
  AuthReducerState, 
  AuthAction, 
  AuthContextValue, 
  initialAuthState 
} from '../../models/authState';
import { ServerUser } from '../../models/shared';
import { WebsiteAccess, LocaleInfo } from '../../models/authComponent';

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
 * Authentication context
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Authentication context provider props
 */
export interface AuthProviderProps {
  children: React.ReactNode;
  initialState?: Partial<AuthReducerState>;
}

/**
 * Authentication context provider
 * Provides authentication state and actions to child components
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  initialState = {} 
}) => {
  const [state, dispatch] = useReducer(authReducer, {
    ...initialAuthState,
    ...initialState
  });

  // Define all action creators using useCallback at the top level
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setLoadingLocales = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING_LOCALES', payload: loading });
  }, []);

  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const setAuthenticated = useCallback((authenticated: boolean) => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: authenticated });
  }, []);

  const setUser = useCallback((user: ServerUser | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const setWebsiteAccess = useCallback((websites: WebsiteAccess[]) => {
    dispatch({ type: 'SET_WEBSITE_ACCESS', payload: websites });
  }, []);

  const setSelectedWebsite = useCallback((websiteGuid: string) => {
    dispatch({ type: 'SET_SELECTED_WEBSITE', payload: websiteGuid });
  }, []);

  const setSelectedLocale = useCallback((localeCode: string) => {
    dispatch({ type: 'SET_SELECTED_LOCALE', payload: localeCode });
  }, []);

  const setLocales = useCallback((locales: LocaleInfo[]) => {
    dispatch({ type: 'SET_LOCALES', payload: locales });
  }, []);

  const signOut = useCallback(() => {
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Now create the actions object using useMemo that references the callbacks
  const actions = useMemo(() => ({
    setLoading,
    setLoadingLocales,
    setError,
    clearError,
    setAuthenticated,
    setUser,
    setWebsiteAccess,
    setSelectedWebsite,
    setSelectedLocale,
    setLocales,
    signOut,
    resetState,
  }), [
    setLoading,
    setLoadingLocales,
    setError,
    clearError,
    setAuthenticated,
    setUser,
    setWebsiteAccess,
    setSelectedWebsite,
    setSelectedLocale,
    setLocales,
    signOut,
    resetState,
  ]);

  const contextValue = useMemo(() => ({
    state,
    dispatch,
    actions,
  }), [state, actions]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the authentication context
 * @throws Error if used outside of AuthProvider
 */
export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Custom hook to get authentication state
 */
export const useAuthState = () => {
  const { state } = useAuthContext();
  return state;
};

/**
 * Custom hook to get authentication actions
 */
export const useAuthActions = () => {
  const { actions } = useAuthContext();
  return actions;
};

/**
 * Custom hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { state } = useAuthContext();
  return state.isAuthenticated;
};

/**
 * Custom hook to get current user
 */
export const useCurrentUser = () => {
  const { state } = useAuthContext();
  return state.user;
};

/**
 * Custom hook to get website access
 */
export const useWebsiteAccess = () => {
  const { state } = useAuthContext();
  return state.websiteAccess;
};

/**
 * Custom hook to get selected website and locale
 */
export const useSelection = () => {
  const { state } = useAuthContext();
  return {
    selectedWebsite: state.selectedWebsite,
    selectedLocale: state.selectedLocale,
    locales: state.locales,
    hasSelection: Boolean(state.selectedWebsite && state.selectedLocale),
  };
};

/**
 * Custom hook to get loading states
 */
export const useLoadingStates = () => {
  const { state } = useAuthContext();
  return {
    isLoading: state.isLoading,
    isLoadingLocales: state.isLoadingLocales,
    isReady: state.isAuthenticated && !state.isLoading && !state.isLoadingLocales,
  };
};

/**
 * Custom hook to get error state
 */
export const useAuthError = () => {
  const { state, actions } = useAuthContext();
  return {
    error: state.error,
    clearError: actions.clearError,
    hasError: Boolean(state.error),
  };
};
