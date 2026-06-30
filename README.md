# ANA Frontend

Extracted frontend source for the NursingWorld (nursingworld.org) platform.

## Stack
- Vite (migrated from Grunt/Browserify, June 2026)
- Node 24.14.0 (managed via fnm)
- jQuery (external global, not bundled)
- ESLint 10 flat config

## Structure
- `_client/scripts/src/` — JS components, views, and modules
- `_client/styles/` — CSS source
- `vite.config.js` — build configuration
- `browserify-mapping.json` — 130+ module entry points

## Build
```bash
fnm use 24.14.0
npm install
npm run build
```

## Notes
This repo is extracted from the main ANA solution for code review purposes.
It does not contain backend .NET project files, connection strings, or secrets.
