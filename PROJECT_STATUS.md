# OmniCloud Project Status

## Repository

- GitHub: libraryofmiao/omnicloud
- Status: new standalone project
- Existing repository was empty at project start.

## Source baseline

The project is being started from the architecture and implementation of the public dimartarmizi/OmniCloud project.

## Requirements established

1. Multiple Google Drive accounts.
2. Multiple OneDrive accounts.
3. Multiple Dropbox accounts.
4. One unified interface.
5. Provider-neutral architecture.
6. Additional providers can be added later.
7. Do not couple the project to Cloudflare R2 or any other single storage provider.
8. Do not modify the user's existing unrelated repositories.

## First engineering phase

- Import/audit the upstream application.
- Verify provider adapters.
- Verify multi-account isolation.
- Verify authentication/session persistence.
- Verify credential encryption and portability.
- Verify sync and metadata behavior.
- Establish a reliable development/build workflow.


## README-aligned development completed

- Durable OAuth state persisted in SQLite for Google Drive, OneDrive, Dropbox, and Yandex.
- Stable provider account identifiers are used when the provider exposes them.
- Provider capability metadata now drives unified file presentation instead of provider-name assumptions.
- Durable OAuth state tests added.
- README now documents the backend test command.

## Recovery point

- recovery/pre-readme-phase-development
- Created before this development phase.


## Phase 2 — unified workspace foundation

- Added deterministic account-aware workspace file keys.
- Added normalized virtual workspace path helpers.
- Added cross-account duplicate detection service.
- Exposed authenticated workspace duplicate lookup endpoint.
- Added provider-neutral workspace identity tests.


## README-aligned functional audit — upload path

- Audited the README-documented upload workflow after the workspace foundation.
- Found and fixed a duplicate Busboy file-stream pipe in the upload staging path.
- The upload payload is now staged exactly once before provider/fallback attempts, preserving the replayable fallback design.
- Recovery point: `recovery/readme-next-provider-audit`.
- CI was triggered by the fix and is being verified.


## README-aligned workspace audit — path normalization

- Re-audited the unified workspace file-metadata path after the upload fix.
- Corrected remaining internal references to the exported `normalizeVirtualPath` helper in `fileService.js`.
- This restores path normalization for account sync/upsert flows without changing the README-defined workspace behavior.
- Recovery point: `recovery/readme-next-workspace`.


## README-aligned upload session security audit

- Audited the documented upload-session and real-time progress workflow.
- Found that the issued upload session token was not actually enforced by the upload stream or progress WebSocket endpoints.
- Added user-scoped upload-session token validation for the payload stream and WebSocket progress channel.
- Updated the frontend to pass the issued token to both channels.
- Added a focused upload-session isolation test.
- Recovery point: `recovery/readme-next-upload-session`.


## README-aligned sync/metadata mirror audit

- Audited scheduled/manual sync reporting after the upload-session work.
- Fixed sync status reporting so hosted users no longer observe another user's last-sync report.
- Health now returns the authenticated user's sync report while retaining aggregate running state for unauthenticated health checks.
- Added a sync-service module smoke test.
- Recovery point: `recovery/readme-next-sync-audit`.


## README-aligned remaining-capability implementation pass

- Created recovery point: `recovery/pre-all-remaining-readme`.
- Hardened allocation configuration so manual account ordering can reference only unique active accounts.
- Hardened all documented allocation strategies so an upload is rejected when no active account has sufficient free space instead of selecting an undersized target.
- Hardened hosted authentication cookie parsing against malformed cookie values and reused the parser during logout.
- Hardened documented user settings validation for supported keys and themes.
- Corrected sync reporting so `changesDetected` represents actual added/updated/deleted metadata records instead of the number of records scanned.
- Added focused authentication and allocation test coverage.


## README-aligned remaining capability implementation — completed pass

- Created recovery point: `recovery/pre-all-remaining-readme-v2` before the final implementation pass.
- Hardened every allocation strategy so no upload is assigned to an account without enough free space; fallback chains now contain only eligible accounts.
- Allocation order now rejects duplicate, empty, unknown, and non-active account IDs.
- Stable provider account keys are exposed in account listings and Yandex Disk now uses its provider UID when available.
- Upload WebSocket sessions are bound to the authenticated user as well as the upload-session token.
- Upload initiation validates a non-negative safe integer size; staged payload size is verified before provider upload; zero-byte progress is handled safely.
- Hosted authenticated downloads now include session credentials in the frontend fetch path.
- My Drive search now uses the backend cross-provider search API, with stale search responses ignored.
- Added sync delta coverage and a common provider-adapter contract test covering all seven supported adapters.
- Final implementation remains confined to `libraryofmiao/omnicloud`.
- Allocation tests now exercise every documented strategy when no account can fit the upload.
- GitHub currently reports no commit status/workflow result for the latest commits, so CI has not been represented as passing without evidence.
