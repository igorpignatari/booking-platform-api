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

  //TODO: Refactor
  //NOTE: add errorToHttp()
  protected fail(error: Error): HttpResponse {
    return {
      statusCode: 500,
      data: error.message,
    };
  }
}
