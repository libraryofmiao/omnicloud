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
