import type { HttpRequest } from "../http/HttpRequest";
import type { HttpResponse } from "../http/HttpResponse";

export interface Controller<T = any> {
  handle(httpRequest: HttpRequest<T>): Promise<HttpResponse>;
}
