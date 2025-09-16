import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import { defaultSort, sorting } from "lib/constants";
import { getCollection, getCollectionProducts } from "lib/shopify";
import {
  filterProducts,
  parseFiltersFromSearchParams,
} from "lib/utils/filters";

export async function generateMetadata(props: {
  params: Promise<{ collection: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const collection = await getCollection(params.collection);

  if (!collection) return notFound();

  return {
    title: collection.seo?.title || collection.title,
    description:
      collection.seo?.description ||
      collection.description ||
      `${collection.title} products`,
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const urlParams = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => urlParams.append(key, v));
      } else if (value) {
        urlParams.set(key, value);
      }
    });
  }

  const { sort } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  // Get all products from the collection first
  const allProducts = await getCollectionProducts({
    collection: params.collection,
    sortKey,
    reverse,
  });

  // Parse active filters from search params
  const activeFilters = parseFiltersFromSearchParams(urlParams);

  // Apply client-side filtering
  const filteredProducts = filterProducts(allProducts, activeFilters);

  const resultsText = filteredProducts.length > 1 ? "results" : "result";
  const hasFilters = Object.keys(activeFilters).length > 0;

  return (
    <section>
      {filteredProducts.length === 0 ? (
        <p className="py-3 text-lg">
          {hasFilters
            ? "No products found with the selected filters"
            : "No products found in this collection"}
        </p>
      ) : (
        <>
          <p className="mb-4">
            Showing {filteredProducts.length} {resultsText}
            {hasFilters && " with selected filters"}
          </p>
          <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <ProductGridItems products={filteredProducts} />
          </Grid>
        </>
      )}
    </section>
  );
}
