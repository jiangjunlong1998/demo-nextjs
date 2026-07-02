import { GET_PRODUCT } from "@/app/lib/shopify/queries/products";
import { EDIT_PRICE, SET_METAFIELDS, DELETE_METAFIELDS } from "@/app/lib/shopify/mutations/products";
import { shopifyRequest } from "@/app/lib/shopify/request";

export async function GET(_request: Request,
    { params }: { params: Promise<{ id: string, store: string}>}
) {
    const { id, store } = await params
    const decodedId = decodeURIComponent(id)
    const gid = decodedId.startsWith("gid://") ? decodedId : `gid://shopify/Product/${decodedId}`
    
    const result = await shopifyRequest(store, {
        query: GET_PRODUCT,
        variables: { id: gid }
    })

    if (!result.success) {
        return Response.json({ error: result.error }, { status: 500 })
    }

    return Response.json(result.data)
}

export async function PATCH(request: Request,
    { params }: { params: Promise<{ id: string, store: string}>}
) {
    const { store } = await params
    const body = await request.json()

    const requests: Promise<any>[] = []
    const requestTypes: string[] = []  // 用来标记每个 request 对应的类型，方便后面解析结果

    // 1. 价格更新（每次都需要）
    requests.push(
        shopifyRequest<{
            productVariantsBulkUpdate: {
                productVariants: { id: string; price: string; compareAtPrice: string }[]
                userErrors: { field: string[]; message: string }[]
            }
        }>(store, {
            query: EDIT_PRICE,
            variables: {
                productId: body.productId,
                variants: body.variants.map((v: any) => ({
                    id: v.id,
                    price: v.price,
                    compareAtPrice: v.compareAtPrice
                }))
            }
        })
    )
    requestTypes.push('price')

    // 2. 区分需要"设置值"和"清空值"的变体
    const toSet = body.variants.filter((v: any) => v.couponOff != null && v.couponOff !== "")
    const toDelete = body.variants.filter((v: any) => 
        v.couponOff === "" || v.couponOff == null
    )

    if (toSet.length > 0) {
        requests.push(
            shopifyRequest<{
                metafieldsSet: {
                    metafields: { id: string; value: string }[]
                    userErrors: { field: string[]; message: string }[]
                }
            }>(store, {
                query: SET_METAFIELDS,
                variables: {
                    metafields: toSet.map((v: any) => ({
                        ownerId: v.id,
                        namespace: "custom",
                        key: "cupon_off",
                        type: "single_line_text_field",
                        value: v.couponOff
                    }))
                }
            })
        )
        requestTypes.push('metafieldSet')
    }

    if (toDelete.length > 0) {
        requests.push(
            shopifyRequest<{
                metafieldsDelete: {
                    deletedMetafields: { key: string; namespace: string; ownerId: string }[]
                    userErrors: { field: string[]; message: string }[]
                }
            }>(store, {
                query: DELETE_METAFIELDS,
                variables: {
                    metafields: toDelete.map((v: any) => ({
                        ownerId: v.id,        // 变体 gid
                        namespace: "custom",
                        key: "cupon_off"
                    }))
                }
            })
        )
        requestTypes.push('metafieldDelete')
    }

    const results = await Promise.all(requests)

    const errors: string[] = []
    let updatedVariants: any[] = []
    let updatedMetafields: any[] = []
    let deletedMetafieldIds: string[] = []

    results.forEach((result, index) => {
        const type = requestTypes[index]

        if (!result.success) {
            errors.push(result.error)
            return
        }

        if (type === 'price') {
            const userErrors = result.data.productVariantsBulkUpdate.userErrors
            if (userErrors.length > 0) {
                errors.push(...userErrors.map((e: any) => e.message))
            } else {
                updatedVariants = result.data.productVariantsBulkUpdate.productVariants
            }
        }

        if (type === 'metafieldSet') {
            const userErrors = result.data.metafieldsSet.userErrors
            if (userErrors.length > 0) {
                errors.push(...userErrors.map((e: any) => e.message))
            } else {
                updatedMetafields = result.data.metafieldsSet.metafields
            }
        }

        if (type === 'metafieldDelete') {
            const userErrors = result.data.metafieldsDelete.userErrors
            if (userErrors.length > 0) {
                errors.push(...userErrors.map((e: any) => e.message))
            } else {
                deletedMetafieldIds.push(
                    ...result.data.metafieldsDelete.deletedMetafields
                        .filter((m: any) => m !== null)   // 过滤掉 null
                        .map((m: any) => m.ownerId)
                )
            }
        }
    })

    if (errors.length > 0) {
        return Response.json({ error: errors.join('; ') }, { status: 400 })
    }

    return Response.json({
        variants: updatedVariants,
        metafields: updatedMetafields,
        deletedMetafieldIds
    })
}