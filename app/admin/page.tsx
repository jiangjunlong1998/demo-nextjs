import { redirect } from "next/navigation"
import { STORE_SITES } from "../lib/shopify/client"
export default async function Page() {
    const defaultStore = STORE_SITES[0]?.value; 
  
    // 动态拼装重定向路径！
    redirect(`/admin/${defaultStore}`);
}