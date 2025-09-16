import { Product, ProductOption } from "lib/shopify/types";

export type FilterOption = {
  name: string;
  value: string;
  count: number;
};

export type VariantFilter = {
  name: string;
  options: FilterOption[];
};

export function extractVariantFilters(products: Product[]): VariantFilter[] {
  const filterMap = new Map<string, Map<string, number>>();

  // Extract all variant options from products
  products.forEach((product) => {
    product.options?.forEach((option: ProductOption) => {
      const optionName = option.name.toLowerCase();

      if (!filterMap.has(optionName)) {
        filterMap.set(optionName, new Map());
      }

      const valueMap = filterMap.get(optionName)!;

      option.values.forEach((value) => {
        const normalizedValue = value.toLowerCase();
        valueMap.set(normalizedValue, (valueMap.get(normalizedValue) || 0) + 1);
      });
    });
  });

  // Convert to VariantFilter array
  const filters: VariantFilter[] = [];

  filterMap.forEach((valueMap, optionName) => {
    const options: FilterOption[] = [];

    valueMap.forEach((count, value) => {
      options.push({
        name: value.charAt(0).toUpperCase() + value.slice(1), // Capitalize first letter
        value: value,
        count,
      });
    });

    // Sort options by name
    options.sort((a, b) => a.name.localeCompare(b.name));

    filters.push({
      name: optionName.charAt(0).toUpperCase() + optionName.slice(1), // Capitalize first letter
      options,
    });
  });

  // Sort filters by name, but prioritize common ones
  const priorityOrder = ["color", "size", "material", "style"];
  filters.sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a.name.toLowerCase());
    const bIndex = priorityOrder.indexOf(b.name.toLowerCase());

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    } else if (aIndex !== -1) {
      return -1;
    } else if (bIndex !== -1) {
      return 1;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  return filters;
}

export function buildFilterQuery(filters: Record<string, string[]>): string {
  const queryParts: string[] = [];

  Object.entries(filters).forEach(([optionName, values]) => {
    if (values.length > 0) {
      values.forEach((value) => {
        queryParts.push(`variantOption:${optionName}='${value}'`);
      });
    }
  });

  return queryParts.join(" AND ");
}

export function parseFiltersFromSearchParams(
  searchParams: URLSearchParams
): Record<string, string[]> {
  const filters: Record<string, string[]> = {};

  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith("filter_")) {
      const optionName = key.replace("filter_", "");
      if (!filters[optionName]) {
        filters[optionName] = [];
      }
      filters[optionName].push(value);
    }
  }

  return filters;
}

export function createFilterUrl(
  pathname: string,
  searchParams: URLSearchParams,
  optionName: string,
  value: string,
  checked: boolean
): string {
  const newParams = new URLSearchParams(searchParams);
  const filterKey = `filter_${optionName}`;

  if (checked) {
    newParams.append(filterKey, value);
  } else {
    const values = newParams.getAll(filterKey);
    newParams.delete(filterKey);
    values
      .filter((v) => v !== value)
      .forEach((v) => newParams.append(filterKey, v));
  }

  return `${pathname}?${newParams.toString()}`;
}

export function filterProducts(
  products: Product[],
  activeFilters: Record<string, string[]>
): Product[] {
  if (Object.keys(activeFilters).length === 0) {
    return products;
  }

  return products.filter((product) => {
    return Object.entries(activeFilters).every(([optionName, filterValues]) => {
      if (filterValues.length === 0) return true;

      // Find the matching option in the product
      const productOption = product.options?.find(
        (option) => option.name.toLowerCase() === optionName.toLowerCase()
      );

      if (!productOption) return false;

      // Check if any of the filter values match the product's option values
      return filterValues.some((filterValue) =>
        productOption.values.some(
          (value) => value.toLowerCase() === filterValue.toLowerCase()
        )
      );
    });
  });
}
