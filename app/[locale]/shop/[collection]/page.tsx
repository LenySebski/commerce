import type { Metadata } from "next";
import { notFound } from "next/navigation";

import InfiniteProductGrid from "components/layout/shop/infinite-product-grid";
import { defaultSort, sorting } from "lib/constants";
import { getCollection, getCollectionProducts } from "lib/shopify";

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

export default async function ShopCollectionPage(props: {
  params: Promise<{ collection: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { sort } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  // Get all products from the collection first (for client-side filtering)
  const allProducts = await getCollectionProducts({
    collection: params.collection,
    sortKey,
    reverse,
  });

  // For infinite scroll, we'll implement client-side pagination
  const pageSize = 12;
  const initialProducts = allProducts.slice(0, pageSize);
  const hasNextPage = allProducts.length > pageSize;

  // Create mock pageInfo for compatibility with infinite scroll component
  const pageInfo = {
    hasNextPage,
    endCursor: hasNextPage ? `cursor-${pageSize}` : null,
  };

  return (
    <section>
      {allProducts.length === 0 ? (
        <p className="py-3 text-lg">No products found in this collection</p>
      ) : (
        <InfiniteProductGrid
          initialProducts={initialProducts}
          initialPageInfo={pageInfo}
          searchParams={searchParams || {}}
          sortKey={sortKey}
          reverse={reverse}
          collection={params.collection}
          allProducts={allProducts} // Pass all products for client-side pagination
        />
      )}
    </section>
  );
}
