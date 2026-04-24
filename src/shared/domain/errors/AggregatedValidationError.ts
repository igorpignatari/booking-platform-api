import { BaseError } from "@core/errors/BaseError";

export class AggregatedValidationError extends BaseError {
  readonly _tag = "ValidationError";
  readonly code = "AGGREGATED_VALIDATION";

  constructor(public readonly errors: BaseError[]) {
    super(errors.map((e) => `[${e.code}]: ${e.message}`).join("\n"));
  }
}
