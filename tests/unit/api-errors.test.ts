import { describe, it, expect } from 'vitest';
import { formatApiError } from '@/lib/api-errors';
import axios from 'axios';

describe('formatApiError', () => {
  it('formats structured backend error envelope', () => {
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
    expect(result.message).toBe('Input validation failed');
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
});

