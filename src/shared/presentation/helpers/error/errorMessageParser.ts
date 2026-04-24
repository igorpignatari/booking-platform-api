import type { BaseError } from "@core/errors/BaseError";

export type ParsedErrorMessage = {
  _tag: string;
  message: string;
};

export const errorMessageParser = (errors: BaseError): ParsedErrorMessage => {
  return {
    _tag: errors._tag,
    message: `[${errors.code}]: ${errors.message}`,
  };
};
