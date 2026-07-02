export const UPDATE_DISCOUNT = `
    mutation DiscountAutomaticBasicUpdateAmount(
    $id: ID!
    $automaticBasicDiscount: DiscountAutomaticBasicInput!
    ) {
    discountAutomaticBasicUpdate(
        id: $id
        automaticBasicDiscount: $automaticBasicDiscount
    ) {
        automaticDiscountNode {
        id
        automaticDiscount {
            __typename
            ... on DiscountAutomaticBasic {
            title
            status
            customerGets {
                value {
                __typename
                ... on DiscountAmount {
                    amount {
                    amount
                    currencyCode
                    }
                }
                ... on DiscountPercentage {
                    percentage
                }
                }
            }
            }
        }
        }
        userErrors {
        field
        code
        message
        }
    }
    }
`