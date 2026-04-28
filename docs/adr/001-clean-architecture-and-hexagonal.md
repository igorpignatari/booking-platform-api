# ADR 001: Clean Architecture and Hexagonal Architecture

**Status:** Accepted
**Date:** 2026-04-27

## Context

Previous projects I worked on suffered from common architectural problems:

- **Hard to maintain:** changing one feature often required touching multiple
  unrelated files, because business logic was tangled with framework code
  (Express handlers calling DB drivers directly, etc.).
- **Hard to test:** without clear boundaries, unit tests required spinning up
  the whole app — DB, HTTP layer, env vars. Tests were slow and brittle.
- **Hard to debug:** when a bug appeared, it was unclear *where* the bug
  lived (request parsing? business rule? persistence?). Tracing required
  reading the entire flow top to bottom.
- **Hard to scale features:** adding a new feature meant copy-pasting patterns
  inconsistently, and each new addition risked breaking unrelated code.

The goal of this project is twofold:

1. Build a backend that is genuinely easy to maintain, test and extend.
2. Deepen my own understanding of architectural patterns by applying them
   to a non-trivial domain (users + auth + business).

## Decision

Adopt **Clean Architecture + Hexagonal (Ports & Adapters)** as the structural
foundation, with the following concrete shape:

```
src/
  core/         # Pure TypeScript only. No external libs, no framework code.
                # Cross-cutting contracts (ILogger, HashServices, etc.)
  shared/       # Cross-context utilities that may depend on external libs.
                # Generic domain primitives (Result, BaseError, ValueObjects),
                # infra adapters (HttpExpressAdapter, PinoLogger),
                # presentation protocols (Controller, Middleware).
  contexts/     # Bounded contexts. Each one is self-contained:
    users/      #   - domain/      (entities, value objects, repository ports)
    auth/       #   - application/ (use cases)
    business/   #   - infra/       (concrete adapters)
                #   - presentation/(controllers)
  main/         # Composition root: factories, routes, dependency wiring,
                # server bootstrap.
```

### Architectural invariants

These are non-negotiable rules for any future contributor:

- **`core/` may not import from any other folder** and may not depend on any
  external library. It is the dependency sink — everything points inward to it.
- **`shared/` may import from `core/`**, but never from `contexts/` or `main/`.
- **`contexts/<name>/` may import from `core/` and `shared/`**, but never from
  another context directly. Cross-context communication goes through
  contracts defined in `core/` or events.
- **`main/` is the only place** where concrete implementations are wired
  together. Use cases never instantiate their dependencies.
- **Use cases return `Result<T, E>`** — they never throw and never return raw
  framework objects.

## Consequences

### Positive

- **Testability:** use cases are pure functions of their inputs and injected
  ports. Unit tests need no DB, no HTTP server, no env. Mocks of the ports
  are trivial.
- **Maintainability:** changing the HTTP framework (Express → Fastify) only
  requires writing a new adapter. The 90% of code in `core/`, `shared/domain`
  and `contexts/*/application` is untouched. This was validated in practice
  during this project (see ADR 003).
- **Predictability:** when a bug appears, the layered structure tells you
  *where* to look. Validation bug → presentation. Business rule bug →
  application/domain. Persistence bug → infra.
- **Onboarding:** the folder structure itself documents the architecture.
  A new dev can map a feature to files in minutes.
- **Future-proof for splitting into services:** because contexts are isolated
  and depend only on stable contracts in `core/` and `shared/`, extracting a
  context into its own service later is a mechanical operation rather than a
  rewrite. This is *not* a current goal but is a free side-effect of the
  decision.

### Negative

- **Boilerplate:** even simple endpoints require a controller, a use case, a
  factory and a route registration. For a tiny project this is overkill.
  For this project, the trade-off was deemed acceptable because clarity and
  consistency are explicit goals.
- **Repetition between layers:** entities, DTOs and persistence models often
  share fields. The cost of repetition is accepted as the price of decoupling
  — domain types are intentionally not derived from infrastructure types
  (e.g. domain `User` is not derived from a Zod schema or a DB row), so a
  change in one layer does not silently propagate to others.
- **Learning curve:** developers unfamiliar with Clean Architecture / DDD
  vocabulary need ramp-up time.

## Alternatives considered

### MVC (controller + service + repository)
**Rejected.** In past projects, "service" tends to become a dumping ground
for everything: business rules, framework calls, validation, formatting.
This is exactly the tangling the project is trying to avoid.

### Onion Architecture
**Considered but not adopted.** Conceptually similar to Clean Architecture
but with less explicit framing for ports/adapters. The Hexagonal vocabulary
of "drivers and driven" maps more naturally to the concrete decisions in
this project (HTTP adapter, JWT services, hash services, repositories).

### Vertical Slice Architecture
**Rejected at the project level, partially adopted within contexts.** Pure
vertical slicing — each feature has its own controller, handler, validator,
DB code in one folder — was rejected because it leads to duplication of
shared concerns (auth, logging, validation, error formatting). However,
*within* a bounded context, code is organised by feature/use case, which
captures the readability benefit of vertical slicing.

### "Just go with the flow" (no upfront architecture)
**Rejected.** Refactoring an unstructured codebase later costs significantly
more than the up-front cost of the structure. Past experience confirms this.

## References

- Robert C. Martin, *Clean Architecture* (2017).
- Alistair Cockburn, *Hexagonal Architecture* (2005).
- Eric Evans, *Domain-Driven Design* (2003) — for the bounded context concept
  used in `contexts/`.
