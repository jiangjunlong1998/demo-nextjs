import { getShopifyClient } from './client';
import { ApiResult, GraphQLError } from './types';

interface RequestOptions<V extends object> {
  query: string;
  variables?: V;
}

export async function shopifyRequest<TData, V extends object = Record<string, unknown>>(
  shopId: string,
  options: RequestOptions<V>
): Promise<ApiResult<TData>> {
  const { query, variables } = options;

  try {
    const client = getShopifyClient(shopId);
    const { data, errors } = await client.request<TData>(query, { variables });

    if (errors) {
      const messages = errors.graphQLErrors
        ?.map((e: GraphQLError) => e.message)
        .join('; ');
      return {
        success: false,
        error: messages ?? 'GraphQL error',
        details: errors,
      };
    }

    if (!data) {
      return { success: false, error: 'No data returned' };
    }

    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message, details: err };
  }
}
