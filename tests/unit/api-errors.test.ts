import { describe, it, expect, vi } from 'vitest';
import { formatApiError, showErrorToast } from '@/lib/api-errors';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

describe('formatApiError', () => {
  it('formats structured backend error envelope with exact message and cause', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Input validation failed',
            details: [
              { field: 'email', message: 'Invalid email address' },
              { field: 'password', message: 'Password is too short' },
            ],
          },
        },
      },
    };

    const result = formatApiError(error);
    expect(result.title).toBe('Input validation failed');
    expect(result.cause).toBe('email: Invalid email address; password: Password is too short');
    expect(result.message).toBe(
      'Input validation failed: email: Invalid email address; password: Password is too short'
    );
    expect(result.code).toBe('VALIDATION_ERROR');
    expect(result.fieldErrors).toEqual({
      email: 'Invalid email address',
      password: 'Password is too short',
    });
    expect(result.status).toBe(422);
  });

  it('handles 401 unauthorized status without details', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 401,
        data: {},
      },
    };

    const result = formatApiError(error);
    expect(result.message).toContain('Authentication required');
    expect(result.status).toBe(401);
  });

  it('handles 403 forbidden status without details', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 403,
        data: {},
      },
    };

    const result = formatApiError(error);
    expect(result.message).toContain('permission');
    expect(result.status).toBe(403);
  });

  it('handles 404 not found status', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 404,
        data: {},
      },
    };

    const result = formatApiError(error);
    expect(result.message).toContain('not found');
    expect(result.status).toBe(404);
  });

  it('handles 500 server errors', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 500,
        data: {},
      },
    };

    const result = formatApiError(error);
    expect(result.message).toContain('Server error');
    expect(result.status).toBe(500);
  });

  it('handles timeout errors', () => {
    const error = {
      isAxiosError: true,
      code: 'ECONNABORTED',
    };

    const result = formatApiError(error);
    expect(result.message).toContain('timed out');
  });

  it('handles standard Error instances', () => {
    const error = new Error('Client side error message');
    const result = formatApiError(error);
    expect(result.message).toBe('Client side error message');
  });

  it('handles unknown error types', () => {
    const result = formatApiError('some string error');
    expect(result.message).toBe('An unknown error occurred');
  });

  it('extracts exact error message and cause when calling showErrorToast', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: [{ field: 'image', message: 'Required' }],
          },
        },
      },
    };

    showErrorToast(error);
    expect(toast.error).toHaveBeenCalledWith('Validation failed', {
      description: 'image: Required',
      duration: 6000,
    });
  });
});
