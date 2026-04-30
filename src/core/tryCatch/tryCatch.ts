import type { BaseError } from "@core/errors/BaseError";
import { Result } from "@core/result/Result";

/**
 * Executes a synchronous function that may throw and converts the outcome
 * into a Result. Any thrown value is mapped to a domain error via `onError`.
 *
 * Use this at infrastructure boundaries (parsers, sync adapters) where
 * third-party code communicates failure via exceptions.
 *
 * @example
 *   const result = tryCatch(
 *     () => JSON.parse(rawInput),
 *     (err) => new InvalidJSONError(err)
 *   );
 */
export function tryCatch<T, E extends BaseError>(
  fn: () => T,
  onError: (error: unknown) => E,
): Result<T, E> {
  try {
    return Result.ok(fn());
  } catch (error) {
    return Result.err(onError(error));
  }
}

/**
 * Async counterpart of `tryCatch`. Awaits the promise returned by `fn`
 * and converts thrown errors (or rejected promises) into a Result.
 *
 * Use this at infrastructure boundaries: database calls, HTTP clients,
 * crypto adapters, JWT libraries — anywhere a third-party library
 * communicates failure via exceptions or rejected promises.
 *
 * @example
 *   const result = await tryCatchAsync(
 *     () => pg.query("SELECT * FROM users WHERE id = $1", [id]),
 *     (err) => new DatabaseError(err)
 *   );
 */
export async function tryCatchAsync<T, E extends BaseError>(
  fn: () => Promise<T>,
  onError: (error: unknown) => E,
): Promise<Result<T, E>> {
  try {
    const value = await fn();
    return Result.ok(value);
  } catch (error) {
    return Result.err(onError(error));
  }
}
