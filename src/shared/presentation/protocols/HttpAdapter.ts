import type { ILogger } from "@core/contracts/ILogger";
import type { HttpRequest } from "../http/HttpRequest";
import type { Method } from "../http/Method";
import type { Controller } from "./Controller";
import type { Middleware } from "./Middleware";

export interface HttpAdapter {
  httpRequestMapper(req: unknown, logger: ILogger): HttpRequest;
  register(
    method: Method,
    path: string,
    controller: Controller,
    logger: ILogger,
    middlewares: Middleware[],
  ): void;
  listen(port: number, host: string, logger: ILogger): Promise<void>;
  close(): Promise<void>;
}
