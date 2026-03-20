import type { BaseError } from "@core/errors/BaseError";
import type { HttpResponse } from "@shared/presentation/http/HttpResponse";

//TODO: Refactor
//NOTE: add switch with errors, and status Code
//NOTE: Business rules(409), validation(422), generic error(500), not found(404), unauthorized(401), forbidden(403)
export const errorToHttp = (error: BaseError): HttpResponse<Record<string, string>> => {
  return {
    statusCode: 500,
    data: {
      error: "error",
    },
  };
};
