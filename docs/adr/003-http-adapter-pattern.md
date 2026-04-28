# ADR 003: HTTP Adapter Pattern

**Status:** Accepted
**Date:** 2026-04-27

## Context

Controllers in a typical Node.js application are written directly against
the HTTP framework's request/response objects:

```ts
app.post("/users", async (req, res) => {
  const user = await createUserUseCase.execute(req.body);
  res.status(201).json(user);
});
```

This style has several drawbacks for a project that follows Clean Architecture
(see ADR 001):

- **Controllers are coupled to the framework.** Switching from Express to
  Fastify (or any other) means rewriting every controller and every test.
- **Testing requires the framework.** Unit-testing a controller forces
  spinning up the HTTP layer or mocking large portions of `req` and `res`.
- **Side effects inside the handler.** `res.status().json()` is a hidden
  effect — the controller cannot be reasoned about as a pure function.
- **Inconsistent shape across handlers.** Without a shared contract,
  every handler picks its own way to read input and write output.

The goal is to keep the application code independent from the HTTP
framework, so the framework becomes a *driver adapter* in the Hexagonal
sense — pluggable, replaceable, and irrelevant to the rest of the system.

## Decision

Define framework-agnostic `HttpRequest` and `HttpResponse` interfaces in
`shared/presentation/http/`. Controllers operate exclusively on these
interfaces; they never see Express or Fastify objects.

For each supported framework, a thin adapter (`HttpExpressAdapter`,
`HttpFastifyAdapter`) translates the framework's native request/response
into the project's interfaces and back.

```ts
// Project contract — used by every controller, every test
export interface HttpRequest<TBody = unknown, TParams = unknown, TQuery = unknown> {
  body: TBody;
  params: TParams;
  query: TQuery;
  headers?: Record<string, string | string[] | undefined>;
  cookies?: Record<string, string>;
  correlationId: string;
  logger: ILogger;
}

export interface HttpResponse<TData = unknown> {
  statusCode: number;
  data?: TData;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
}
```

The adapter is the only place that imports the framework. A controller
looks like this:

```ts
class CreateUserController extends BaseController<CreateUserBody, UserDTO> {
  async handle(request: HttpRequest<CreateUserBody>): Promise<HttpResponse<UserDTO>> {
    // pure: receives HttpRequest, returns HttpResponse
  }
}
```

### Architectural invariants

- **Only `HttpExpressAdapter` / `HttpFastifyAdapter` may import the
  HTTP framework.** No controller, use case or domain object may
  reference framework types.
- **Controllers receive `HttpRequest` and return `HttpResponse`.**
  They never call `res.status()`, `res.json()` or any framework method.
- **`HttpRequest` carries a `correlationId` and a request-scoped
  `logger`.** Both are populated by the adapter, before the controller
  runs.
- **Generics over `TBody`, `TParams`, `TQuery`** mean the validation
  layer (see `ValidationMiddleware`) replaces them with the parsed,
  typed values; controllers consume already-validated input.

## Consequences

### Positive

- **Framework was already swapped successfully.** The project initially
  used Express; switching to Fastify required only writing a new
  adapter — no controller, use case or test was modified. This is the
  strongest empirical evidence that the pattern delivers what it promises.
- **Pure controllers.** A controller is a function from `HttpRequest`
  to `HttpResponse`. No global state, no side effects, no framework.
  Unit tests construct a plain object and assert on the returned object.
- **Consistent shape.** Every controller reads input and writes output
  the same way. Reviewing or onboarding requires learning one contract,
  not many.
- **Observability built in.** `correlationId` and `logger` are part of
  the request contract, so every controller and use case has access to
  them without ceremony. Tracing a request across layers is mechanical.
- **Validation fits naturally.** The generic `HttpRequest<TBody>` is
  refined by `ValidationMiddleware` (Zod-based), so by the time a
  controller's `handle` runs, the body is already typed and validated.

### Negative

- **More files to write.** Every new endpoint requires a controller, a
  factory and a route registration on top of the use case. For trivial
  endpoints this is overhead. Accepted as a cost of architectural
  consistency (see ADR 001).
- **Loss of framework-specific shortcuts.** Direct use of
  framework-specific features (Express middleware ecosystem, Fastify
  schemas, streaming/SSE patterns) requires going through the adapter
  or, in genuinely framework-specific cases, opting out for that route.
  Has not been a blocker so far.
- **`correlationId` and `logger` on `HttpRequest` mix transport with
  observability.** A purer design would inject the logger via the
  controller's factory rather than expose it on the request object.
  The current trade-off prioritises ergonomics — every layer can log
  with request context for free — over strict separation of concerns.
- **Initial confusion for newcomers.** A developer expecting `req`/`res`
  must first locate the adapter. The folder structure
  (`shared/presentation/http`) makes this discoverable; the cost is a
  few minutes of orientation.

## Alternatives considered

### Use Express / Fastify directly in controllers
**Rejected.** Cheaper short-term but couples every controller to the
framework. Validated against this trade-off when Fastify replaced
Express in this project: the alternative would have meant rewriting the
entire HTTP layer instead of writing one adapter.

### NestJS (or another opinionated framework)
**Rejected.** NestJS provides a mature controller/DI/module abstraction,
but it imposes its own architectural model — DI container, decorators,
lifecycle. For a solo learning project where the goal is to *design*
the architecture, NestJS would have removed the most interesting
decisions. It is a strong fit for larger teams that benefit from a
shared, enforced standard; not a fit for the goals of this project.

### tRPC / GraphQL-only
**Rejected.** Both work well for a single client + server pair, but
this project models a generic HTTP backend that may serve multiple
client types. A REST-shaped contract via `HttpRequest`/`HttpResponse`
is the lowest common denominator.

### Pre-built adapter libraries
**Considered.** No widely-used library matches exactly the contract
needed here (`correlationId`, `logger`, generic body/params/query, plus
the Result-Pattern integration in `BaseController`). A ≈100-line
hand-written adapter is cheaper than adopting and adapting a library.

## References

- ADR 001 — Clean Architecture and Hexagonal: this ADR is a concrete
  application of the "ports and adapters" rule.
- ADR 002 — Result Pattern: `BaseController` consumes use case `Result`s
  and converts them via `errorToHttp` before returning an `HttpResponse`.
- Alistair Cockburn, *Hexagonal Architecture* — driver adapters.
