// app/lib/shopify.ts
// 这是一个纯服务端运行的工具文件

import { createAdminApiClient } from '@shopify/admin-api-client'
// 定义 Shopify 配置的类型
export interface ShopCredentials {
  shopId: string;
  domain: string;
  token: string;
}

export const STORE_SITES = [
  {label: 'UREVO.US', value: 'urevo-5183'},
  {label: 'UREVO.CA', value: 'urevoca'},
  {label: 'UREVO.EU', value: 'urevoeu'},
  {label: 'UREVO.DE', value: 'eechp7-w0'},
  {label: 'UREVO.UK', value: 'wfy1jr-x3'}
]

export function getCredentials(shopId: string): ShopCredentials | null {
  // 建立一个映射表 (Map)
  // 根据前端传来的 value，去 process.env 里拿对应的密钥
  const configs: Record<string, ShopCredentials> = {
    'urevo-5183': {
      shopId: 'urevo-5183',
      domain: 'urevo-5183.myshopify.com', // 替换成真实的后台域名
      token: process.env.SHOPIFY_TOKEN_UREVO_5183 || '',
    },
    'urevoca': {
      shopId: 'urevoca',
      domain: 'urevoca.myshopify.com',
      token: process.env.SHOPIFY_TOKEN_UREVOCA || '',
    },
    'urevoeu': {
      shopId: 'urevoeu',
      domain: 'urevoeu.myshopify.com',
      token: process.env.SHOPIFY_TOKEN_UREVOEU || '',
    },
    'eechp7-w0': {
      shopId: 'eechp7-w0',
      domain: 'eechp7-w0.myshopify.com',
      token: process.env.SHOPIFY_TOKEN_EECHP7_W0 || '',
    },
    'wfy1jr-x3': {
      shopId: 'wfy1jr-x3',
      domain: 'wfy1jr-x3.myshopify.com',
      token: process.env.SHOPIFY_TOKEN_WFY1JR_X3 || '',
    }
  };

  const config = configs[shopId];

  // 加上安全校验，防止有人在 URL 里乱输 shopId
  if (!config || !config.token) {
    console.error(`无法找到站点 ${shopId} 的配置或密钥缺失`);
    return null;
  }

  return config;
}

const clientCache = new Map<string, ReturnType<typeof createAdminApiClient>>()
export function getShopifyClient(shopId: string) {
  const credentials = getCredentials(shopId)
  if (!credentials || !credentials.token) {
    throw new Error(`无法初始化 Shopify Client: 找不到站点 ${shopId} 的有效配置或密钥。`);
  }
  if(!clientCache.has(shopId)) {
    const { domain, token } = credentials
    clientCache.set(
      shopId,
      createAdminApiClient({
        storeDomain: domain,
        apiVersion: '2026-04',
        accessToken: token
      })
    )
  }
  return clientCache.get(shopId)!;
}

export type ShopifyClientResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; locations?: unknown; path?: unknown }>;
  extensions?: unknown;
};
