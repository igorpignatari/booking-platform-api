import type { ILogger } from "@core/contracts/ILogger";

export interface HttpRequest<TBody = any, TParams = any, TQuery = any> {
  body: TBody;
  params: TParams;
  query: TQuery;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;

  correlationId: string;
  logger: ILogger;
}
