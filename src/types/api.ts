export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    [key: string]: unknown;
  };
  error?: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    pagination: PaginationMeta;
  };
}

