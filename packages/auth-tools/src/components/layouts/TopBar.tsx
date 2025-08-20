import React, { useState, useEffect } from "react";
import { Book, Settings } from "lucide-react";
import { AgilityAuthConfig } from "../../models/authConfig";
import { WebsiteAccess, LocaleInfo } from "../../models/authComponent";
import { ServerUser } from "../../models/shared";
import { CustomSelect } from "../ui/CustomSelect";
import { AgilityLogo } from "../ui/AgilityLogo";
import { TokenInfoModal } from "../TokenInfoModal";
import { useAgilityAuth } from "../hooks/useAgilityAuth";
import { useWebsiteSelection } from "../hooks/useWebsiteSelection";

export interface TopBarProps {
  config?: AgilityAuthConfig;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  config = {},
  className = "",
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light" | "auto" | "custom">("auto");

  // Handle theme detection and changes
  useEffect(() => {
    const theme = config.theme || "auto";
    setCurrentTheme(theme as "dark" | "light" | "auto" | "custom");
  }, [config.theme]);

  const {
    isAuthenticated,
    user,
    websiteAccess,
    selectedWebsite,
    selectedLocale,
    locales,
    isLoadingLocales,
    error,
    signOut,
    selectWebsite,
    selectLocale,
  } = useAgilityAuth({
    redirectUri: config.redirectUri,
    scope: config.scope,
    region: config.region,
    autoCheckAuth: true,
  });

  const websiteSelection = useWebsiteSelection(
    websiteAccess,
    selectedWebsite,
    locales,
    selectedLocale,
    isLoadingLocales,
    selectWebsite,
    selectLocale
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      if (config.onSignOut) {
        config.onSignOut();
      }
    } catch (error) {
      console.error("Sign out failed:", error);
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

  const handleLocaleSelect = async (localeCode: string) => {
    try {
      await websiteSelection.selectLocale(localeCode);
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

  // Theme classes logic (simplified version)
  const getThemeClasses = () => {
    const baseClasses = {
      topBar: "bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm p-4",
      text: "text-gray-900 dark:text-white",
      textSecondary: "text-gray-600 dark:text-gray-400", 
      topBarTitle: "text-lg font-semibold text-gray-900 dark:text-white",
      topBarUserInfo: "text-sm text-gray-600 dark:text-gray-400",
      button: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors",
      buttonSecondary: "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors",
      buttonDanger: "bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-sm rounded transition-colors",
      select: "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded px-3 py-1.5 text-sm",
      panel: "bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700",
      error: "text-red-600 dark:text-red-400",
    };

    if (currentTheme === "custom" && config.customClasses) {
      return { ...baseClasses, ...config.customClasses };
    }

    return baseClasses;
  };

  const themeClasses = getThemeClasses();

  

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${themeClasses.topBar} transition-all duration-300 ${className}`}
    >
      <div className="w-full flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <AgilityLogo logoUrl={config.logoUrl} />
            <div
              className={`${themeClasses.topBarTitle} ${themeClasses.text} ${
                config.titleClassName || ""
              }`}
            >
              {config.title || "Agility CMS"}
            </div>
          </div>

          <div className={`${themeClasses.topBarUserInfo} ${themeClasses.textSecondary}`}>
            {user?.emailAddress || "User"}
          </div>

          <div className="flex gap-3 items-center ml-auto">
            <CustomSelect
              value={selectedWebsite}
              onChange={handleWebsiteSelect}
              options={websiteAccess.map((website: WebsiteAccess) => ({
                value: website.websiteGuid,
                label: website.websiteName,
                guid: website.websiteGuid
              }))}
              placeholder={config.websitePlaceholder || "Choose website..."}
            />

            {selectedWebsite && (
              <CustomSelect
                value={selectedLocale}
                onChange={handleLocaleSelect}
                options={locales.map((locale: LocaleInfo) => ({
                  value: locale.localeCode,
                  label: `${locale.localeName} (${locale.localeCode})`,
                  guid: locale.localeCode
                }))}
                placeholder={isLoadingLocales ? "Loading..." : config.localePlaceholder || "Choose locale..."}
                disabled={isLoadingLocales}
              />
            )}
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {selectedWebsite && selectedLocale && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`${themeClasses.buttonSecondary} px-3 py-2 rounded-lg text-xs transition-colors`}
            >
              {showDetails ? "Hide" : "Show"} Details
            </button>
          )}

          {/* Documentation Link */}
          <a
            href="https://github.com/agility/agility-cms-management-sdk-typescript"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 hover:scale-105"
            title="View Documentation"
          >
            <Book className="w-4 h-4 text-gray-600" />
          </a>

          {/* Debug/Token Info Icon */}
          <button
            onClick={() => setShowTokenModal(true)}
            className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 hover:scale-105"
            title="View Token Information"
          >
            <Settings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          {config.showSignOutButton !== false && (
            <button
              onClick={handleSignOut}
              className={`${themeClasses.buttonDanger} px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
            >
              {config.signOutText || "Sign Out"}
            </button>
          )}
        </div>
      </div>

      {showDetails && selectedWebsite && selectedLocale && (
        <div className={`mt-4 p-4 rounded-lg border text-sm ${themeClasses.panel}`}>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <strong className={themeClasses.text}>Website:</strong>
            <span className={themeClasses.textSecondary}>
              {websiteSelection.currentSelection?.websiteName || "Unknown"}
            </span>
            <strong className={themeClasses.text}>Locale:</strong>
            <span className={themeClasses.textSecondary}>
              {websiteSelection.currentSelection?.localeName || "Unknown"}
            </span>
            <strong className={themeClasses.text}>Website ID:</strong>
            <span className={`font-mono text-xs ${themeClasses.textSecondary}`}>
              {selectedWebsite}
            </span>
            <strong className={themeClasses.text}>Locale Code:</strong>
            <span className={`font-mono text-xs ${themeClasses.textSecondary}`}>
              {selectedLocale}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className={`mt-4 p-3 rounded-lg text-sm border ${themeClasses.error}`}>
          {error}
        </div>
      )}

      {/* Token Info Modal */}
      <TokenInfoModal 
        isOpen={showTokenModal} 
        onClose={() => setShowTokenModal(false)} 
      />
    </div>
  );
};
