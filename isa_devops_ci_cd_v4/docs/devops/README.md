# DevOps Setup for ISA

This directory contains all files related to CI/CD, secret management, and environment handling.

## Files

- `.env.staging`, `.env.production`, `.env.local`, `.env.review` – Environment templates
- `sync-secrets.sh` – Sync script to populate .env files
- `SECRETS_GUIDANCE.md` – Best practices for secret handling

## Usage

To generate a local .env file with mock secrets:

```bash
bash sync-secrets.sh local
```

Replace `local` with `staging`, `production`, or `review` as needed.
