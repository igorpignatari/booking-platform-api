# ADR 004: Bounded Contexts

**Status:** Accepted
**Date:** 2026-04-27

## Context

The application covers several distinct business concerns:

- **Users** — managing user identity, profile data and persistence.
- **Auth** — credential verification, token issuance, session lifecycle.
- **Business** — domain-specific operations (bookings, business logic).

A naive structure would put all of these under a flat `services/` and
`repositories/` layout. Past experience shows the consequences:

- Files grow until ownership is unclear.
- A single change touches code that conceptually belongs to different
  concerns.
- Tests become tangled because helpers from one feature leak into
  another.
- Splitting any subset out later (into a service, a library, or simply
  a separate folder) becomes a refactor, not a move.

The project follows Domain-Driven Design (Evans, 2003): each major
business concern deserves its own **bounded context** — a self-contained
slice of the system with its own model, its own language, and its own
boundaries.

## Decision

Organise the codebase into bounded contexts under `src/contexts/`:

```
src/contexts/
  users/
    domain/        # Entities, value objects, repository ports
    application/   # Use cases (CreateUserUseCase, etc.)
    infra/         # Concrete repository, adapters
    presentation/  # Controllers
  auth/
    domain/
    application/
    infra/
    presentation/
  business/
    domain/
    application/
    infra/
    presentation/
```

Each context replicates the Clean Architecture layering internally and
is treated as a **self-contained mini-application**. Cross-context
communication happens exclusively through ports (interfaces), never
through direct imports of internal types.

### Architectural invariants

- **No context imports directly from another context.** A context that
  needs data from another defines its *own port* (interface) representing
  what it needs, and a concrete adapter in `main/` wires it to the
  supplier context's repository.
- **Each context owns its language.** A `User` in `users/` and a `User`
  reference in `auth/` (e.g. `AuthenticatedUserPort`) are *not* the same
  type. Each context expresses only the fields it actually uses.
- **`core/` holds only generic, cross-cutting contracts** (`ILogger`,
  `HashServices`, `JWTServices`). It does **not** hold business
  contracts shared between contexts.
- **Each context replicates the layering** (`domain/application/infra/
  presentation`). The structure is intentional: each context could be
  extracted into its own service with no internal restructuring.
- **A new context is justified only when it has its own ubiquitous
  language and its own invariants.** Cross-cutting features that merely
  *react* to events (e.g. notifications) belong in `shared/` and are
  triggered via events, not promoted to a context.

### Criteria for creating a new context

Before adding a new folder under `contexts/`, the answer to all three
questions must be "yes":

1. **Does it have its own model and vocabulary?** A booking is not a
   user; it has its own lifecycle, its own rules, its own DTO.
2. **Does it have invariants the other contexts must not bypass?** If
   the rules can be inlined into another context without loss, it does
   not deserve its own context.
3. **Could it plausibly be extracted into a separate service?** This is
   the litmus test for the boundary being real, not cosmetic.

Concrete example: **notifications** were considered as a context but
rejected. Sending an email after a booking is created is a *reaction*,
not a domain. It belongs in `shared/` and is triggered via a domain
event (`BookingCreated` → notification handler). If notifications
gained their own state and lifecycle (templates, delivery retries,
preferences), the criteria above would flip and a `notifications/`
context would become justified.

## Consequences

### Positive

- **Independent evolution.** Each context can be modified, tested and
  reviewed in isolation. A change in `business/` does not risk breaking
  `auth/`.
- **Clear ownership.** Every file has an obvious home. Code review
  scope shrinks because changes naturally cluster within one context.
- **Onboarding maps to the structure.** A new contributor learning
  "how does authentication work?" reads `contexts/auth/` end-to-end and
  is done — no chasing files across the project.
- **Service extraction is mechanical.** Because contexts depend only on
  stable contracts (`core/` + their own ports), extracting any context
  into its own service is moving a folder, not rewriting code. This is
  not a current goal but is preserved as a free option.
- **Domain language stays honest.** Each context names things in its
  own terms. Auth's view of a user is a credential carrier; users'
  view is the full profile. Forcing a single shared `User` type would
  collapse this distinction.
- **Aligns with the cost discipline of new contexts.** The three-question
  rule prevents accidental context proliferation.

### Negative

- **Boilerplate per context.** Each context replicates the
  `domain/application/infra/presentation` structure. For small contexts
  this is more files than strictly necessary. The cost is paid once per
  context and pays back continuously during maintenance.
- **Port duplication.** When two contexts need similar information
  (e.g. "given an email, does the user exist?"), each context defines
  its own port shaped to its needs. This is *intentional* duplication —
  collapsing it into a shared interface in `core/` would re-couple
  contexts. The duplicated ports stay small and tend not to drift.
- **More indirection at wiring time.** `main/` is responsible for
  binding each consuming context's port to the supplying context's
  repository. The composition root is the only place that knows about
  more than one context at a time. This is by design but adds cognitive
  load when reading dependency wiring.
- **Discipline is required.** The rule "no direct imports across
  contexts" is enforceable only by convention (and ideally lint rules).
  A single shortcut import collapses the boundary silently.

## Alternatives considered

### Flat `services/` + `repositories/`
**Rejected.** The default Express-style layout. Works for small projects
but degrades sharply as features accumulate: services balloon, files
share unrelated responsibilities, refactoring touches everything.

### Modular monolith without internal layering
**Rejected.** Top-level folders by feature (`users/`, `auth/`,
`business/`) without `domain/application/infra/presentation` inside
each. Captures the boundary benefit but loses the layering benefit
(testability, framework independence). Combining both — contexts *and*
internal layering — is the deliberate choice.

### Vertical slices (per-feature folders, no contexts)
**Rejected at the project level.** Pure vertical slicing scatters
shared concerns (validation, error handling, logging) across features
and erases the larger architectural boundaries between business
concerns. *Within* a context, code is organised by feature/use case,
which captures the readability benefit of vertical slices without
sacrificing the boundary.

### Single shared `User` type used by every context
**Rejected.** Would force every context to know the full user shape,
re-coupling contexts and violating the principle that each context
defines its own language.

## References

- Eric Evans, *Domain-Driven Design* (2003) — bounded contexts.
- Vaughn Vernon, *Implementing Domain-Driven Design* (2013) — context
  mapping and Anti-Corruption Layer.
- ADR 001 — Clean Architecture: this ADR specialises ADR 001 by
  defining the boundary at which the layered structure repeats.
- ADR 002 — Result Pattern: cross-context ports return `Result<T, E>`
  for the same reasons as use cases.
