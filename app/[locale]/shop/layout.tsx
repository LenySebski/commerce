import Footer from "components/layout/footer";
import FilterList from "components/layout/search/filter";
// import ShopCollections from "components/layout/shop/collections";
import ShopVariantFilters from "components/layout/shop/variant-filters";
import { sorting } from "lib/constants";
import { getProducts } from "lib/shopify";
import { extractVariantFilters } from "lib/utils/filters";
import { Suspense } from "react";

async function VariantFiltersWrapper() {
  const products = await getProducts({});
  const variantFilters = extractVariantFilters(products);
  console.log("variantFilters", variantFilters);

  return <ShopVariantFilters filters={variantFilters} />;
}

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-8 px-4 pb-4 text-black md:flex-row dark:text-white">
        <div className="order-first w-full flex-none md:max-w-[200px]">
          <div className="space-y-6">
            {/* <ShopCollections /> */}
            <Suspense
              fallback={
                <div className="animate-pulse bg-neutral-200 h-20 rounded dark:bg-neutral-700" />
              }
            >
              <VariantFiltersWrapper />
            </Suspense>
          </div>
        </div>
        <div className="order-last min-h-screen w-full md:order-none">
          <Suspense fallback={null}>{children}</Suspense>
        </div>
        <div className="order-none flex-none md:order-last md:w-[125px]">
          <FilterList list={sorting} title="Sort by" />
        </div>
      </div>
      <Footer />
    </>
  );
}
