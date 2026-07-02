// app/api/[store]/products/[id]/metafield/route.ts

import { SET_METAFIELDS, DELETE_METAFIELDS } from "@/app/lib/shopify/mutations/products";
import { shopifyRequest } from "@/app/lib/shopify/request";

export async function PATCH(request: Request,
    { params }: { params: Promise<{ id: string, store: string}>}
) {
    const { id, store } = await params
    const decodedId = decodeURIComponent(id)
    const gid = decodedId.startsWith("gid://") ? decodedId : `gid://shopify/Product/${decodedId}`
    const body = await request.json()
    // body: { namespace: string, key: string, type: string, value: string }

    if (body.value != null && body.value !== "") {
        const result = await shopifyRequest<{
            metafieldsSet: {
                metafields: { id: string; key: string; value: string }[]
                userErrors: { field: string[]; message: string }[]
            }
        }>(store, {
            query: SET_METAFIELDS,
            variables: {
                metafields: [{
                    ownerId: gid,
                    namespace: body.namespace,
                    key: body.key,
                    type: body.type,
                    value: body.value
                }]
            }
        })

        if (!result.success) {
            return Response.json({ error: result.error }, { status: 500 })
        }

        const { userErrors, metafields } = result.data.metafieldsSet
        if (userErrors.length > 0) {
            return Response.json({ error: userErrors.map(e => e.message).join('; ') }, { status: 400 })
        }

        return Response.json({ metafield: metafields[0] })
    } else {
        const result = await shopifyRequest<{
            metafieldsDelete: {
                deletedMetafields: ({ ownerId: string } | null)[]
                userErrors: { field: string[]; message: string }[]
            }
        }>(store, {
            query: DELETE_METAFIELDS,
            variables: {
                metafields: [{
                    ownerId: gid,
                    namespace: body.namespace,
                    key: body.key
                }]
            }
        })

        if (!result.success) {
            return Response.json({ error: result.error }, { status: 500 })
        }

        const { userErrors } = result.data.metafieldsDelete
        if (userErrors.length > 0) {
            return Response.json({ error: userErrors.map(e => e.message).join('; ') }, { status: 400 })
        }

        return Response.json({ deleted: true })
    }
}