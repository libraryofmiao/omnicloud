# OmniCloud

A standalone unified cloud-storage manager for connecting and managing multiple accounts from multiple cloud providers in one place.

## Project direction

OmniCloud is intentionally provider-neutral. Google Drive, OneDrive, Dropbox and other supported providers are first-class integrations; no single storage vendor is the foundation of the project.

### Goals

- Connect multiple accounts from the same provider.
- Connect accounts from different providers.
- Browse cloud files from one consistent interface.
- Upload, download, rename, move, delete and preview supported files.
- Keep each provider/account identifiable while offering a unified workspace.
- Support provider-specific capabilities without coupling the core application to one vendor.
- Add providers through isolated adapters.
- Keep credentials and OAuth tokens protected and separate from file metadata.
- Make the application suitable for personal use first and extensible to multi-user use.

## Architecture

Web UI -> OmniCloud API -> provider adapters -> cloud providers.

The initial implementation is based on the open-source dimartarmizi/OmniCloud project, but this repository is an independent project and will evolve separately.

## Important boundary

This repository is not part of the existing Miao Library Koha Patron app, CMS, Worker gateway, or Supabase projects. Those systems must not be modified as part of OmniCloud development.

## Initial technology direction

- Vue frontend
- Node.js/Express backend
- Provider adapter architecture
- Local metadata database
- OAuth/account credential isolation
- Docker-compatible deployment

Provider support and deployment architecture will be audited and hardened before production use.
