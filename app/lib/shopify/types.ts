// 统一 API 返回结构
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; details?: unknown };

// GraphQL 错误结构
export interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: string[];
  extensions?: Record<string, unknown>;
}

// 分页信息
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

// 带分页的边结构
export interface Connection<T> {
  edges: { node: T; cursor: string }[];
  pageInfo: PageInfo;
}
