import productFragment from "../fragments/product";

export const getProductQuery = /* GraphQL */ `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...product
    }
  }
  ${productFragment}
`;

export const getProductsQuery = /* GraphQL */ `
  query getProducts(
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
  ) {
    products(sortKey: $sortKey, reverse: $reverse, query: $query, first: 100) {
      edges {
        node {
          ...product
        }
      }
    }
  }
  ${productFragment}
`;

export const getProductsPaginatedQuery = /* GraphQL */ `
  query getProductsPaginated(
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
    $first: Int
    $after: String
  ) {
    products(
      sortKey: $sortKey
      reverse: $reverse
      query: $query
      first: $first
      after: $after
    ) {
      edges {
        node {
          ...product
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${productFragment}
`;

export const getProductRecommendationsQuery = /* GraphQL */ `
  query getProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...product
    }
  }
  ${productFragment}
`;
