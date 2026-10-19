import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatDateTime, formatRelativeTime, formatCurrency } from '@/lib/utils';

describe('Utility functions', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      const result = cn('px-2 py-1', 'bg-red-500', { 'text-white': true, 'text-black': false });
      expect(result).toBe('px-2 py-1 bg-red-500 text-white');
    });

    it('handles tailwind conflict resolution', () => {
      const result = cn('px-2 px-4', 'text-red-500 text-blue-500');
      expect(result).toBe('px-4 text-blue-500');
    });
  });

  describe('formatDate', () => {
    it('formats ISO date strings', () => {
      const result = formatDate('2026-10-15T12:00:00Z');
      expect(result).toContain('2026');
    });

    it('returns placeholder for null or undefined', () => {
      expect(formatDate(null)).toBe('—');
      expect(formatDate(undefined)).toBe('—');
    });

    it('returns placeholder for invalid date string', () => {
      expect(formatDate('invalid-date')).toBe('—');
    });
  });

  describe('formatDateTime', () => {
    it('formats date and time', () => {
      const result = formatDateTime('2026-10-15T12:00:00Z');
      expect(result).toContain('2026');
    });

    it('returns placeholder for invalid inputs', () => {
      expect(formatDateTime(null)).toBe('—');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns relative time string', () => {
      const now = new Date();
      const result = formatRelativeTime(now);
      expect(result).toBe('less than a minute ago');
    });

    it('returns placeholder for invalid inputs', () => {
      expect(formatRelativeTime(null)).toBe('—');
    });
  });

  describe('formatCurrency', () => {
    it('formats numbers with default currency (BDT)', () => {
      const result = formatCurrency(1250.5);
      expect(result).toContain('1,250.50');
    });

    it('formats string numbers', () => {
      const result = formatCurrency('500');
      expect(result).toContain('500.00');
    });

    it('returns placeholder for null or NaN', () => {
      expect(formatCurrency(null)).toBe('—');
      expect(formatCurrency('not-a-number')).toBe('—');
    });
  });
});

