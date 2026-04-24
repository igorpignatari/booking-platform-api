import type { BaseError } from "@core/errors/BaseError";

export class Result<T, E = BaseError> {
  private constructor(
    private readonly _isOk: boolean,
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  // ---------- Factories ----------

  static ok<T = void, E = BaseError>(value?: T): Result<T, E> {
    return new Result<T, E>(true, value as T, undefined);
  }

  static err<T = never, E = BaseError>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  /**
   * Combines multiple Results into a single Result.
   * - If all are Ok, returns Ok with an array of values.
   * - If any is Err, returns Err with an array of all errors.
   *
   * Typically used to aggregate validation errors of the same category.
   */
  static combine<T, E = BaseError>(results: Result<T, E>[]): Result<T[], E[]> {
    const errors: E[] = [];
    const values: T[] = [];

    for (const result of results) {
      if (result.isErr) {
        errors.push(result.error);
      } else {
        values.push(result.value);
      }
    }

    if (errors.length > 0) {
      return Result.err<T[], E[]>(errors);
    }

    return Result.ok<T[], E[]>(values);
  }

  // ---------- Getters ----------

  get isOk(): boolean {
    return this._isOk;
  }

  get isErr(): boolean {
    return !this._isOk;
  }

  get value(): T {
    if (this.isErr) {
      throw new Error("Cannot get value from a failed result");
    }
    return this._value as T;
  }

  get error(): E {
    if (this.isOk) {
      throw new Error("Cannot get error from a successful result");
    }
    return this._error as E;
  }

  // ---------- Combinators ----------

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isErr) {
      return Result.err<U, E>(this._error as E);
    }
    return Result.ok<U, E>(fn(this._value as T));
  }

  mapError<F>(fn: (error: E) => F): Result<T, F> {
    if (this.isOk) {
      return Result.ok<T, F>(this._value as T);
    }
    return Result.err<T, F>(fn(this._error as E));
  }

  flatMap<U, E2 = E>(fn: (value: T) => Result<U, E2>): Result<U, E | E2> {
    if (this.isErr) {
      return Result.err<U, E | E2>(this._error as E);
    }
    return fn(this._value as T);
  }

  fold<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    return this.isOk ? onSuccess(this._value as T) : onFailure(this._error as E);
  }

  // ---------- Escape hatches ----------

  getOrElse(fallback: T): T {
    return this.isOk ? (this._value as T) : fallback;
  }

  getOrThrow(): T {
    if (this.isErr) {
      throw this._error;
    }
    return this._value as T;
  }
}
