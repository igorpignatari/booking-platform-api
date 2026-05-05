import type { ILogger } from "@core/contracts/ILogger";
import type { HttpRequest } from "@shared/presentation/http/HttpRequest";
import type { Method } from "@shared/presentation/http/Method";
import type { Controller } from "@shared/presentation/protocols/Controller";
import type { HttpAdapter } from "@shared/presentation/protocols/HttpAdapter";
import type { Middleware } from "@shared/presentation/protocols/Middleware";
import { createCorrelationId } from "@shared/utils/createCorrelationId";
import fastify, { type FastifyReply, type FastifyRequest, type FastifyInstance } from "fastify";

export class HttpFastifyAdapter implements HttpAdapter {
  private readonly app: FastifyInstance;
  constructor() {
    this.app = fastify();
  }

  httpRequestMapper(req: FastifyRequest, logger: ILogger): HttpRequest {
    const correlationId = createCorrelationId();
    return {
      params: req.params,
      body: req.body,
      query: req.query,
      headers: req.headers as Record<string, string | string[] | undefined>,
      correlationId,
      logger: logger.child({
        correlationId,
        requestMethod: req.method,
        requestUrl: req.url,
      }),
    };
  }

  register(
    method: Method,
    path: string,
    controller: Controller,
    logger: ILogger,
    middlewares: Middleware[],
  ): void {
    this.app[method](path, async (req: FastifyRequest, rep: FastifyReply) => {
      const request = this.httpRequestMapper(req, logger);

      if (middlewares.length > 0) {
        for (const middleware of middlewares) {
          const result = await middleware.handle(request);
          if (result) {
            return rep.status(result.statusCode).send(result.data);
          }
        }
      }

      const httpResponse = await controller.handle(request);
      return rep.status(httpResponse.statusCode).send(httpResponse.data);
    });
  }

  async listen(port: number, host: string, logger: ILogger): Promise<void> {
    try {
      const address = await this.app.listen({ port, host });
      logger.info("Server is listening", { address, port });
    } catch (err) {
      const code = (err as NodeJS.ErrnoException)?.code;

      if (code === "EADDRINUSE") {
        logger.error("Port already in use", { err, port });
      } else if (code === "EACCES") {
        logger.error("Permission denied to bind on port", { err, port });
      } else {
        logger.error("Failed to start server", { err });
      }

      process.exit(1);
    }
  }

  async close(): Promise<void> {
    await this.app.close();
  }

  async ready(): Promise<void> {
    await this.app.ready();
  }

  inject(options: import("fastify").InjectOptions) {
    return this.app.inject(options);
  }
}
