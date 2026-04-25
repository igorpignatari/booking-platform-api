import type { HttpRequest } from "../http/HttpRequest";
import type { HttpResponse } from "../http/HttpResponse";

export interface Middleware {
  handle(httpRequest: HttpRequest): Promise<HttpResponse | undefined>;
}
