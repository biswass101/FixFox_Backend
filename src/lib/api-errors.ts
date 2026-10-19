import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { ApiResponse } from '@/types/api';

export interface FormattedApiError {
  message: string;
  title: string;
  cause?: string;
  code?: string;
  fieldErrors?: Record<string, string>;
  status?: number;
}

export function extractCauseAndFieldErrors(details: unknown): {
  cause?: string;
  fieldErrors?: Record<string, string>;
} {
  if (!details) return {};

  const causes: string[] = [];
  const fieldErrors: Record<string, string> = {};

  if (typeof details === 'string' && details.trim().length > 0) {
    return { cause: details.trim() };
  }

  if (Array.isArray(details)) {
    for (const item of details) {
      if (!item) continue;
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed) causes.push(trimmed);
      } else if (typeof item === 'object') {
        const anyItem = item as Record<string, unknown>;
        const field = anyItem.field as string | undefined;
        const msg = (anyItem.message || anyItem.msg || anyItem.error) as string | undefined;

        if (field && msg) {
          fieldErrors[field] = msg;
          causes.push(`${field}: ${msg}`);
        } else if (msg) {
          causes.push(msg);
        } else if (field) {
          causes.push(`Invalid ${field}`);
        } else {
          try {
            causes.push(JSON.stringify(item));
          } catch {
            // ignore
          }
        }
      }
    }
  } else if (typeof details === 'object') {
    for (const [key, val] of Object.entries(details as Record<string, unknown>)) {
      if (!val) continue;
      if (typeof val === 'string') {
        fieldErrors[key] = val;
        causes.push(`${key}: ${val}`);
      } else if (Array.isArray(val)) {
        const msgs = val.filter((v): v is string => typeof v === 'string').join(', ');
        if (msgs) {
          fieldErrors[key] = msgs;
          causes.push(`${key}: ${msgs}`);
        }
      }
    }
  }

  const cause = causes.length > 0 ? causes.join('; ') : undefined;
  return {
    cause,
    fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
  };
}

export function formatApiError(error: unknown): FormattedApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown> | Record<string, unknown> | string>;
    const status = axiosError.response?.status;
    const responseData = axiosError.response?.data;

    let title: string | undefined;
    let code: string | undefined;
    let cause: string | undefined;
    let fieldErrors: Record<string, string> | undefined;

    if (responseData && typeof responseData === 'object') {
      const dataObj = responseData as Record<string, unknown>;

      // Check standard FixFlow envelope: { success: false, error: { message, code, details } }
      if (dataObj.error && typeof dataObj.error === 'object') {
        const errorObj = dataObj.error as Record<string, unknown>;
        title = typeof errorObj.message === 'string' ? errorObj.message : undefined;
        code = typeof errorObj.code === 'string' ? errorObj.code : undefined;
        const extracted = extractCauseAndFieldErrors(errorObj.details || dataObj.details);
        cause = extracted.cause;
        fieldErrors = extracted.fieldErrors;
      } else if (typeof dataObj.error === 'string') {
        title = dataObj.error;
      }

      if (!title) {
        if (typeof dataObj.message === 'string') {
          title = dataObj.message;
        } else if (Array.isArray(dataObj.message)) {
          title = dataObj.message.join('; ');
        } else if (typeof dataObj.detail === 'string') {
          title = dataObj.detail;
        }
      }

      if (!cause && (dataObj.details || dataObj.errors)) {
        const extracted = extractCauseAndFieldErrors(dataObj.details || dataObj.errors);
        cause = extracted.cause;
        if (!fieldErrors) fieldErrors = extracted.fieldErrors;
      }
    } else if (typeof responseData === 'string' && responseData.trim().length > 0) {
      const trimmed = responseData.trim();
      // If it's not a full HTML document, use the raw response string (e.g. "Cannot POST /api/v1/work-orders/xxx/cancel")
      if (!trimmed.startsWith('<!DOCTYPE') && !trimmed.startsWith('<html')) {
        title = trimmed;
      }
    }

    // Status code-specific fallbacks if title was not extracted from response data
    if (!title) {
      if (status === 400) {
        title = 'Bad request: Invalid parameters supplied';
      } else if (status === 401) {
        title = 'Authentication required: Your session may have expired. Please sign in again';
      } else if (status === 403) {
        title = 'Permission denied: You do not have permission to perform this action';
      } else if (status === 404) {
        title = axiosError.config?.url
          ? `Resource not found at ${axiosError.config.url}`
          : 'The requested resource was not found';
      } else if (status === 409) {
        title = 'Conflict: The resource already exists or has been modified';
      } else if (status === 422) {
        title = 'Validation failed: The submitted data does not meet the requirements';
      } else if (status === 429) {
        title = 'Rate limit exceeded: Too many requests. Please wait a moment and try again';
      } else if (status && status >= 500) {
        title = `Server error (${status}${axiosError.response?.statusText ? `: ${axiosError.response.statusText}` : ''}). Please try again later.`;
      }
    }

    // Network / timeout errors (when no response was received)
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        title = 'Request timed out';
        cause = 'The server took too long to respond. Please check your internet connection.';
      } else {
        title = 'Network error';
        cause = axiosError.message || 'Unable to reach the server. Please check your connection.';
      }
    }

    const finalTitle = title || axiosError.message || 'An error occurred during request';

    // Construct full message containing cause if available
    let fullMessage = finalTitle;
    if (cause && cause !== finalTitle) {
      if (finalTitle.toLowerCase().includes(cause.toLowerCase())) {
        fullMessage = finalTitle;
      } else {
        fullMessage = `${finalTitle}: ${cause}`;
      }
    }

    return {
      message: fullMessage,
      title: finalTitle,
      cause,
      code,
      fieldErrors,
      status,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      title: error.name && error.name !== 'Error' ? `${error.name}: ${error.message}` : error.message,
      cause: error.message,
    };
  }

  return {
    message: 'An unknown error occurred',
    title: 'An unknown error occurred',
  };
}

export function showErrorToast(
  error: unknown,
  fallbackTitle?: string,
  options?: { duration?: number }
): void {
  const formatted = formatApiError(error);

  const displayTitle = fallbackTitle
    ? `${fallbackTitle}: ${formatted.title}`
    : formatted.title;

  if (formatted.cause && formatted.cause !== formatted.title) {
    toast.error(displayTitle, {
      description: formatted.cause,
      duration: options?.duration || 6000,
    });
  } else {
    toast.error(displayTitle, {
      duration: options?.duration || 6000,
    });
  }
}
