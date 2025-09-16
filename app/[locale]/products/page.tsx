import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import { defaultSort, sorting } from "lib/constants";
import { getProducts } from "lib/shopify";
import {
  filterProducts,
  parseFiltersFromSearchParams,
} from "lib/utils/filters";

export const metadata = {
  title: "Products",
  description: "Browse all products in the store.",
};

export default async function ProductsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value) {
        params.set(key, value);
      }
    });
  }

  const { sort, q: searchValue } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  // Get all products first
  const allProducts = await getProducts({
    sortKey,
    reverse,
    query: searchValue,
  });

  // Parse active filters from search params
  const activeFilters = parseFiltersFromSearchParams(params);

  // Apply client-side filtering
  const filteredProducts = filterProducts(allProducts, activeFilters);

  const resultsText = filteredProducts.length > 1 ? "results" : "result";
  const hasFilters = Object.keys(activeFilters).length > 0;

  return (
    <>
      {searchValue ? (
        <p className="mb-4">
          {filteredProducts.length === 0
            ? "There are no products that match "
            : `Showing ${filteredProducts.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
          {hasFilters && " with selected filters"}
        </p>
      ) : (
        <p className="mb-4">
          Showing {filteredProducts.length} {resultsText}
          {hasFilters && " with selected filters"}
        </p>
      )}
      {filteredProducts.length > 0 ? (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={filteredProducts} />
        </Grid>
      ) : (
        <p className="py-3 text-lg">
          {hasFilters
            ? "No products found with the selected filters"
            : "No products found"}
        </p>
      )}
    </>
  );
}
