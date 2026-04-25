import type { ILogger } from "@core/contracts/ILogger";
import type { HttpRequest } from "@shared/presentation/http/HttpRequest";
import type { Method } from "@shared/presentation/http/Method";
import type { Controller } from "@shared/presentation/protocols/Controller";
import type { HttpAdapter } from "@shared/presentation/protocols/HttpAdapter";
import type { Middleware } from "@shared/presentation/protocols/Middleware";
import { createCorrelationId } from "@shared/utils/createCorrelationId";
import express, { type Express, type Request, type Response } from "express";

export class HttpExpressAdapter implements HttpAdapter {
  private readonly app: Express;
  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  httpRequestMapper(req: Request, logger: ILogger): HttpRequest {
    const correlationId = createCorrelationId();
    return {
      params: req.params,
      body: req.body,
      query: req.query,
      headers: req.headers as Record<string, string>,
      correlationId,
      logger: logger.child({
        correlationId,
        requestMethod: req.method,
        requestUrl: req.url,
      }),
    };
  }

  regitser(
    method: Method,
    path: string,
    controller: Controller,
    logger: ILogger,
    middlewares: Middleware[],
  ): void {
    this.app[method](path, async (req: Request, res: Response) => {
      const request = this.httpRequestMapper(req, logger);

      if (middlewares) {
        for (const middleware of middlewares) {
          const result = await middleware.handle(request);
          if (result) {
            return res.status(result.statusCode).json(result.data);
          }
        }
      }

      const httpResponse = await controller.handle(request);
      res.status(httpResponse.statusCode).json(httpResponse.data);
    });
  }

  async listen(port: number, logger: ILogger): Promise<void> {
    this.app.listen(port, () => logger.info(`Server is running on port ${port}`));
  }
}
