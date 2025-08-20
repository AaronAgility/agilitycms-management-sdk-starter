import React from "react";
import { AgilityAuthConfig } from "../../models/authConfig";
import { AuthButton } from "../ui/AuthButton";

export interface ButtonOnlyModeProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  onAuthenticate: () => void;
  onSignOut: () => void;
  config: AgilityAuthConfig;
  themeClasses: any;
}

export const ButtonOnlyMode: React.FC<ButtonOnlyModeProps> = ({
  isAuthenticated,
  isLoading,
  onAuthenticate,
  onSignOut,
  config,
  themeClasses,
}) => {
  return (
    <div className="inline-block">
      <AuthButton
        isAuthenticated={isAuthenticated}
        isLoading={isLoading}
        onAuthenticate={onAuthenticate}
        onSignOut={onSignOut}
        config={config}
        themeClasses={themeClasses}
        className="px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200"
      />
    </div>
  );
};
