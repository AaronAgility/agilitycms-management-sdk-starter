import { useCallback, useMemo } from 'react';
import { WebsiteAccess, LocaleInfo } from '../../models/authComponent';
import { UseWebsiteSelectionReturn } from '../../models/authState';

/**
 * Custom hook for website and locale selection
 * Can be used independently or with the main auth hook
 */
export function useWebsiteSelection(
  websites: WebsiteAccess[],
  selectedWebsite: string,
  locales: LocaleInfo[],
  selectedLocale: string,
  isLoadingLocales: boolean,
  onWebsiteSelect: (websiteGuid: string) => Promise<void>,
  onLocaleSelect: (localeCode: string) => void
): UseWebsiteSelectionReturn {

  /**
   * Handle website selection with validation
   */
  const selectWebsite = useCallback(async (websiteGuid: string) => {
    // Validate website exists
    const websiteExists = websites.some(w => w.websiteGuid === websiteGuid);
    if (!websiteExists && websiteGuid !== '') {
      console.warn(`Website with GUID ${websiteGuid} not found in available websites`);
      return;
    }

    await onWebsiteSelect(websiteGuid);
  }, [websites, onWebsiteSelect]);

  /**
   * Handle locale selection with validation
   */
  const selectLocale = useCallback((localeCode: string) => {
    // Validate locale exists
    const localeExists = locales.some(l => l.localeCode === localeCode);
    if (!localeExists && localeCode !== '') {
      console.warn(`Locale with code ${localeCode} not found in available locales`);
      return;
    }

    onLocaleSelect(localeCode);
  }, [locales, onLocaleSelect]);

  /**
   * Get current selection details
   */
  const currentSelection = useMemo(() => {
    if (!selectedWebsite || !selectedLocale) return null;
    
    const website = websites.find(w => w.websiteGuid === selectedWebsite);
    const locale = locales.find(l => l.localeCode === selectedLocale);
    
    return website && locale ? {
      websiteName: website.websiteName,
      localeName: locale.localeName
    } : null;
  }, [websites, selectedWebsite, locales, selectedLocale]);

  return {
    websites,
    selectedWebsite,
    locales,
    selectedLocale,
    isLoadingLocales,
    selectWebsite,
    selectLocale,
    currentSelection,
  };
}

/**
 * Helper function to get website by GUID
 */
export function getWebsiteByGuid(websites: WebsiteAccess[], guid: string): WebsiteAccess | undefined {
  return websites.find(w => w.websiteGuid === guid);
}

/**
 * Helper function to get locale by code
 */
export function getLocaleByCode(locales: LocaleInfo[], code: string): LocaleInfo | undefined {
  return locales.find(l => l.localeCode === code);
}

/**
 * Helper function to get default locale
 */
export function getDefaultLocale(locales: LocaleInfo[]): LocaleInfo | undefined {
  return locales.find(l => l.isDefault) || locales[0];
}

/**
 * Helper function to get enabled locales only
 */
export function getEnabledLocales(locales: LocaleInfo[]): LocaleInfo[] {
  return locales.filter(l => l.isEnabled !== false);
}

/**
 * Helper function to sort websites by name
 */
export function sortWebsitesByName(websites: WebsiteAccess[]): WebsiteAccess[] {
  return [...websites].sort((a, b) => 
    a.websiteName.localeCompare(b.websiteName)
  );
}

/**
 * Helper function to sort locales by name
 */
export function sortLocalesByName(locales: LocaleInfo[]): LocaleInfo[] {
  return [...locales].sort((a, b) => 
    a.localeName.localeCompare(b.localeName)
  );
}

/**
 * Helper function to validate selection
 */
export function validateSelection(
  websites: WebsiteAccess[],
  selectedWebsite: string,
  locales: LocaleInfo[],
  selectedLocale: string
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!selectedWebsite) {
    errors.push('No website selected');
  } else if (!getWebsiteByGuid(websites, selectedWebsite)) {
    errors.push('Selected website not found');
  }

  if (!selectedLocale) {
    errors.push('No locale selected');
  } else if (!getLocaleByCode(locales, selectedLocale)) {
    errors.push('Selected locale not found');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
