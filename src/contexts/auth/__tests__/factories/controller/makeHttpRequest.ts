import type { HttpRequest } from "@shared/presentation/http/HttpRequest";

export const makeHttpRequest = <T>(body: T): HttpRequest<T> => ({
  body,
  params: null,
  query: null,
  correlationId: "test-id",
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() } as any,
});
