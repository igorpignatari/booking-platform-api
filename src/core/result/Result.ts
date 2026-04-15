export class Result<T> {
  private constructor(
    private readonly _isOk: boolean,
    private readonly _value?: T,
    private readonly _error?: unknown,
  ) {}

  // ── Factories ────────────────────────────────────────────────────────────────

  static ok<T = void>(value?: T): Result<T> {
    return new Result<T>(true, value);
  }

  static err<T = never>(error: unknown): Result<T> {
    return new Result<T>(false, undefined, error);
  }

  // ── Getters ──────────────────────────────────────────────────────────────────

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

  get error(): unknown {
    if (this.isOk) {
      throw new Error("Cannot get error from a successful result");
    }
    return this._error;
  }

  // ── Combinators ──────────────────────────────────────────────────────────────

  static combine(results: Result<unknown>[]): Result<void> {
    const errors: unknown[] = [];

    for (const result of results) {
      if (result.isErr) {
        errors.push(result._error);
      }
    }

    if (errors.length > 0) {
      return Result.err(errors);
    }

    return Result.ok(undefined);
  }

  // ── Transformations ──────────────────────────────────────────────────────────

  map<U>(fn: (value: T) => U): Result<U> {
    if (this.isErr) return Result.err(this._error);
    return Result.ok(fn(this._value as T));
  }

  flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    if (this.isErr) return Result.err(this._error);
    return fn(this._value as T);
  }

  mapError(fn: (error: unknown) => unknown): Result<T> {
    if (this.isOk) return this;
    return Result.err(fn(this._error));
  }

  fold<U>(onSuccess: (value: T) => U, onFailure: (error: unknown) => U): U {
    return this.isOk ? onSuccess(this._value as T) : onFailure(this._error);
  }

  // ── Pipe ─────────────────────────────────────────────────────────────────────
  // Permite encadear transformações de forma fluente e type-safe.
  // Cada função recebe o Result atual e retorna um novo Result.
  //
  // Exemplo:
  //   Result.ok(1)
  //     .pipe(
  //       r => r.map(x => x + 1),
  //       r => r.map(x => x * 2),
  //     )
  //   // Result.ok(4)

  pipe<A>(fn1: (result: Result<T>) => Result<A>): Result<A>;
  pipe<A, B>(
    fn1: (result: Result<T>) => Result<A>,
    fn2: (result: Result<A>) => Result<B>,
  ): Result<B>;
  pipe<A, B, C>(
    fn1: (result: Result<T>) => Result<A>,
    fn2: (result: Result<A>) => Result<B>,
    fn3: (result: Result<B>) => Result<C>,
  ): Result<C>;
  pipe<A, B, C, D>(
    fn1: (result: Result<T>) => Result<A>,
    fn2: (result: Result<A>) => Result<B>,
    fn3: (result: Result<B>) => Result<C>,
    fn4: (result: Result<C>) => Result<D>,
  ): Result<D>;
  pipe<A, B, C, D, E>(
    fn1: (result: Result<T>) => Result<A>,
    fn2: (result: Result<A>) => Result<B>,
    fn3: (result: Result<B>) => Result<C>,
    fn4: (result: Result<C>) => Result<D>,
    fn5: (result: Result<D>) => Result<E>,
  ): Result<E>;
  pipe(...fns: Array<(result: Result<unknown>) => Result<unknown>>): Result<unknown> {
    return fns.reduce((acc: Result<unknown>, fn) => fn(acc), this as Result<unknown>);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  getOrElse(defaultValue: T): T {
    return this.isOk ? (this._value as T) : defaultValue;
  }

  getOrThrow(): T {
    if (this.isErr) {
      throw this._error;
    }
    return this._value as T;
  }

  // ── Async ────────────────────────────────────────────────────────────────────

  async asyncMap<U>(fn: (value: T) => Promise<U>): Promise<Result<U>> {
    if (this.isErr) return Result.err(this._error);
    return Result.ok(await fn(this._value as T));
  }

  async asyncFlatMap<U>(fn: (value: T) => Promise<Result<U>>): Promise<Result<U>> {
    if (this.isErr) return Result.err(this._error);
    return fn(this._value as T);
  }
}
