import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/api';

export interface FormattedApiError {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string>;
  status?: number;
}

export function formatApiError(error: unknown): FormattedApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    const status = axiosError.response?.status;
    const responseData = axiosError.response?.data;

    if (responseData?.error) {
      const fieldErrors: Record<string, string> = {};

      if (Array.isArray(responseData.error.details)) {
        for (const item of responseData.error.details) {
          if (item.field && item.message) {
            fieldErrors[item.field] = item.message;
          }
        }
      }

      return {
        message: responseData.error.message || 'An unexpected error occurred',
        code: responseData.error.code,
        fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
        status,
      };
    }

    if (status === 404) {
      return { message: 'The requested resource was not found', status };
    }
    if (status === 403) {
      return { message: 'You do not have permission to perform this action', status };
    }
    if (status === 401) {
      return { message: 'Authentication required. Please sign in again.', status };
    }
    if (status && status >= 500) {
      return { message: 'Server error. Please try again later.', status };
    }

    if (axiosError.code === 'ECONNABORTED') {
      return { message: 'Request timed out. Please check your connection.' };
    }
    if (!axiosError.response) {
      return { message: 'Network error. Unable to reach server.' };
    }

    return {
      message: axiosError.message || 'An error occurred during request',
      status,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'An unknown error occurred' };
}

