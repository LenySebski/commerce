"use server";

import { getProductsPaginated } from "lib/shopify";
import { Product } from "lib/shopify/types";

export async function loadMoreProducts({
  query,
  reverse,
  sortKey,
  first = 12,
  after,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
  first?: number;
  after?: string;
}): Promise<{
  products: Product[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}> {
  return await getProductsPaginated({
    query,
    reverse,
    sortKey,
    first,
    after,
  });
}
