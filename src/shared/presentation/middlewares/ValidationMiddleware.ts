import type { ZodObject } from "zod";
import { zodErrorMessageParser } from "../helpers/error/zodErrorMessageParser";
import type { HttpRequest } from "../http/HttpRequest";
import type { HttpResponse } from "../http/HttpResponse";
import type { Middleware } from "../protocols/Middleware";

export class ValidationMiddleware implements Middleware {
  constructor(private readonly schema: ZodObject) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse<string[]> | undefined> {
    const result = this.schema.safeParse(httpRequest);

    if (!result.success) {
      return {
        statusCode: 422,
        data: zodErrorMessageParser(result.error),
      };
    }

    Object.assign(httpRequest, result.data);

    return undefined;
  }
}
