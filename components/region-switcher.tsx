"use client";

import { Menu } from "@headlessui/react";
import { ChevronDownIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import {
  createLocale,
  getAvailableRegionsForLanguage,
  getLanguageFromLocale,
  getRegionFromLocale,
  regionNames,
  type Region,
} from "lib/utils/locale-utils";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export default function RegionSwitcher() {
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;

  const currentLanguage = getLanguageFromLocale(currentLocale);
  const currentRegion = getRegionFromLocale(currentLocale);
  const availableRegions = getAvailableRegionsForLanguage(currentLanguage);

  // Remove the locale from pathname to get the base path
  const pathWithoutLocale = pathname.startsWith(`/${currentLocale}`)
    ? pathname.slice(`/${currentLocale}`.length) || "/"
    : pathname;

  const handleRegionChange = (newRegion: Region) => {
    return createLocale(currentLanguage, newRegion);
  };

  if (availableRegions.length <= 1) {
    return null; // Don't show region switcher if only one region is available
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center gap-1 rounded-md p-2 text-sm font-medium text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white">
        <GlobeAltIcon className="h-4 w-4" />
        <span className="hidden sm:inline">
          {regionNames[currentRegion] || currentRegion.toUpperCase()}
        </span>
        <ChevronDownIcon className="h-3 w-3" />
      </Menu.Button>

      <Menu.Items className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-800 dark:ring-neutral-700">
        <div className="py-1">
          {availableRegions.map((region) => {
            const newLocale = handleRegionChange(region);
            return (
              <Menu.Item key={region}>
                {({ active }) => (
                  <Link
                    href={`/${newLocale}${pathWithoutLocale}`}
                    className={`${
                      active
                        ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-700 dark:text-white"
                        : "text-neutral-700 dark:text-neutral-300"
                    } ${
                      region === currentRegion
                        ? "bg-neutral-50 font-semibold dark:bg-neutral-750"
                        : ""
                    } block px-4 py-2 text-sm transition-colors`}
                  >
                    {regionNames[region] || region.toUpperCase()}
                  </Link>
                )}
              </Menu.Item>
            );
          })}
        </div>
      </Menu.Items>
    </Menu>
  );
}
