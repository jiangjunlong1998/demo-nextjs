
import { UPDATE_DISCOUNT } from "@/app/lib/shopify/mutations/discount"
import { shopifyRequest } from "@/app/lib/shopify/request"

export async function PATCH(request: Request,
    { params }: { params: Promise<{ id: string, store: string }> }
) {
    const { id, store } = await params
    const decodedId = decodeURIComponent(id)
    const body = await request.json()

    const result = await shopifyRequest<{
        discountAutomaticBasicUpdate: {
            automaticDiscountNode: any
            userErrors: { field: string[]; message: string }[]
        }
    }>(store, {
        query: UPDATE_DISCOUNT,
        variables: {
            id: decodedId,
            automaticBasicDiscount: body.automaticBasicDiscount
        }
    })

    if (!result.success) {
        return Response.json({ error: result.error }, { status: 500 })
    }

    const { userErrors, automaticDiscountNode } = result.data.discountAutomaticBasicUpdate

    if (userErrors.length > 0) {
        return Response.json({ error: userErrors.map(e => e.message).join('; ') }, { status: 400 })
    }

    return Response.json(automaticDiscountNode)
}