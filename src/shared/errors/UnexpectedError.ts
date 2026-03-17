import { BaseError } from "@core/errors/BaseError";

export class UnexpectedError extends BaseError {
  override _tag: string;
  override code: string;
  constructor(message: string, code: string) {
    super(message);
    this._tag = "UnexpectedError" as const;
    this.code = code;
  }
}
