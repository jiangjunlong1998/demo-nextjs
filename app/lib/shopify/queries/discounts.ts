export const GET_DISCOUNTS = `
query AutomaticActiveAmountOffDiscounts {
  discountNodes(first: 250, query: "status:active discount_type:percentage,fixed_amount method:automatic") {
    edges {
      node {
        id
        discount {
          __typename
          ... on DiscountAutomaticBasic {
            title
            status
            summary
            startsAt
            endsAt
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
              items {
                __typename
                ... on AllDiscountItems {
                  allItems
                }
                ... on DiscountProducts {
                  products(first: 50) {
                    nodes {
                      id
                      title
                    }
                  }
                  productVariants(first: 50) {
                    nodes {
                      id
                      title
                      product {
                        id
                        title
                      }
                    }
                  }
                }
                ... on DiscountCollections {
                  collections(first: 50) {
                    nodes {
                      id
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
`

export const DEBUG_QUERY_DISCOUNTS = `
query DebugAllDiscountNodes {
  discountNodes(first: 20) {
    edges {
      node {
        id
        discount {
          __typename
          ... on DiscountAutomaticBasic {
            title
            status
          }
          ... on DiscountAutomaticBxgy {
            title
            status
          }
          ... on DiscountCodeBasic {
            title
            status
          }
          ... on DiscountCodeBxgy {
            title
            status
          }
          ... on DiscountCodeFreeShipping {
            title
            status
          }
        }
      }
    }
  }
}
`