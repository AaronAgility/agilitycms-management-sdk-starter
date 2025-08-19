import { ReactNode } from 'react';
import { ServerUser } from './shared';

/**
 * Website access information interface
 */
export interface WebsiteAccess {
  websiteGuid: string;
  websiteName: string;
  websiteDescription?: string;
}

/**
 * Locale information interface
 */
export interface LocaleInfo {
  localeCode: string;
  localeID: number;
  localeName: string;
  isDefault?: boolean;
  isEnabled?: boolean;
}

/**
 * Authentication component state interface
 */
export interface AuthComponentState {
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
 * Authentication component display modes
 */
export type AuthDisplayMode = 'fullscreen' | 'footer' | 'button-only';

/**
 * Authentication component size variants
 */
export type AuthSize = 'small' | 'medium' | 'large';

/**
 * Authentication component theme variants
 */
export type AuthTheme = 'light' | 'dark' | 'auto' | 'custom';

/**
 * Selection summary information
 */
export interface SelectionSummary {
  websiteName: string;
  websiteGuid: string;
  localeName: string;
  localeCode: string;
  userName: string;
  userEmail: string;
}

/**
 * Component render props for advanced customization
 */
export interface AuthRenderProps {
  authState: AuthComponentState;
  isAuthenticated: boolean;
  user: ServerUser | null;
  websiteAccess: WebsiteAccess[];
  selectedWebsite: string;
  selectedLocale: string;
  locales: LocaleInfo[];
  error: string | null;
  isLoading: boolean;
  actions: {
    handleAuthenticate: () => Promise<void>;
    handleSignOut: () => Promise<void>;
    handleWebsiteSelect: (websiteGuid: string) => Promise<void>;
    handleLocaleSelect: (localeCode: string) => void;
    clearError: () => void;
  };
}

/**
 * Custom component slots for advanced customization
 */
export interface AuthComponentSlots {
  title?: ReactNode;
  authButton?: ReactNode;
  userInfo?: ReactNode;
  websiteSelector?: ReactNode;
  localeSelector?: ReactNode;
  selectionSummary?: ReactNode;
  errorDisplay?: ReactNode;
  loadingSpinner?: ReactNode;
  signOutButton?: ReactNode;
}
