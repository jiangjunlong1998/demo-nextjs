'use client'

import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function ProductDiscounts({store, id}: {store: string, id: string}) {
    const [discounts, setDiscounts] = useState<any[]>([])
    // 用 map 存每个 discount 的编辑值，key 是 discount id
    const [editValues, setEditValues] = useState<Record<string, string>>({})
    // 用 map 存每个 discount 的 saving 状态
    const [savingMap, setSavingMap] = useState<Record<string, boolean>>({})

    useEffect(()=>{
        fetch(`/api/${store}/discounts`).then(res => res.json())
        .then(data => {
            const discountList = data.discountNodes.edges.map((e: any) => e.node)
            const matched = discountList.filter((e: any) => {
                const items = e.discount.customerGets.items
                const inProducts = items.products.nodes.some((p: any) => p.id === id)
                const inVariants = items.productVariants.nodes.some((p: any) => p.product.id === id)
                return inProducts || inVariants
            })
            setDiscounts(matched)

            // 初始化每个 discount 的编辑值
            const initialValues: Record<string, string> = {}
            matched.forEach((e: any) => {
                const val = e.discount.customerGets.value
                initialValues[e.id] = val.amount?.amount ?? String((val.percentage ?? 0) * 100)
            })
            setEditValues(initialValues)
        })
    }, [id])

    const handleChange = (discountId: string, value: string) => {
        setEditValues(prev => ({ ...prev, [discountId]: value }))
    }

    const handleSave = async (e: any) => {
        const discountId = e.id
        const val = e.discount.customerGets.value
        const isAmount = !!val.amount

        setSavingMap(prev => ({ ...prev, [discountId]: true }))

        const value = isAmount
            ? { discountAmount: { amount: editValues[discountId] } }
            : { percentage: parseFloat(editValues[discountId]) / 100 }

        const res = await fetch(`/api/${store}/discounts/${encodeURIComponent(discountId)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                automaticBasicDiscount: {
                    customerGets: { value }
                }
            })
        })

        setSavingMap(prev => ({ ...prev, [discountId]: false }))

        if (!res.ok) {
            const data = await res.json()
            toast.error(data.error)
            return
        }
        // 更新本地 discount 数据
        const data = await res.json()
        setDiscounts(prev => prev.map(d => d.id === discountId ? { ...d, ...data } : d))
        toast.success('更新成功')
    }

    return(
        <>
        <FieldSet className="w-full !mt-8">
            <FieldLegend className="text-sm font-bold">折扣</FieldLegend>
            <FieldDescription>
                status:active discount_type:percentage,fixed_amount method:automatic
            </FieldDescription>
            <FieldGroup>
                {discounts.map((e: any) => {
                    const val = e.discount.customerGets.value
                    const isAmount = !!val.amount
                    const isSaving = savingMap[e.id] ?? false

                    return (
                        <div className="border rounded-xl px-2 py-2" key={e.id}>
                            <FieldLegend className="text-sm font-bold">{e.discount.title}</FieldLegend>
                            <div className="flex gap-0 justify-center items-center">
                                <div className="whitespace-nowrap text-sm text-gray-600">
                                    {isAmount ? <span>固定金额</span> : <span>百分比</span>}
                                </div>
                                <Field className="flex-1 ml-3">
                                    <Input
                                        type="text"
                                        value={editValues[e.id] ?? ""}
                                        onChange={ev => handleChange(e.id, ev.target.value)}
                                    />
                                </Field>
                                <div className="ml-2 text-xs">
                                    <Button className="h-7 px-2 text-xs" onClick={() => handleSave(e)} disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                        {isSaving ? "更新中..." : "更新"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </FieldGroup>
        </FieldSet>
        </>
    )
}