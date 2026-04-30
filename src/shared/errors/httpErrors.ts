import { BaseError } from "@core/errors/BaseError";

export abstract class NotFoundError extends BaseError {
  override _tag: string;
  override code: string;

  protected constructor(message: string, code: string) {
    super(message);
    this._tag = "NotFoundError" as const;
    this.code = code;
  }
}

export abstract class ValidationError extends BaseError {
  override _tag: string;
  override code: string;

  protected constructor(
    message: string,
    code: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this._tag = "ValidationError" as const;
    this.code = code;
  }
}

export class ConflictError extends BaseError {
  override _tag: string;
  override code: string;

  constructor(message: string, code: string) {
    super(message);
    this._tag = "ConflictError" as const;
    this.code = code;
  }
}

export abstract class UnauthorizedError extends BaseError {
  override _tag: string;
  override code: string;

  protected constructor(message = "Unauthorized", code = "UNAUTHORIZED") {
    super(message);
    this._tag = "UnauthorizedError" as const;
    this.code = code;
  }
}

export abstract class ForbiddenError extends BaseError {
  override _tag: string;
  override code: string;

  protected constructor(message = "Forbidden", code = "FORBIDDEN") {
    super(message);
    this._tag = "ForbiddenError" as const;
    this.code = code;
  }
}
