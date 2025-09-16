import InfiniteProductGrid from "components/layout/shop/infinite-product-grid";
import { defaultSort, sorting } from "lib/constants";
import { getProductsPaginated } from "lib/shopify";

export const metadata = {
  title: "Shop",
  description: "Browse all products in our shop with infinite scroll.",
};

export default async function ShopPage(props: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { locale } = params;
  console.log("locale", locale);
  const { sort, q: searchValue } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  // Get initial products (first page)
  const { products: initialProducts, pageInfo } = await getProductsPaginated({
    sortKey,
    reverse,
    query: searchValue,
    first: 12,
  });

  return (
    <>
      {searchValue ? (
        <p className="mb-4">
          {initialProducts.length === 0
            ? "There are no products that match "
            : `Search results for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : (
        <p className="mb-4">Browse all products</p>
      )}

      <InfiniteProductGrid
        initialProducts={initialProducts}
        initialPageInfo={pageInfo}
        searchParams={searchParams || {}}
        sortKey={sortKey}
        reverse={reverse}
        query={searchValue}
      />
    </>
  );
}
