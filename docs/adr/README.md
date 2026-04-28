# Architecture Decision Records

This directory documents the significant architectural decisions taken
in this project. Each record captures the context that motivated the
decision, the decision itself, the trade-offs accepted, and the
alternatives considered.

The format follows Michael Nygard's ADR template.

## Why ADRs?

Architectural decisions tend to lose their reasoning over time. New
contributors see the resulting structure but not *why* it looks the way
it does, and end up either copying the form without the intent or
abandoning it for lack of justification. ADRs preserve the reasoning
alongside the code.

## Reading order

The ADRs are designed to be read in numerical order. Each one builds on
the invariants established by the previous:

1. **ADR 001** sets the layering rules.
2. **ADR 002** defines how failure flows through those layers.
3. **ADR 003** specialises the rules at the HTTP boundary.
4. **ADR 004** specialises the rules at the bounded-context boundary.

## Index

| #   | Title                                                          | Status   |
| --- | -------------------------------------------------------------- | -------- |
| 001 | [Clean Architecture and Hexagonal](./001-clean-architecture-and-hexagonal.md) | Accepted |
| 002 | [Result Pattern Instead of Exceptions](./002-result-pattern.md)               | Accepted |
| 003 | [HTTP Adapter Pattern](./003-http-adapter-pattern.md)                         | Accepted |
| 004 | [Bounded Contexts](./004-bounded-contexts.md)                                 | Accepted |

## Summaries

### ADR 001 — Clean Architecture and Hexagonal
Establishes the dependency rule (domain ← application ← infra/
presentation) and the use of ports & adapters to keep the core
independent of frameworks and infrastructure.

### ADR 002 — Result Pattern Instead of Exceptions
Use cases never throw. Failure is part of the type signature via a
bi-typed `Result<T, E = BaseError>`. Exceptions from third-party code
are caught at the boundary and converted into typed domain errors.

### ADR 003 — HTTP Adapter Pattern
Controllers operate against framework-agnostic `HttpRequest` and
`HttpResponse` interfaces. The HTTP framework (Express, Fastify) is a
driver adapter — already swapped successfully once during the project's
lifetime.

### ADR 004 — Bounded Contexts
The codebase is split into bounded contexts (`users`, `auth`,
`business`), each replicating the Clean Architecture layering
internally. Cross-context communication happens only through ports;
no context imports another's internals.

## Conventions

- **Status values:** `Proposed`, `Accepted`, `Deprecated`, `Superseded`.
- **Superseding:** an ADR is never edited after acceptance. To revise a
  decision, write a new ADR that supersedes the previous one and update
  the old ADR's status to `Superseded by ADR-NNN`.
- **Numbering:** monotonically increasing, never reused.
- **Filename:** `NNN-kebab-case-title.md`.

## Adding a new ADR

1. Copy the structure of an existing ADR.
2. Use the next available number.
3. Set status to `Proposed` until reviewed.
4. Add an entry to the index above and a one-paragraph summary in the
   *Summaries* section.

## References

- Michael Nygard, *Documenting Architecture Decisions* (2011) — the
  original ADR proposal.
- [adr.github.io](https://adr.github.io/) — collected ADR practices.
