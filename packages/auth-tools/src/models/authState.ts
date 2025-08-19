import { ServerUser } from './shared';
import { WebsiteAccess, LocaleInfo } from './authComponent';

/**
 * Authentication action types
 */
export type AuthActionType = 
  | 'SET_LOADING'
  | 'SET_LOADING_LOCALES'
  | 'SET_ERROR'
  | 'CLEAR_ERROR'
  | 'SET_AUTHENTICATED'
  | 'SET_USER'
  | 'SET_WEBSITE_ACCESS'
  | 'SET_SELECTED_WEBSITE'
  | 'SET_SELECTED_LOCALE'
  | 'SET_LOCALES'
  | 'SIGN_OUT'
  | 'RESET_STATE';

/**
 * Authentication state for the reducer
 */
export interface AuthReducerState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoadingLocales: boolean;
  user: ServerUser | null;
  websiteAccess: WebsiteAccess[];
  selectedWebsite: string;
  selectedLocale: string;
  locales: LocaleInfo[];
  error: string | null;
}

/**
 * Authentication action interfaces
 */
export interface SetLoadingAction {
  type: 'SET_LOADING';
  payload: boolean;
}

export interface SetLoadingLocalesAction {
  type: 'SET_LOADING_LOCALES';
  payload: boolean;
}

export interface SetErrorAction {
  type: 'SET_ERROR';
  payload: string;
}

export interface ClearErrorAction {
  type: 'CLEAR_ERROR';
}

export interface SetAuthenticatedAction {
  type: 'SET_AUTHENTICATED';
  payload: boolean;
}

export interface SetUserAction {
  type: 'SET_USER';
  payload: ServerUser | null;
}

export interface SetWebsiteAccessAction {
  type: 'SET_WEBSITE_ACCESS';
  payload: WebsiteAccess[];
}

export interface SetSelectedWebsiteAction {
  type: 'SET_SELECTED_WEBSITE';
  payload: string;
}

export interface SetSelectedLocaleAction {
  type: 'SET_SELECTED_LOCALE';
  payload: string;
}

export interface SetLocalesAction {
  type: 'SET_LOCALES';
  payload: LocaleInfo[];
}

export interface SignOutAction {
  type: 'SIGN_OUT';
}

export interface ResetStateAction {
  type: 'RESET_STATE';
}

/**
 * Union type for all authentication actions
 */
export type AuthAction = 
  | SetLoadingAction
  | SetLoadingLocalesAction
  | SetErrorAction
  | ClearErrorAction
  | SetAuthenticatedAction
  | SetUserAction
  | SetWebsiteAccessAction
  | SetSelectedWebsiteAction
  | SetSelectedLocaleAction
  | SetLocalesAction
  | SignOutAction
  | ResetStateAction;

/**
 * Initial state for the authentication reducer
 */
export const initialAuthState: AuthReducerState = {
  isAuthenticated: false,
  isLoading: false,
  isLoadingLocales: false,
  user: null,
  websiteAccess: [],
  selectedWebsite: '',
  selectedLocale: '',
  locales: [],
  error: null,
};

/**
 * Auth context value interface
 */
export interface AuthContextValue {
  state: AuthReducerState;
  dispatch: React.Dispatch<AuthAction>;
  actions: {
    setLoading: (loading: boolean) => void;
    setLoadingLocales: (loading: boolean) => void;
    setError: (error: string) => void;
    clearError: () => void;
    setAuthenticated: (authenticated: boolean) => void;
    setUser: (user: ServerUser | null) => void;
    setWebsiteAccess: (websites: WebsiteAccess[]) => void;
    setSelectedWebsite: (websiteGuid: string) => void;
    setSelectedLocale: (localeCode: string) => void;
    setLocales: (locales: LocaleInfo[]) => void;
    signOut: () => void;
    resetState: () => void;
  };
}

/**
 * Hook return type for useAgilityAuth
 */
export interface UseAgilityAuthReturn {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoadingLocales: boolean;
  user: ServerUser | null;
  websiteAccess: WebsiteAccess[];
  selectedWebsite: string;
  selectedLocale: string;
  locales: LocaleInfo[];
  error: string | null;
  
  // Actions
  authenticate: () => Promise<void>;
  signOut: () => Promise<void>;
  selectWebsite: (websiteGuid: string) => Promise<void>;
  selectLocale: (localeCode: string) => void;
  clearError: () => void;
  
  // Computed
  isReady: boolean;
  hasSelection: boolean;
  currentSelection: {
    websiteName: string;
    localeName: string;
  } | null;
  
  // Token and debug info
  tokenInfo: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    tokenType?: string;
    scope?: string;
  };
  getTokens: () => Promise<any>;
  getApiClient: () => any;
}

/**
 * Hook return type for useWebsiteSelection
 */
export interface UseWebsiteSelectionReturn {
  websites: WebsiteAccess[];
  selectedWebsite: string;
  locales: LocaleInfo[];
  selectedLocale: string;
  isLoadingLocales: boolean;
  selectWebsite: (websiteGuid: string) => Promise<void>;
  selectLocale: (localeCode: string) => void;
  currentSelection: {
    websiteName: string;
    localeName: string;
  } | null;
}
