import { describe, expect, it } from 'vitest';
import { HttpStatus } from '@/constants';
import { AppError } from '@/utils/app-error.util';

describe('AppError', () => {
  it('defaults to a 500 status and operational error', () => {
    const err = new AppError('boom');

    expect(err.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(err.isOperational).toBe(true);
    expect(err.details).toBeUndefined();
    expect(err.message).toBe('boom');
  });

  it('honors an explicit status code', () => {
    const err = new AppError('nope', HttpStatus.BAD_REQUEST);

    expect(err.statusCode).toBe(HttpStatus.BAD_REQUEST);
  });

  it('honors an explicit isOperational and details', () => {
    const err = new AppError('crash', HttpStatus.INTERNAL_SERVER_ERROR, {
      isOperational: false,
      details: { cause: 'db' },
    });

    expect(err.isOperational).toBe(false);
    expect(err.details).toEqual({ cause: 'db' });
  });

  it('sets name to the constructing subclass name and is an instanceof Error and AppError', () => {
    const err = new AppError('boom');

    expect(err.name).toBe('AppError');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  describe('notFound', () => {
    it('defaults to a 404 with a default message', () => {
      const err = AppError.notFound();

      expect(err.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(err.message).toBe('Resource not found');
    });

    it('accepts a custom message', () => {
      const err = AppError.notFound('user not found');

      expect(err.message).toBe('user not found');
    });
  });

  describe('badRequest', () => {
    it('defaults to a 400 with a default message', () => {
      const err = AppError.badRequest();

      expect(err.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(err.message).toBe('Bad request');
    });

    it('accepts a custom message and details', () => {
      const err = AppError.badRequest('invalid email', { field: 'email' });

      expect(err.message).toBe('invalid email');
      expect(err.details).toEqual({ field: 'email' });
    });
  });
});
