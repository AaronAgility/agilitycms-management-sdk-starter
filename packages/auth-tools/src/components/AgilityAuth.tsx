import React, { useState, useEffect } from "react";
import { useAgilityAuth } from "./hooks/useAgilityAuth";
import { useWebsiteSelection } from "./hooks/useWebsiteSelection";
import { WebsiteAccess, LocaleInfo } from "../models/authComponent";
import { AgilityAuthConfig } from "../models/authConfig";
import { ChevronDown, Book, Check, Settings } from "lucide-react";
import { TokenInfoModal } from "./TokenInfoModal";

export interface AgilityAuthProps {
  config?: AgilityAuthConfig;
  className?: string;
}

// Default Agility logo SVG
const AgilityLogo = () => (
  <svg
    viewBox="0 0 73.6 63.6"
    className="w-8 h-8 flex-shrink-0"
    style={{ width: "32px", height: "32px" }}
  >
    <path
      d="M43.064 53.463H17.419l19.33-33.39 19.33 33.39 5.638 9.948h11.64L36.748.177.14 63.411h47.417z"
      fill="#FFCB28"
    />
  </svg>
);

// Custom Select Component with Search
interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; guid?: string }>;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOption, setSelectedOption] = useState(
    options.find(opt => opt.value === value) || null
  );
  const selectRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Update selected option when value changes
  React.useEffect(() => {
    setSelectedOption(options.find(opt => opt.value === value) || null);
  }, [value, options]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.guid && option.guid.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Highlight matching text
  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-900 font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleSelect = (option: { value: string; label: string; guid?: string }) => {
    setSelectedOption(option);
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Handle input change - show dropdown on first character typed
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    // Open dropdown when user types first character
    if (newValue.length === 1 && !isOpen) {
      setIsOpen(true);
    }
  };

  // Handle arrow click - toggle dropdown
  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    // Only open dropdown if there's already text (preserve existing behavior)
    if (searchTerm.length > 0) {
      setIsOpen(true);
    }
  };

  // Get display value for input
  const getDisplayValue = () => {
    if (searchTerm) return searchTerm;
    if (selectedOption) return selectedOption.label;
    return "";
  };

  return (
    <div ref={selectRef} className={`relative w-64 ${className}`}>
      <div className={`relative w-full bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all duration-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-400'
      }`}>
        <input
          ref={searchInputRef}
          type="text"
          value={getDisplayValue()}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 text-sm text-gray-700 bg-transparent border-none outline-none rounded-lg placeholder-gray-400 pr-10"
        />
        <button
          type="button"
          onClick={handleArrowClick}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-100 rounded-r-lg transition-colors duration-200"
        >
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Options List */}
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors duration-150 ${
                    selectedOption?.value === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">
                        {highlightMatch(option.label, searchTerm)}
                      </div>
                      {option.guid && (
                        <div className="text-xs text-gray-500 font-mono truncate">
                          {highlightMatch(option.guid, searchTerm)}
                        </div>
                      )}
                    </div>
                    {selectedOption?.value === option.value && (
                      <Check className="w-4 h-4 text-blue-600 ml-2 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchTerm ? "No websites found" : "Start typing to search..."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
      if (config.onSignIn && user) {
        config.onSignIn(user);
      }
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

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

  // Logo component
  const LogoComponent = () => {
    if (config.logoUrl) {
      return (
        <img
          src={config.logoUrl}
          alt="Logo"
          className="w-8 h-8 flex-shrink-0"
          style={{ width: "32px", height: "32px" }}
        />
      );
    }
    return <AgilityLogo />;
  };

  // Button-only mode
  if (config.mode === "button-only") {
    return (
      <div className="inline-block">
        <button
          onClick={isAuthenticated ? handleSignOut : handleAuthenticate}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200 ${
            isLoading ? "bg-gray-400 cursor-not-allowed" : themeClasses.button
          } ${config.buttonClassName || ""}`}
        >
          {isLoading
            ? config.loadingText || "Processing..."
            : isAuthenticated
            ? config.signOutText || "Sign Out"
            : config.buttonText || "Authenticate with Agility"}
        </button>
      </div>
    );
  }

  // Unauthenticated view - Clean inline panel
  if (!isAuthenticated) {
    return (
      <div className={`${themeClasses.panel} `}>
        <div
          className={`${themeClasses.bg} overflow-hidden ${config.backgroundClassName || ""}`}
        >
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="flex justify-center mb-4">
              <LogoComponent />
            </div>
            <h1
              className={`text-2xl font-bold ${themeClasses.text} mb-2 ${
                config.titleClassName || ""
              }`}
            >
              {config.title || "Agility CMS"}
            </h1>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              Sign in to manage your content
            </p>
          </div>

          {/* Content */}
          <div className={`${themeClasses.buttonWrapper}`}>
            {error && (
              <div
                className={`mb-6 p-4 rounded-lg text-sm border ${themeClasses.error}`}
              >
                {error}
              </div>
            )}

            <button
              onClick={handleAuthenticate}
              disabled={isLoading}
              className={`${themeClasses.button} ${config.buttonClassName || ""}`}
            >
              {isLoading
                ? config.loadingText || "Authenticating..."
                : config.buttonText || "Authenticate with Agility"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated view with floating bar
  if (isFloatingBar) {
    return (
      <div
        className={`fixed top-0 left-0 right-0 z-50 ${themeClasses.topBar} transition-all duration-300`}
      >
        <div className="w-full flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <LogoComponent />
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
  }

  // Authenticated view - standard panel (when not floating)
  return (
    <div
      className={`max-w-md mx-auto p-8 ${config.className || ""} ${className}`}
    >
      <div
        className={`${themeClasses.bg} rounded-2xl shadow-xl border ${themeClasses.border} overflow-hidden`}
      >
        <div className="p-8">
          <div className="flex justify-center mb-4">
            <LogoComponent />
          </div>
          <h1
            className={`text-2xl font-bold text-center ${
              themeClasses.text
            } mb-6 ${config.titleClassName || ""}`}
          >
            {config.title || "Agility CMS Management"}
          </h1>

          {config.showUserInfo !== false && (
            <div className="mb-6">
              <h2 className={`text-lg font-semibold mb-2 ${themeClasses.text}`}>
                Welcome, {user?.userName || "User"}!
              </h2>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                {user?.emailAddress}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${themeClasses.text}`}
              >
                Select Website
              </label>
              <select
                value={selectedWebsite}
                onChange={(e) => handleWebsiteSelect(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-base ${themeClasses.select}`}
              >
                <option value="">
                  {config.websitePlaceholder || "Choose a website..."}
                </option>
                {websiteAccess.map((website: WebsiteAccess, index: number) => (
                  <option
                    key={website.websiteGuid || `website-${index}`}
                    value={website.websiteGuid}
                  >
                    {website.websiteName} ({website.websiteGuid})
                  </option>
                ))}
              </select>
            </div>

            {selectedWebsite && (
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${themeClasses.text}`}
                >
                  Select Locale
                  {isLoadingLocales && (
                    <span className={themeClasses.textSecondary}>
                      {" "}
                      (Loading...)
                    </span>
                  )}
                </label>
                <select
                  value={selectedLocale}
                  onChange={(e) => handleLocaleSelect(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border text-base ${themeClasses.select}`}
                  disabled={isLoadingLocales}
                >
                  <option value="">
                    {isLoadingLocales
                      ? "Loading locales..."
                      : config.localePlaceholder || "Choose a locale..."}
                  </option>
                  {locales.map((locale: LocaleInfo, index: number) => (
                    <option
                      key={locale.localeCode || `locale-${index}`}
                      value={locale.localeCode}
                    >
                      {locale.localeName} ({locale.localeCode})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {error && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm border ${themeClasses.error}`}
            >
              {error}
            </div>
          )}

          {websiteSelection.currentSelection &&
            config.showCurrentSelection !== false && (
              <div
                className={`mt-6 p-4 rounded-lg border ${themeClasses.panel}`}
              >
                <h3
                  className={`text-base font-semibold mb-2 ${themeClasses.text}`}
                >
                  Current Selection
                </h3>
                <div
                  className={`text-sm ${themeClasses.textSecondary} space-y-1`}
                >
                  <p>
                    <strong className={themeClasses.text}>Website:</strong>{" "}
                    {websiteSelection.currentSelection.websiteName}
                  </p>
                  <p>
                    <strong className={themeClasses.text}>Locale:</strong>{" "}
                    {websiteSelection.currentSelection.localeName}
                  </p>
                  <p>
                    <strong className={themeClasses.text}>Website ID:</strong>
                    <span className="font-mono text-xs ml-1">
                      {selectedWebsite}
                    </span>
                  </p>
                  <p>
                    <strong className={themeClasses.text}>Locale Code:</strong>
                    <span className="font-mono text-xs ml-1">
                      {selectedLocale}
                    </span>
                  </p>
                </div>
              </div>
            )}

          {config.showSignOutButton !== false && (
            <button
              onClick={handleSignOut}
              className={`mt-6 w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                themeClasses.buttonDanger
              } ${config.signOutButtonClassName || ""}`}
            >
              {config.signOutText || "Sign Out"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Export as LoginPanel alias for convenience
export const LoginPanel = AgilityAuth;
