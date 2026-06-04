import { tryCatch } from '../src';

describe('tryCatch tests', () => {
  describe('successful executions', () => {
    test('should return result on resolved promise', async () => {
      const { result, error } = await tryCatch(async () => 'resolved value');

      expect(result).toBe('resolved value');
      expect(error).toBeUndefined();
    });

    test('should return result for non-promise value', async () => {
      const { result, error } = await tryCatch(() => 42);

      expect(result).toBe(42);
      expect(error).toBeUndefined();
    });

    test.each([
      ['undefined', undefined],
      ['null', null],
      ['false', false],
      ['zero', 0],
      ['empty string', ''],
    ])('should return %s as a successful result', async (_label, value) => {
      const { result, error } = await tryCatch(() => value);

      expect(result).toBe(value);
      expect(error).toBeUndefined();
    });

    test('should preserve object result references', async () => {
      const value = { id: 'rule-1', enabled: true };
      const { result, error } = await tryCatch(() => value);

      expect(result).toBe(value);
      expect(error).toBeUndefined();
    });

    test('should return Error objects as successful results when they are returned', async () => {
      const value = new Error('returned error');
      const { result, error } = await tryCatch(() => value);

      expect(result).toBe(value);
      expect(error).toBeUndefined();
    });

    test('should wait for async work before returning the result', async () => {
      const calls: string[] = [];
      const { result, error } = await tryCatch(async () => {
        calls.push('started');
        await Promise.resolve();
        calls.push('finished');
        return calls.length;
      });

      expect(result).toBe(2);
      expect(error).toBeUndefined();
      expect(calls).toEqual(['started', 'finished']);
    });

    test('should call the input function exactly once', async () => {
      const input = jest.fn(() => 'value');
      const { result, error } = await tryCatch(input);

      expect(result).toBe('value');
      expect(error).toBeUndefined();
      expect(input).toHaveBeenCalledTimes(1);
    });
  });

  describe('failed executions', () => {
    test('should return error on rejected promise', async () => {
      const expectedError = new Error('rejected promise');
      const { result, error } = await tryCatch(() => Promise.reject(expectedError));

      expect(result).toBeUndefined();
      expect(error).toBe(expectedError);
    });

    test('should handle thrown error inside async function', async () => {
      const expectedError = new TypeError('async failure');
      const { result, error } = await tryCatch(async () => {
        throw expectedError;
      });

      expect(result).toBeUndefined();
      expect(error).toBe(expectedError);
    });

    test('should handle thrown error inside sync function', async () => {
      const expectedError = new RangeError('sync failure');
      const { result, error } = await tryCatch(() => {
        throw expectedError;
      });

      expect(result).toBeUndefined();
      expect(error).toBe(expectedError);
    });

    test('should preserve custom Error subclasses', async () => {
      const expectedError = new CustomError('custom failure');
      const { result, error } = await tryCatch(() => {
        throw expectedError;
      });

      expect(result).toBeUndefined();
      expect(error).toBeInstanceOf(CustomError);
      expect(error).toBe(expectedError);
    });

    test('should convert thrown string into Error instance', async () => {
      const { result, error } = await tryCatch(() => {
        throw 'string error';
      });

      expect(result).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('string error');
    });

    test('should convert rejected string into Error instance', async () => {
      const { result, error } = await tryCatch(() => Promise.reject('rejected string'));

      expect(result).toBeUndefined();
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('rejected string');
    });

    test.each([
      ['number', 500],
      ['boolean', false],
      ['object', { code: 'E_RULE' }],
      ['null', null],
      ['undefined', undefined],
    ])('should preserve non-string thrown %s values', async (_label, thrownValue) => {
      const { result, error } = await tryCatch(() => {
        throw thrownValue;
      });

      expect(result).toBeUndefined();
      expect(error).toBe(thrownValue);
    });

    test('should not call the input function more than once when it throws', async () => {
      const expectedError = new Error('one call');
      const input = jest.fn(() => {
        throw expectedError;
      });

      const { result, error } = await tryCatch(input);

      expect(result).toBeUndefined();
      expect(error).toBe(expectedError);
      expect(input).toHaveBeenCalledTimes(1);
    });
  });
});

class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CustomError';
  }
}
