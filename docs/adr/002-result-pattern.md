# ADR 002: Result Pattern Instead of Exceptions

**Status:** Accepted
**Date:** 2026-04-27

## Context

Use cases need to communicate two distinct kinds of failure:

- **Expected failures** — domain-level errors such as invalid input,
  resource not found, unauthorized access. These are part of the business
  contract and must be handled deliberately by the caller.
- **Unexpected failures** — infrastructure errors (DB unreachable, JWT
  signing failure, network timeout) and bugs.

Modelling both with thrown exceptions has well-known problems:

- **Exceptions are invisible in the type system.** A function signature
  `(input) => User` says nothing about *which* errors can occur. Callers
  cannot rely on the type checker to remind them to handle a specific
  failure case.
- **Control flow becomes implicit.** An exception can travel up several
  call frames before being caught — or never be caught at all, crashing
  the process. Tracing where a failure originated requires reading the
  whole call chain.
- **`try/catch` clutters the code.** Defensive handlers get scattered
  across layers, often duplicated.
- **In TypeScript, `catch (err)` is `unknown`.** Every handler must
  re-narrow the error type, which is verbose and error-prone.
- **Hard to differentiate categories of error.** A `ValidationError` and
  a database connection error look the same to a generic catch block.

The goal is to make failure a **first-class part of every use case
signature**, so the caller cannot ignore it and the compiler enforces
correct handling.

## Decision

Adopt a custom **bi-typed `Result<T, E = BaseError>`** as the return type
of every use case. `T` is the success type; `E` defaults to `BaseError`,
the abstract root of all domain errors in the project.

```ts
type Result<T, E = BaseError> =
  | { isOk: true;  value: T }
  | { isErr: true; error: E };
```

The class exposes the combinators needed by this project:
`map`, `mapError`, `flatMap`, `fold`, `getOrElse`, `getOrThrow` and a
`combine` helper for aggregating multiple results of the same type.

### Architectural invariants

- **Use cases never throw.** They always return `Result<T, E>`.
- **Exceptions from third-party libraries are caught at the boundary**
  (repository, JWT adapter, hash adapter) and converted into a concrete
  subclass of `BaseError`. Layers above the boundary never see raw
  exceptions.
- **Every error class extends `BaseError`** and exposes a literal `_tag`
  field used for discrimination (e.g. `"ValidationError"`,
  `"NotFoundError"`, `"UnauthorizedError"`).
- **Multiple validation errors are aggregated** into
  `AggregatedValidationError` rather than reported one at a time.
  Combined via `Result.combine`, this produces a single user-facing
  response listing every issue at once.

## Consequences

### Positive

- **Failures are part of the type signature.** A use case returning
  `Result<User, EmailAlreadyInUseError | ValidationError>` documents
  exactly what can go wrong. The compiler forces the caller to handle
  both branches.
- **Single error-handling pathway.** All errors flow through the same
  pipeline: `BaseError` → `errorToHttp` → HTTP response. There is one
  place to look, one place to extend.
- **Better UX on validation.** `AggregatedValidationError` returns *all*
  invalid fields in one response instead of forcing the client to fix
  errors one round-trip at a time.
- **Discrimination by `_tag`** keeps `errorToHttp` simple and exhaustive.
  Adding a new error tag is a localized change: define the class, add
  a switch case.
- **No `try/catch` noise above the boundary.** Application and
  presentation layers read like straight-line code with explicit error
  branches at each step.
- **Predictable control flow.** No exception ever travels across layers
  unobserved.

### Negative

- **Learning curve.** Most TypeScript developers are trained on
  `try/catch`. Result + `flatMap` style is unfamiliar at first and was
  the main upfront cost when the pattern was first introduced into the
  project.
- **More verbose at the call site.** Each fallible step requires
  unwrapping the previous result, either via early-return or `flatMap`.
  In practice this verbosity makes failure paths *visible*, which was
  judged a feature rather than a defect.
- **Boundary conversion is mandatory.** Any third-party code that throws
  must be wrapped — there is no shortcut. This is enforced as an
  architectural invariant; the cost is paid once per adapter.

## Alternatives considered

### Throwing custom exceptions
**Rejected.** Solves the "what kind of error" problem (via the class
hierarchy) but not the "is this function fallible" problem — the type
signature still hides failure. Also leaves the `unknown` issue in
`catch` blocks.

### `fp-ts` (`Either`, `TaskEither`)
**Rejected.** Used in past projects. Powerful but brings a large API
surface that is mostly unused by this project; documentation gaps for
some operators caused friction. The cost of owning a small custom
`Result` (≈100 lines) is lower than the cost of an external dependency
that influences the style of every layer.

### `neverthrow`
**Considered but not adopted.** Lighter than `fp-ts` and a closer match
to what this project needs. Rejected because:
- The project goal includes *understanding* the pattern from first
  principles, not consuming it.
- Custom requirements (`AggregatedValidationError`, project-specific
  `combine` semantics) are easier to express directly than to reconcile
  with the library's API.

### Mixing both (Result for domain errors, throw for infra)
**Rejected.** Two error-propagation models in the same codebase doubles
the cognitive load and creates ambiguity at every layer boundary
("do I catch here or not?"). A single, uniform model is enforced
instead, with the boundary conversion rule above.

## References

- Scott Wlaschin, *Railway Oriented Programming* — the conceptual model
  followed here.
- Rust's `Result<T, E>` — the original inspiration for the bi-typed
  signature.
- ADR 001 — Clean Architecture invariants that motivate explicit
  signatures across layers.
