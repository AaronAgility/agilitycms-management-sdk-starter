import React from "react";
import { AgilityAuthConfig } from "../../models/authConfig";

export interface AuthButtonProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  onAuthenticate: () => void;
  onSignOut: () => void;
  config: AgilityAuthConfig;
  themeClasses: any;
  className?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  isAuthenticated,
  isLoading,
  onAuthenticate,
  onSignOut,
  config,
  themeClasses,
  className = " mx-auto",
}) => {
  const handleClick = isAuthenticated ? onSignOut : onAuthenticate;
  
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${themeClasses.button} ${config.buttonClassName || ""} ${className}`}
    >
      {isLoading
        ? config.loadingText || (isAuthenticated ? "Signing out..." : "Authenticating...")
        : isAuthenticated
        ? config.signOutText || "Sign Out"
        : config.buttonText || "Authenticate with Agility"}
    </button>
  );
};
