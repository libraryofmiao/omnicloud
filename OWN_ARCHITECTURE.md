# OmniCloud — Own Architecture

OmniCloud is being developed as an independent, provider-neutral cloud workspace. The upstream project is the initial engineering baseline only; provider behavior, account identity, metadata, security, synchronization, and user experience are owned by this repository.

## Product boundary
OmniCloud must support multiple accounts from the same provider and multiple providers at the same time. No provider is the system's primary storage layer.

## Core layers
1. Identity — OmniCloud users and sessions.
2. Accounts — isolated external cloud connections.
3. Provider registry — provider definitions and capabilities.
4. Adapter contract — normalized provider operations.
5. Metadata index — fast local navigation/search.
6. Sync engine — provider-to-index reconciliation.
7. Allocation engine — destination account selection.
8. Workspace — one logical drive with provider/account provenance.

## Non-negotiable rules
- Never assume one provider or one account.
- Never expose provider credentials to the browser after connection.
- Never use provider-specific fields as the universal data model.
- Account identity must remain stable if a display label/email changes.
- Provider capabilities must be explicit.
- One account's sync failure must not corrupt another account.
- Upload fallback must be able to replay the upload payload.
- Remote providers remain the source of truth for file contents.
- Database schema changes require migrations.
- Secrets use deployment-stable key material, not machine identity.
- OAuth state must become durable for restart/multi-instance safety.

## Current development phases

### Phase 1 — foundation hardening
Provider registry, capability catalog, schema migrations, durable OAuth state, stable external account identity, backend smoke tests, provider-independent errors.

### Phase 2 — unified workspace
Account-aware virtual filesystem, deterministic file identity, cross-provider search, duplicate handling, normalized shared/starred behavior.

### Phase 3 — upload engine
Resumable/chunked uploads, allocation, replayable fallback, cancellation, large-file safeguards.

### Phase 4 — security and operations
Key rotation/versioning, CSRF protection, rate limits, audit logs, readiness/health, backup/restore.

### Phase 5 — provider expansion
A new provider should require an adapter and provider definition rather than changes throughout the application.
