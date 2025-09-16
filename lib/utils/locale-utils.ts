import { routing } from "i18n/routing";

export type Language = "en" | "fr";
export type Region = "gb" | "us" | "fr";

// Available languages
export const languages: Language[] = ["en", "fr"];

// Available regions
export const regions: Region[] = ["gb", "us", "fr"];

// Language display names
export const languageNames: Record<Language, string> = {
  en: "English",
  fr: "Français",
};

// Region display names
export const regionNames: Record<Region, string> = {
  gb: "United Kingdom",
  us: "United States",
  fr: "France",
};

/**
 * Extract language from locale (e.g., "en" from "en-gb")
 */
export function getLanguageFromLocale(locale: string): Language {
  const language = locale.split("-")[0] as Language;
  return languages.includes(language) ? language : "en";
}

/**
 * Extract region from locale (e.g., "gb" from "en-gb")
 */
export function getRegionFromLocale(locale: string): Region {
  const region = locale.split("-")[1] as Region;
  return regions.includes(region) ? region : "gb";
}

/**
 * Combine language and region into a locale
 */
export function createLocale(language: Language, region: Region): string {
  const locale = `${language}-${region}`;
  // Ensure the locale is supported in routing
  return routing.locales.includes(locale as any)
    ? locale
    : routing.defaultLocale;
}

/**
 * Get available regions for a specific language
 */
export function getAvailableRegionsForLanguage(language: Language): Region[] {
  return regions.filter((region) => {
    const locale = `${language}-${region}`;
    return routing.locales.includes(locale as any);
  });
}

/**
 * Get available languages for a specific region
 */
export function getAvailableLanguagesForRegion(region: Region): Language[] {
  return languages.filter((language) => {
    const locale = `${language}-${region}`;
    return routing.locales.includes(locale as any);
  });
}

/**
 * Check if a language-region combination is valid
 */
export function isValidLocale(language: Language, region: Region): boolean {
  const locale = `${language}-${region}`;
  return routing.locales.includes(locale as any);
}
