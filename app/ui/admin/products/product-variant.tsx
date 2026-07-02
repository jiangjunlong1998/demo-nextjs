import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import ProductDiscounts from "./product-discount"

type Variant = {
  id: string
  title: string
  price: string
  inventory: number
  trackInventory: boolean
}
type Cupon_off = {
    id: string
    namespace: string
    key: string
    value: string
    type?: string
}
type Product = {
 cupon_off: Cupon_off
  variants: {
    edges: { node: { id: string; price: string; compareAtPrice: string; inventoryQuantity: number; title: string; cupon_off: Cupon_off | null } }[]
  }
}

export function ProductVariantForm({ id, store }: { id: string, store: string }) {
  const encodeId = encodeURIComponent(id)
  const [originProduct,setOriginProduct] = useState<Product | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    fetch(`/api/${store}/products/${encodeId}`).then(res => res.json())
      .then(data => {
        setProduct(data.product)
        setOriginProduct(data.product)
      })
  }, [])

  const updateProduct = (field: string, value: string) => {
    setProduct((prev: any) => {
        if (!prev) return prev
        
        const current = prev[field]
        
        // 是 metafield 对象（不为 null，且有 value 属性）
        if (current !== null && typeof current === 'object' && 'value' in current) {
            return {
                ...prev,
                [field]: { ...current, value }
            }
        }
        
        // 是 null（之前没有这个 metafield），创建一个新的 metafield 结构
        if (current === null) {
            return {
                ...prev,
                [field]: { value }  // 只有 value，其他字段等保存成功后从接口返回
            }
        }
        
        // 普通字段直接更新
        return {
            ...prev,
            [field]: value
        }
    })
  }
  
  const updateVariant = (id: string, field: string, value: string | number) => {
    setProduct(prev => {
        if (!prev) return prev
        return {
        ...prev,
        variants: {
            edges: prev.variants.edges.map(edge =>
            edge.node.id === id
                ? { ...edge, node: { ...edge.node, [field]: value } }
                : edge
            )
        }
        }
    })
  }

  const updateVariantMetafield = (id: string, key: string, value: string) => {
    setProduct(prev => {
        if (!prev) return prev
        return {
        ...prev,
        variants: {
            edges: prev.variants.edges.map(edge =>
            edge.node.id === id
                ? { 
                    ...edge, 
                    node: { 
                    ...edge.node, 
                    [key]: { ...(edge.node as any)[key], value } 
                    } 
                }
                : edge
            )
        }
        }
    })
  }

// 客户端 handleSave

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    const variants = product?.variants.edges.map(item => {
        const originalEdge = originProduct?.variants.edges.find(e => e.node.id === item.node.id)
        const hadValue = originalEdge?.node.cupon_off?.value
        const nowEmpty = !item.node.cupon_off?.value

        return {
            id: item.node.id,
            price: item.node.price,
            compareAtPrice: item.node.compareAtPrice,
            couponOff: item.node.cupon_off?.value ?? "",
            needsDelete: hadValue && nowEmpty  // 只有"之前有，现在没了"才真正需要删除
        }
    })
    const res = await fetch(`/api/${store}/products/${encodeURIComponent(encodeId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            productId: id,
            variants 
        })
    })
    
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
        setError(data.error)
        toast.error(data.error)
        setProduct(originProduct)
        return
    }

    setOriginProduct(prev => {
        if (!prev) return prev
        return {
            ...prev,
            variants: {
                edges: prev.variants.edges.map(edge => {
                    const updatedVariant = data.variants.find((v: any) => v.id === edge.node.id)
                    const updatedMetafield = data.metafields.find((m: any) => 
                        edge.node.id === m.ownerId  // 注意 metafieldsSet 返回里也要确认有没有 ownerId
                    )
                    const isDeleted = data.deletedMetafieldIds.includes(edge.node.id)

                    return {
                        ...edge,
                        node: {
                            ...edge.node,
                            ...(updatedVariant ?? {}),
                            cupon_off: isDeleted ? null : (updatedMetafield ?? edge.node.cupon_off)
                        }
                    }
                })
            }
        }
    })
    
    toast.success('保存成功')
  }

  const handleSaveMetafield = async (key: string) => {
    setLoading(true)
    const res = await fetch(`/api/${store}/products/${encodeURIComponent(encodeId)}/metafields`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            namespace: "custom",
            key,
            type: "single_line_text_field",
            value: product?.cupon_off?.value ?? ""
        })
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
        toast.error(data.error)
        return
    }

    // 更新 originProduct 的产品级别 cupon_off
    setOriginProduct((prev: any) => {
        if (!prev) return prev
        return {
            ...prev,
            cupon_off: data.deleted ? null : { ...prev.cupon_off, value: product?.cupon_off?.value ?? "" }
        }
    })

    toast.success('保存成功')
  }

  return (
    <div className="space-y-4 ">
      <Table className="rounded-md border ">
        <TableHeader>
          <TableRow>
            <TableHead>变体</TableHead>
            <TableHead>售价</TableHead>
            <TableHead>原价</TableHead>
            <TableHead>库存</TableHead>
            {product?.variants.edges.some((v) => v.node.cupon_off != undefined) && <TableHead>Off(变体元字段)</TableHead>}
            {/* <TableHead>追踪库存</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {product?.variants.edges && product.variants.edges.map(variant => (
            <TableRow key={variant.node.id}>
              <TableCell className="font-medium">{variant.node.title}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {/* <span className="text-muted-foreground">$</span> */}
                  <Input
                    type="number"
                    value={variant.node.price}
                    onChange={e => updateVariant(variant.node.id, "price", e.target.value)}
                    className="w-28"
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {/* <span className="text-muted-foreground">$</span> */}
                  <Input
                    type="number"
                    value={variant.node.compareAtPrice || ''}
                    onChange={e => updateVariant(variant.node.id, "compareAtPrice", e.target.value)}
                    className="w-28"
                  />
                </div>
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  disabled
                  value={variant.node.inventoryQuantity}
                //   onChange={e => updateVariant(variant.node.id, "inventory", parseInt(e.target.value) || 0)}
                  className="w-24"
                />
              </TableCell>
              {product?.variants.edges.some((v) => v.node.cupon_off != null) && (
                <TableCell>
                    <div className="flex items-center gap-1">
                    {/* <span className="text-muted-foreground">$</span> */}
                    <Input
                        type="number"
                        value={variant.node.cupon_off?.value ?? ""}
                        onChange={e => updateVariantMetafield(variant.node.id, "cupon_off", e.target.value)}
                        className="w-28"
                    />
                    </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setProduct(originProduct)}>取消</Button>
        <Button onClick={handleSave}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            {saving ? "保存中..." : "保存"}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}

      <div>
        <h2 className="font-bold text-sm mb-3">产品元字段</h2>
        <div className="flex items-center gap-3">
            <span className="">off</span>
            <Input
            type="number"
            value={product?.cupon_off?.value ?? ''}
            onChange={e => updateProduct("cupon_off", e.target.value)}
            className="w-1/2"
            />
            <Button onClick={() => handleSaveMetafield("cupon_off")}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {loading ? "更新中..." : "更新"}
            </Button>
        </div>
      </div>
      <ProductDiscounts store={store} id={id}/>
    </div>
  )
}