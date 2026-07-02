// import { getShopifyClient } from "./client";
import { GET_PRODUCT, GET_PRODUCTS, GET_PRODUCTS_COUNT } from "./queries/products";
import { shopifyRequest } from "./request";
import { Connection } from "./types";

export interface GetProductsVariables {
    first?: number | 20;
    after?: string | undefined;
    query?: string | undefined;
    sortKey?: string;
    reverse?: boolean;
}
export interface Product {
  id: string;
  title: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'UNLIST';
  handle: string;
  totalInventory: number;
  priceRangeV2: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
}
export interface GetProductsData {
    products: Connection<Product>,

}
// export async function getProducts(shopId: string, params?: GetProductsVariables) {
//     const { first = 20, after = undefined, query = undefined } = params || {};

//     try {
//         const client = getShopifyClient(shopId)

//     } catch (error) {
        
//     }
// }
// 获取产品列表
export async function getProducts(shopId: string, variables?: GetProductsVariables) {
    const [productsRes, countRes] = await Promise.all([
        shopifyRequest<GetProductsData, GetProductsVariables>(shopId, {query: GET_PRODUCTS, variables}),
        shopifyRequest<{ productsCount: { count: number } }>(shopId, { query: GET_PRODUCTS_COUNT })
    ])
    return { productsRes, countRes}
}

// 获取单个产品
export async function getProductById(shopId: string, id: string) {
    return shopifyRequest(shopId, {
        query: GET_PRODUCT,
        variables: { id }
    })
}