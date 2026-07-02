export const PRODUCT_SUMMARY_FRAGMENT = `
  fragment ProductSummaryFields on Product {
    id
    title
    handle
    onlineStoreUrl
    status
    vendor
    productType
    totalInventory
    featuredImage { url altText width height }
    priceRangeV2 {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    createdAt
  }
`;
export const METAFIELDS_FRAGMENT = `
fragment MetafieldBasic on Metafield {
  id
  namespace
  key
  value
  type
}
`;
export const GET_PRODUCTS = `
  ${PRODUCT_SUMMARY_FRAGMENT}
  query GetProducts($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys,$reverse: Boolean) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey,reverse: $reverse) {
      edges {
        node { ...ProductSummaryFields }
        cursor
      }
      pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
    }
  }
`;

export const GET_PRODUCT = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      onlineStoreUrl
      status
      description
      descriptionHtml
      vendor
      productType
      tags
      totalInventory
      featuredImage { url altText width height }
      images(first: 10) {
        edges { node { url altText width height } }
      }
      priceRangeV2 {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            sku
            price
            compareAtPrice
            inventoryQuantity
            selectedOptions { name value }
            image { url altText }
            cupon_off: metafield(namespace: "custom", key: "cupon_off") {
              ...MetafieldBasic
            }
          }
        }
      }
      cupon_off: metafield(namespace: "custom", key: "cupon_off") {
        ...MetafieldBasic
      }
      createdAt
      updatedAt
    }
  }
  fragment MetafieldBasic on Metafield {
    id
    namespace
    key
    value
    type
  }
`;

export const GET_PRODUCTS_COUNT = `
  query GetProductsCount($query: String) {
    productsCount(query: $query) {
      count
    }
  }
`;
