import { getCredentials } from "@/app/lib/shopify/client";
import { Suspense } from "react";
import { ProductsTableSkeleton } from "@/app/ui/skeletons";
import { ProductTableWrapper } from "@/app/ui/admin/products/table-wrapper";
import { lusitana } from '@/app/ui/fonts';
// import { useSearchParams } from "next/navigation";
import Search from "@/app/ui/search";

export default async function Page({params, searchParams}: {params: Promise<{store: string}>, searchParams?: Promise<{query: string, page: string}>}) {
  const { store } = await params
  const shopConfig = getCredentials(store)
  if(!shopConfig) {
    return <div>找不到该站点的配置信息</div>
  }
  const search = await searchParams
  const query = search?.query || ''
  const currentPage = Number(search?.page) || 1
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Products</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8 mb-4">
        <Search placeholder="Search product..." />
      </div>
        <div className="w-full overflow-y-auto flex-1 min-h-0">
            <Suspense fallback={<ProductsTableSkeleton />}>
                <ProductTableWrapper query={query} store={store} currentPage={currentPage} />
            </Suspense>
        </div>        
    </div>

  );
}