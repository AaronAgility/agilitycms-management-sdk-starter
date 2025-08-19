import { CSSProperties, ReactNode } from 'react';
import { ServerUser } from './shared';
import { WebsiteAccess, LocaleInfo, AuthDisplayMode, AuthSize, AuthTheme, AuthComponentSlots } from './authComponent';

/**
 * Authentication component configuration interface
 */
export interface AgilityAuthConfig {
  // === Core Callbacks ===
  
  /**
   * Callback fired when user successfully signs in
   */
  onSignIn?: (user: ServerUser) => void;
  
  /**
   * Callback fired when user signs out
   */
  onSignOut?: () => void;
  
  /**
   * Callback fired when authenticate button is clicked
   */
  onButtonClick?: () => void;
  
  /**
   * Callback fired when a website is selected
   */
  onWebsiteSelect?: (website: WebsiteAccess) => void;
  
  /**
   * Callback fired when a locale is selected
   */
  onLocaleSelect?: (locale: LocaleInfo) => void;
  
  /**
   * Callback fired when an error occurs
   */
  onError?: (error: string) => void;
  
  // === Display & Behavior ===
  
  /**
   * Display mode for the component
   * @default 'fullscreen'
   */
  mode?: AuthDisplayMode;
  
  /**
   * Size variant of the component
   * @default 'medium'
   */
  size?: AuthSize;
  
  /**
   * Theme variant
   * @default 'dark'
   */
  theme?: AuthTheme;
  
  /**
   * Whether to show the current selection summary
   * @default true
   */
  showCurrentSelection?: boolean;
  
  /**
   * Whether to show the sign out button
   * @default true
   */
  showSignOutButton?: boolean;
  
  /**
   * Whether to show user information
   * @default true
   */
  showUserInfo?: boolean;
  
  /**
   * Whether to auto-close after successful authentication
   * @default false
   */
  autoClose?: boolean;
  
  // === Text & Labels ===
  
  /**
   * Main title text
   * @default 'Agility CMS Management'
   */
  title?: string;
  
  /**
   * Authentication button text
   * @default 'Authenticate'
   */
  buttonText?: string;
  
  /**
   * Sign out button text
   * @default 'Sign Out'
   */
  signOutText?: string;
  
  /**
   * Loading text
   * @default 'Authenticating...'
   */
  loadingText?: string;
  
  /**
   * Website selector placeholder
   * @default 'Choose a website...'
   */
  websitePlaceholder?: string;
  
  /**
   * Locale selector placeholder
   * @default 'Choose a locale...'
   */
  localePlaceholder?: string;
  
  // === Styling ===
  
  /**
   * Logo URL for custom branding
   */
  logoUrl?: string;
  
  /**
   * Custom theme classes for 'custom' theme mode
   */
  customClasses?: {
    // Background & container classes
    bg?: string;
    bgSecondary?: string;
    panel?: string;
    
    // Text classes
    text?: string;
    textSecondary?: string;
    
    // Border classes
    border?: string;
    
    // State classes
    error?: string;
    success?: string;
    
    // Button classes
    button?: string;
    buttonWrapper?: string;
    buttonSecondary?: string;
    buttonDanger?: string;
    signOutButton?: string;
    
    // Input & form classes
    input?: string;
    select?: string;
    
    // Layout classes
    topBar?: string;
    topBarTitle?: string;
    topBarUserInfo?: string;
    topBarSelect?: string;

  };
  
  /**
   * Custom CSS class for the main container
   */
  className?: string;
  
  /**
   * Custom CSS class for the title
   */
  titleClassName?: string;
  
  /**
   * Custom CSS class for the background
   */
  backgroundClassName?: string;
  
  /**
   * Custom CSS class for the authentication button
   */
  buttonClassName?: string;
  
  /**
   * Custom CSS class for the sign out button
   */
  signOutButtonClassName?: string;
  
  /**
   * Custom inline styles for the container
   */
  style?: CSSProperties;
  
  /**
   * Custom inline styles for the title
   */
  titleStyle?: CSSProperties;
  
  /**
   * Custom inline styles for the button
   */
  buttonStyle?: CSSProperties;
  
  // === OAuth Settings ===
  
  /**
   * OAuth redirect URI
   * @default `${window.location.origin}/auth-callback.html`
   */
  redirectUri?: string;
  
  /**
   * OAuth scope
   * @default 'openid profile email offline_access'
   */
  scope?: string;
  
  /**
   * OAuth region
   */
  region?: string;
  
  // === Advanced Customization ===
  
  /**
   * Custom component slots for advanced customization
   */
  slots?: AuthComponentSlots;
  
  /**
   * Render prop for complete customization
   */
  children?: (props: any) => ReactNode;
  
  /**
   * Whether to enable debug mode
   * @default false
   */
  debug?: boolean;
  
  /**
   * Custom error messages
   */
  errorMessages?: {
    authenticationFailed?: string;
    networkError?: string;
    tokenExpired?: string;
    permissionDenied?: string;
    generic?: string;
  };
  
  /**
   * Animation settings
   */
  animation?: {
    enabled?: boolean;
    duration?: number;
    easing?: string;
  };
  
  /**
   * Footer mode specific settings
   */
  footerSettings?: {
    position?: 'fixed' | 'sticky' | 'relative';
    height?: number;
    zIndex?: number;
    showToggle?: boolean;
    collapsed?: boolean;
  };
}
