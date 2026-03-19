import type { Cookie } from "./Cookie";

export interface HttpResponse<T = any> {
  statusCode: number;
  data: T;
  headers?: Record<string, string>;
  cookies?: Cookie[];
}
