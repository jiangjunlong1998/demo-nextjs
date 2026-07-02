
import { getProducts } from "@/app/lib/shopify/productHandle";
import ProductTable from './table'
export async function ProductTableWrapper({
  query,
  currentPage,
  store
}: {
  query: string;
  currentPage: number;
  store: string;
}) {
  const {productsRes, countRes} = await getProducts(store, {first: 20, sortKey: 'UPDATED_AT', reverse: true, query})
  const productsData = productsRes.success ? productsRes.data?.products?.edges.map((e: { node: object })=> e.node) : []
  const totalProducts = countRes.success ? countRes.data?.productsCount?.count : 0
  return <ProductTable query={query} store={store} currentPage={currentPage} products={productsData} />
}