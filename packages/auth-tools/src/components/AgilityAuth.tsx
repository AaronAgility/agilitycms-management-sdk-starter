import React, { useState, useEffect } from "react";
import { useAgilityAuth } from "./hooks/useAgilityAuth";
import { useWebsiteSelection } from "./hooks/useWebsiteSelection";
import { WebsiteAccess, LocaleInfo } from "../models/authComponent";
import { AgilityAuthConfig } from "../models/authConfig";
import { ButtonOnlyMode } from "./modes";
import { LoginPanel, TopBar } from "./layouts";

export interface AgilityAuthProps {
  config?: AgilityAuthConfig;
  className?: string;
}



/**
 * Reusable Agility CMS Authentication Component
 * Provides complete authentication flow with website/locale selection
 */
export const AgilityAuth: React.FC<AgilityAuthProps> = ({
  config = {},
  className = "",
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<
    "dark" | "light" | "auto" | "custom"
  >("dark");
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Handle theme detection and changes
  useEffect(() => {
    const theme = config.theme || "dark";
    setCurrentTheme(theme as "dark" | "light" | "auto" | "custom");
  }, [config.theme]);

  const {
    isAuthenticated,
    isLoading,
    error,
    user,
    websiteAccess,
    selectedWebsite,
    selectedLocale,
    locales,
    isLoadingLocales,
    authenticate,
    signOut,
    selectWebsite,
    selectLocale,
    clearError,
  } = useAgilityAuth({
    autoCheckAuth: true,
    redirectUri: config.redirectUri,
    scope: config.scope,
    region: config.region,
  });

  // Auto-redirect effect when authentication is complete
  useEffect(() => {
    if (isAuthenticated && config.onSignIn && !isRedirecting) {
      console.log('AgilityAuth: Authentication complete, executing onSignIn callback');
      // console.log('AgilityAuth: User:', user?.emailAddress);
      // setIsRedirecting(true);
      config.onSignIn(null as any);
    }
  }, [isAuthenticated,  config.onSignIn, isRedirecting]);

  const websiteSelection = useWebsiteSelection(
    websiteAccess,
    selectedWebsite,
    locales,
    selectedLocale,
    isLoadingLocales,
    selectWebsite,
    selectLocale
  );

  const handleAuthenticate = async () => {
    clearError();
    try {
      await authenticate();
      // onSignIn callback will be triggered by useEffect when user data is available
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsRedirecting(true);
      await signOut();
      if (config.onSignOut) {
        config.onSignOut();
      }
    } catch (error) {
      console.error("Sign out failed:", error);
      setIsRedirecting(false);
    }
  };

  const handleWebsiteSelect = async (websiteGuid: string) => {
    try {
      await websiteSelection.selectWebsite(websiteGuid);
      if (config.onWebsiteSelect) {
        const selectedWebsite = websiteAccess.find(
          (w) => w.websiteGuid === websiteGuid
        );
        if (selectedWebsite) {
          config.onWebsiteSelect(selectedWebsite);
        }
      }
    } catch (error) {
      console.error("Website selection failed:", error);
    }
  };

  const handleLocaleSelect = (localeCode: string) => {
    try {
      websiteSelection.selectLocale(localeCode);
      if (config.onLocaleSelect) {
        const selectedLocale = locales.find((l) => l.localeCode === localeCode);
        if (selectedLocale) {
          config.onLocaleSelect(selectedLocale);
        }
      }
    } catch (error) {
      console.error("Locale selection failed:", error);
    }
  };

  

  // Get theme classes based on current theme
  const getThemeClasses = () => {


    const autoTheme = {
      default: {
        bg: "bg-white",
        bgSecondary: "bg-gray-50",
        text: "text-gray-900",
        textSecondary: "text-gray-600",
        border: "border-gray-200",
        error: "text-red-600 bg-red-50 border-red-200",
        success: "text-green-600 bg-green-50 border-green-200",
        button: "bg-black hover:bg-gray-800 text-white p-4 px-8 mx-auto mt-8",
        buttonWrapper: "px-8 pb-8 flex flex-col items-center",
        buttonSecondary:
          "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300",
        buttonDanger: "bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium",
        input:
          "bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500",
        select:
          "bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500",
        panel: "bg-yellow-500",
        topBar: "flex items-center justify-between gap-4 flex-wrap w-full px-4",
        topBarTitle: "text-2xl font-bold",
        topBarUserInfo: "text-sm",
        topBarSelect: "text-sm",
      },
      dark: {
        bg: "bg-white",
        bgSecondary: "bg-white",
        text: "text-black",
        textSecondary: "text-gray-400",
        border: "border-gray-700",
        error: "text-red-400 bg-red-900/20 border-red-700",
        success: "text-green-400 bg-green-900/20 border-green-700",
        button: "bg-black hover:bg-gray-800 text-white p-4 px-8 mx-auto mt-8 rounded-lg",
        buttonWrapper: "px-8 pb-8 flex flex-row items-center justify-center",
        buttonSecondary:
          "bg-black hover:bg-gray-500 text-white border border-gray-600",
        buttonDanger: "bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium",
        input:
          "bg-gray-800 border-gray-600 text-gray-100 focus:ring-blue-500 focus:border-blue-500",
        select:
          "bg-gray-800 border-gray-600 text-black focus:ring-blue-500 focus:border-blue-500 p-2",
        panel: "bg-white border-gray-700 rounded-2xl shadow-xl max-w-[25vw] mx-auto p-8",
        topBar: " w-full p-4 px-0 fixed left-0 right-0 top-0 z-50 bg-white text-black shadow-lg",
        topBarTitle: "text-xl font-normal text-gray-600",
        topBarUserInfo: "text-sm",
        topBarSelect: "text-sm",
      },
      light: {
        bg: "bg-white",
        bgSecondary: "bg-gray-50",
        text: "text-gray-900",
        textSecondary: "text-gray-600",
        border: "border-gray-200",
        error: "text-red-600 bg-red-50 border-red-200",
        success: "text-green-600 bg-green-50 border-green-200",
        button: "bg-gray-900 hover:bg-gray-800 text-white",
        buttonWrapper: "px-8 pb-8 flex flex-col items-center",
        buttonSecondary:
          "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300",
        buttonDanger: "bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium",
        input:
          "bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500",
        select:
          "bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500",
        panel: "bg-gray-50 border-gray-200",
        topBar: "flex items-center justify-between gap-4 flex-wrap w-full p-4",
        topBarTitle: "text-2xl font-bold",
        topBarUserInfo: "text-sm",
        topBarSelect: "text-sm",
      },
    };

  

    // If custom theme, use provided classes
    if (currentTheme === "custom") {
      return {
        ...config.customClasses,
        bg: config.customClasses?.bg || autoTheme.default.bg || '',
        bgSecondary: config.customClasses?.bgSecondary || autoTheme.default.bgSecondary || '',
        text: config.customClasses?.text || autoTheme.default.text || '',
        textSecondary: config.customClasses?.textSecondary || autoTheme.default.textSecondary || '',
        border: config.customClasses?.border || autoTheme.default.border || '',
        error:
          config.customClasses?.error ||
          autoTheme.default.error || '',
        success:
          config.customClasses?.success ||
          autoTheme.default.success || '',
        button:
          config.customClasses?.button ||
          autoTheme.default.button || '',
        buttonWrapper:
          config.customClasses?.buttonWrapper ||
          autoTheme.default.buttonWrapper || '',
        buttonSecondary:
          config.customClasses?.buttonSecondary ||
          autoTheme.default.buttonSecondary || '',
        buttonDanger:
          config.customClasses?.buttonDanger ||
          config.customClasses?.signOutButton || 
          autoTheme.default.buttonDanger || '',
        input:
          config.customClasses?.input ||
          autoTheme.default.input || '',
        select:
          config.customClasses?.select ||
          config.customClasses?.input ||
          autoTheme.default.select || '',
        panel:
          config.customClasses?.panel ||
          autoTheme.default.panel || 'bg-red-500',
        topBar:
          config.customClasses?.topBar ||
          autoTheme.default.topBar || '',
        topBarTitle:
          config.customClasses?.topBarTitle ||
          autoTheme.default.topBarTitle || '',
        topBarUserInfo:
          config.customClasses?.topBarUserInfo ||
          autoTheme.default.topBarUserInfo || '',
        topBarSelect:
          config.customClasses?.topBarSelect ||
          autoTheme.default.topBarSelect || ''
      };
    }

    // Handle auto theme by detecting system preference or falling back to dark
    if (currentTheme === "auto") {
      // For now, default to dark theme when auto is selected
      // TODO: Add system preference detection
      return autoTheme.dark;
    }
    
    return autoTheme[currentTheme as keyof typeof autoTheme] || autoTheme.dark;
  };

  const themeClasses = getThemeClasses();

  // Determine layout mode
  const isFloatingBar = config.mode === "footer" || (!config.mode && true);

  // Button-only mode
  if (config.mode === "button-only") {
    return (
      <ButtonOnlyMode
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
        onAuthenticate={handleAuthenticate}
        onSignOut={handleSignOut}
        config={config}
        themeClasses={themeClasses}
      />
    );
  }

  // Show loading/redirecting state
  // if (isRedirecting) {
  //   return (
  //     <div className={`${themeClasses.bg} ${themeClasses.text} p-4 rounded-lg border ${themeClasses.border}`}>
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current mx-auto mb-2"></div>
  //         <p>Redirecting...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Unauthenticated view - Clean inline panel
  if (!isAuthenticated) {
    return (
      <LoginPanel
        config={config}
        className={className}
      />
    );
  }

  // Authenticated view with floating bar
  if (isAuthenticated) {
    return (
      <TopBar
        config={config}
        className={className}
      />
    );
  }

  // Authenticated view - standard panel (when not floating and not fullscreen)
  return "not authenticated"
};
