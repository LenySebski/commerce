import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en-gb", "en-us", "en-fr", "fr-fr", "fr-gb", "fr-us"],

  // Used when no locale matches
  defaultLocale: "en-gb",

  // The `pathnames` object holds pairs of internal and
  // external paths. Based on the locale, the external
  // paths are rewritten to the shared, internal ones.
  pathnames: {
    // If all locales use the same pathname, a single
    // external path can be provided for all locales
    "/": "/",
    "/search": "/search",
    "/products": "/products",
    "/shop": "/shop",
    "/product/[handle]": {
      "en-gb": "/product/[handle]",
      "en-us": "/product/[handle]",
      "en-fr": "/product/[handle]",
      "fr-fr": "/produit/[handle]",
      "fr-gb": "/produit/[handle]",
      "fr-us": "/produit/[handle]",
    },
  },
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
