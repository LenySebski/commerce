"use client";

import { FilterOption, VariantFilter } from "lib/utils/filters";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface VariantFiltersProps {
  filters: VariantFilter[];
}

export default function VariantFilters({ filters }: VariantFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openFilters, setOpenFilters] = useState<Set<string>>(new Set());

  const toggleFilter = (filterName: string) => {
    const newOpenFilters = new Set(openFilters);
    if (newOpenFilters.has(filterName)) {
      newOpenFilters.delete(filterName);
    } else {
      newOpenFilters.add(filterName);
    }
    setOpenFilters(newOpenFilters);
  };

  const handleFilterChange = (
    optionName: string,
    value: string,
    checked: boolean
  ) => {
    const newParams = new URLSearchParams(searchParams);
    const filterKey = `filter_${optionName.toLowerCase()}`;

    if (checked) {
      newParams.append(filterKey, value);
    } else {
      const values = newParams.getAll(filterKey);
      newParams.delete(filterKey);
      values
        .filter((v) => v !== value)
        .forEach((v) => newParams.append(filterKey, v));
    }

    const queryString = newParams.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(newUrl);
  };

  const getActiveFilters = (optionName: string): string[] => {
    const filterKey = `filter_${optionName.toLowerCase()}`;
    return searchParams.getAll(filterKey);
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    // Remove all filter parameters
    Array.from(newParams.keys()).forEach((key) => {
      if (key.startsWith("filter_")) {
        newParams.delete(key);
      }
    });

    const queryString = newParams.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(newUrl);
  };

  const hasActiveFilters = Array.from(searchParams.keys()).some((key) =>
    key.startsWith("filter_")
  );

  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-3">
        {filters.map((filter) => {
          const activeValues = getActiveFilters(filter.name);
          const isOpen = openFilters.has(filter.name);

          return (
            <div
              key={filter.name}
              className="border-b border-neutral-200 pb-3 dark:border-neutral-700"
            >
              <button
                onClick={() => toggleFilter(filter.name)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {filter.name}
                  {activeValues.length > 0 && (
                    <span className="ml-2 rounded-full bg-neutral-900 px-2 py-1 text-xs text-white dark:bg-neutral-100 dark:text-black">
                      {activeValues.length}
                    </span>
                  )}
                </span>
                <svg
                  className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isOpen && (
                <div className="mt-3 space-y-2">
                  {filter.options.map((option: FilterOption) => {
                    const isChecked = activeValues.includes(option.value);
                    const filterId = `filter-${filter.name}-${option.value}`;

                    return (
                      <label
                        key={option.value}
                        htmlFor={filterId}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <input
                          id={filterId}
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            handleFilterChange(
                              filter.name,
                              option.value,
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:focus:ring-neutral-400"
                        />
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {option.name}
                          <span className="ml-1 text-neutral-500 dark:text-neutral-400">
                            ({option.count})
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
