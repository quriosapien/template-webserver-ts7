import { describe, expect, it } from 'vitest';
import { failure, success } from '@/helpers/response.helper';

describe('success', () => {
  it('wraps data in a success envelope', () => {
    expect(success({ id: 1 })).toEqual({ success: true, data: { id: 1 } });
  });
});

describe('failure', () => {
  it('omits details when none are given', () => {
    const result = failure('bad request');

    expect(result).toEqual({ success: false, error: { message: 'bad request' } });
    expect(result.error).not.toHaveProperty('details');
  });

  it('includes details when given', () => {
    const result = failure('bad request', { field: 'email' });

    expect(result.error.details).toEqual({ field: 'email' });
  });

  it('omits details when explicitly undefined', () => {
    const result = failure('bad request', undefined);

    expect(result.error).not.toHaveProperty('details');
  });
});
