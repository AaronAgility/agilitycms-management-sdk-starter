import React from "react";

export interface AgilityLogoProps {
  logoUrl?: string;
  className?: string;
}

// Default Agility logo SVG
const DefaultAgilityLogo = () => (
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

export const AgilityLogo: React.FC<AgilityLogoProps> = ({ 
  logoUrl, 
  className 
}) => {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Logo"
        className={className || "w-8 h-8 flex-shrink-0"}
        style={{ width: "32px", height: "32px" }}
      />
    );
  }
  return <DefaultAgilityLogo />;
};
