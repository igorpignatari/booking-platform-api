import type { ILogger } from "@core/contracts/ILogger";

export interface HttpRequest<TBody = unknown, TParams = unknown, TQuery = unknown> {
  body: TBody;
  params: TParams;
  query: TQuery;
  headers?: Record<string, string | string[] | undefined>;
  cookies?: {
    refreshToken?: string;
  };

  correlationId: string;
  logger: ILogger;
}
