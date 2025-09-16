import { getRequestConfig } from "next-intl/server";

// Can be imported from a shared config
export const locales = [
  "en-gb",
  "en-us",
  "en-fr",
  "fr-fr",
  "fr-gb",
  "fr-us",
] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as any)) {
    locale = "en-gb";
  }

  // Extract language from locale (e.g., "en" from "en-gb", "fr" from "fr-fr")
  const language = locale.split("-")[0];

  return {
    locale,
    messages: (await import(`../messages/${language}.json`)).default,
  };
});
