import type { BaseError } from "@core/errors/BaseError";
import { errorToHttp } from "../helpers/error/errorToHttp";
import type { Controller } from "../protocols/Controller";
import type { HttpRequest } from "./HttpRequest";
import type { HttpResponse } from "./HttpResponse";

export abstract class BaseController<T = any> implements Controller<T> {
  async handle(httpRequest: HttpRequest<T>): Promise<HttpResponse> {
    try {
      return await this.execute(httpRequest);
    } catch (error: any) {
      return this.fail(error);
    }
  }

  protected abstract execute(httpRequest: HttpRequest<T>): Promise<HttpResponse>;

  protected ok<T>(data: T): HttpResponse {
    return {
      statusCode: 200,
      data,
    };
  }

  protected created<T>(data: T): HttpResponse {
    return {
      statusCode: 201,
      data,
    };
  }

  protected noContent(): HttpResponse {
    return {
      statusCode: 204,
      data: null,
    };
  }

  protected fail(error: BaseError): HttpResponse {
    return errorToHttp(error);
  }
}
