import type { ZodObject } from "zod";
import { zodErrorMessageParser } from "../helpers/zodErrorMessageParser";
import type { HttpRequest } from "../http/HttpRequest";
import type { HttpResponse } from "../http/HttpResponse";
import type { Middleware } from "../protocols/Middleware";

export class ValidationMiddleware implements Middleware {
  constructor(private readonly schema: ZodObject) {}

  async handle(httpRequest: HttpRequest): Promise<HttpResponse<string[]> | undefined> {
    const result = this.schema.safeParse(httpRequest);

    if (!result.success) {
      return {
        statusCode: 400,
        data: zodErrorMessageParser(result.error),
      };
    }
    const data = result.data as {
      body?: unknown;
      params?: unknown;
      query?: unknown;
    };

    if (data.body !== undefined) httpRequest.body = data.body;
    if (data.params !== undefined) httpRequest.params = data.params;
    if (data.query !== undefined) httpRequest.query = data.query;

    return undefined;
  }
}
