// app/api/[store]/discounts/route.ts

import { GET_DISCOUNTS } from "@/app/lib/shopify/queries/discounts"
import { shopifyRequest } from "@/app/lib/shopify/request"

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ store: string }> }
) {
    const { store } = await params

    const result = await shopifyRequest<{
        discountNodes: {
            edges: {
                node: {
                    id: string
                    discount: {
                        __typename: string
                        title?: string
                        status?: string
                        summary?: string
                        startsAt?: string
                        endsAt?: string
                        customerGets?: {
                            value: {
                                __typename: string
                                amount?: { amount: string; currencyCode: string }
                                percentage?: number
                            }
                        }
                    }
                }
            }[]
        }
    }>(store, {
        query: GET_DISCOUNTS
    })

    if (!result.success) {
        return Response.json({ error: result.error }, { status: 500 })
    }

    return Response.json(result.data)
}

