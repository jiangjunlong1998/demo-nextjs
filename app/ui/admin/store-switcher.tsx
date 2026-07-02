'use client'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { STORE_SITES } from "@/app/lib/shopify/client"
export default function StoreSwitcher({currentStore}: {currentStore: string}) {

    const pathname = usePathname()
    const router = useRouter()
    const siteChangeHandle = (value: string) => {
        // 字符串替换魔法：把旧商店的 ID 替换成新商店的 ID
        // 这样如果你在“产品页”切换商店，你依然会停留在新商店的“产品页”！
        const newPath = pathname.replace(`/${currentStore}`, `/${value}`);
        router.push(newPath);
    }
    return (
        <Select defaultValue={currentStore} onValueChange={siteChangeHandle}>
            <SelectTrigger className='bg-white'>
                <SelectValue placeholder="choose site"/>
            </SelectTrigger>
            <SelectContent position='popper'>
                <SelectGroup>
                    {STORE_SITES.map((item:any)=>(
                        <SelectItem value={item.value} key={item.value}>{item.label}</SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}