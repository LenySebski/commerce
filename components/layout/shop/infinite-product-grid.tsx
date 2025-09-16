"use client";

import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import LoadingDots from "components/loading-dots";
import { loadMoreProducts } from "lib/actions/products";
import { useInfiniteScroll } from "lib/hooks/use-infinite-scroll";
import { Product } from "lib/shopify/types";
import {
  filterProducts,
  parseFiltersFromSearchParams,
} from "lib/utils/filters";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface InfiniteProductGridProps {
  initialProducts: Product[];
  initialPageInfo: { hasNextPage: boolean; endCursor: string | null };
  searchParams: { [key: string]: string | string[] | undefined };
  sortKey?: string;
  reverse?: boolean;
  query?: string;
  collection?: string;
  allProducts?: Product[]; // For client-side pagination (collections)
}

export default function InfiniteProductGrid({
  initialProducts,
  initialPageInfo,
  searchParams,
  sortKey,
  reverse,
  query,
  collection,
  allProducts,
}: InfiniteProductGridProps) {
  const urlSearchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Parse filters from URL
  const activeFilters = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value) {
        params.set(key, value);
      }
    });
    return parseFiltersFromSearchParams(params);
  }, [searchParams]);

  // Apply filters to products
  const filteredProducts = useMemo(() => {
    const productsToFilter = allProducts || products;
    if (Object.keys(activeFilters).length === 0) {
      return productsToFilter;
    }
    return filterProducts(productsToFilter, activeFilters);
  }, [products, allProducts, activeFilters]);

  // For collections with client-side pagination
  const paginatedProducts = useMemo(() => {
    if (!allProducts) return filteredProducts;

    const pageSize = 12;
    const start = 0;
    const end = currentPage * pageSize;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage, allProducts]);

  // Reset when filters change
  useEffect(() => {
    if (allProducts) {
      // For collections, reset pagination
      setCurrentPage(1);
    } else {
      // For main shop, reset products to initial filtered set
      setProducts(initialProducts);
      setPageInfo(initialPageInfo);
    }
  }, [activeFilters, initialProducts, initialPageInfo, allProducts]);

  const fetchMore = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (allProducts) {
        // Client-side pagination for collections
        setCurrentPage((prev) => prev + 1);
      } else {
        // Server-side pagination for main shop
        const { products: newProducts, pageInfo: newPageInfo } =
          await loadMoreProducts({
            sortKey,
            reverse,
            query,
            first: 12,
            after: pageInfo.endCursor,
          });

        setProducts((prev) => [...prev, ...newProducts]);
        setPageInfo(newPageInfo);
      }
    } catch (error) {
      console.error("Error fetching more products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sortKey, reverse, query, pageInfo.endCursor, allProducts]);

  // Determine if there are more pages
  const hasNextPage = useMemo(() => {
    if (allProducts) {
      const pageSize = 12;
      return currentPage * pageSize < filteredProducts.length;
    }
    return pageInfo.hasNextPage;
  }, [allProducts, currentPage, filteredProducts.length, pageInfo.hasNextPage]);

  const { targetRef, isFetching } = useInfiniteScroll(
    fetchMore,
    hasNextPage,
    isLoading
  );

  const displayProducts = allProducts ? paginatedProducts : filteredProducts;
  const hasFilters = Object.keys(activeFilters).length > 0;

  return (
    <>
      {displayProducts.length > 0 ? (
        <>
          <p className="mb-4">
            Showing {displayProducts.length} of {filteredProducts.length}{" "}
            products
            {hasFilters && " with selected filters"}
          </p>

          <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <ProductGridItems products={displayProducts} />
          </Grid>

          {/* Loading indicator and infinite scroll trigger */}
          {hasNextPage && (
            <div ref={targetRef} className="flex justify-center py-8">
              {(isLoading || isFetching) && (
                <div className="flex flex-col items-center space-y-2">
                  <LoadingDots className="bg-black dark:bg-white" />
                  <p className="text-sm text-neutral-500">
                    Loading more products...
                  </p>
                </div>
              )}
            </div>
          )}

          {!hasNextPage && displayProducts.length > 12 && (
            <div className="flex justify-center py-8">
              <p className="text-sm text-neutral-500">
                You've reached the end of the products
              </p>
            </div>
          )}
        </>
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
