import type { BaseError } from "@core/errors/BaseError";

export type ParsedErrorMessage = {
  _tag: string;
  message: string;
};

/**
 * Assumes all errors share the same _tag.
 * This invariant is guaranteed because Result.combine is only used to
 * aggregate validation errors (same category).
 * Errors from other categories (Unauthorized, NotFound) use
 * early return and never reach combine.
 */
export const errorMessageParser = (errors: BaseError[]): ParsedErrorMessage => {
  const parsedErrors = errors.map((error) => `[${error.code}]: ${error.message}`);
  return {
    _tag: errors[0]?._tag || "DefaultError",
    message: parsedErrors.join("\n"),
  };
};
