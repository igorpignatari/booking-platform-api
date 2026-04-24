import type { HttpResponse } from "@shared/presentation/http/HttpResponse";
import type { ParsedErrorMessage } from "./errorMessageParser";

export const errorToHttp = (error: ParsedErrorMessage): HttpResponse<string> => {
  switch (error._tag) {
    case "ValidationError": {
      return {
        statusCode: 422,
        data: error.message,
      };
    }
    case "NotFoundError": {
      return {
        statusCode: 404,
        data: error.message,
      };
    }
    case "UnauthorizedError": {
      return {
        statusCode: 401,
        data: error.message,
      };
    }
    case "ForbiddenError": {
      return {
        statusCode: 403,
        data: error.message,
      };
    }
    default: {
      return {
        statusCode: 500,
        data: "Internal Server Error",
      };
    }
  }
};
