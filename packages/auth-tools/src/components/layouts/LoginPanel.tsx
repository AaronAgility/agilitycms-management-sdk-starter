import React, { useState, useEffect } from "react";
import { AgilityAuthConfig } from "../../models/authConfig";
import { AgilityLogo } from "../ui/AgilityLogo";
import { AuthButton } from "../ui/AuthButton";
import { useAgilityAuth } from "../hooks/useAgilityAuth";

export interface LoginPanelProps {
  config?: AgilityAuthConfig;
  className?: string;
}

export const LoginPanel: React.FC<LoginPanelProps> = ({
  config = {},
  className = "",
}) => {
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light" | "auto" | "custom">("dark");

  // Handle theme detection and changes
  useEffect(() => {
    const theme = config.theme || "dark";
    setCurrentTheme(theme as "dark" | "light" | "auto" | "custom");
  }, [config.theme]);

  const {
    isAuthenticated,
    isLoading,
    error,
    authenticate,
  } = useAgilityAuth({
    redirectUri: config.redirectUri,
    scope: config.scope,
    region: config.region,
    autoCheckAuth: false, // Don't auto-check for login panel
  });

  const handleAuthenticate = async () => {
    try {
      await authenticate();
      if (config.onSignIn) {
        config.onSignIn(null as any); // User data will be fetched separately
      }
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  // Theme classes logic (simplified version)
  const getThemeClasses = () => {
    const baseClasses = {
      bg: "bg-white dark:bg-gray-900",
      text: "text-gray-900 dark:text-white",
      textSecondary: "text-gray-600 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-700",
      button: "bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg transition-colors font-medium w-full",
      error: "text-red-600 dark:text-red-400",
      panel: "bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8",
      buttonWrapper: "w-full",
    };

    if (currentTheme === "custom" && config.customClasses) {
      return { ...baseClasses, ...config.customClasses };
    }

    return baseClasses;
  };

  const themeClasses = getThemeClasses();

  // Don't render if already authenticated
  if (isAuthenticated) {
    return null;
  }
  return (
    <div className={`${themeClasses.panel} `}>
      <div
        className={`${themeClasses.bg} overflow-hidden ${config.backgroundClassName || ""}`}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <AgilityLogo logoUrl={config.logoUrl} />
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
        <div className="px-8 pb-8">
          {error && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm border ${themeClasses.error}`}
            >
              {error}
            </div>
          )}

          <div style={{ paddingTop: '3rem' }}>
            <AuthButton
              isAuthenticated={false}
              isLoading={isLoading}
              onAuthenticate={handleAuthenticate}
              onSignOut={() => {}} // Not used in unauthenticated state
              config={config}
              themeClasses={themeClasses}
              className=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};
