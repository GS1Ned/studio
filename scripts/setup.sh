#!/usr/bin/env bash
set -euo pipefail

# Basic project setup script for local development

# Copy environment file if not present
if [ ! -f .env ]; then
  echo "[setup] Creating .env from .env.example"
  cp .env.example .env
  echo "[setup] Please edit .env with your credentials"
fi

# Install Node dependencies
if [ ! -d node_modules ]; then
  echo "[setup] Installing npm dependencies"
  npm install
else
  echo "[setup] npm dependencies already installed"
fi

# Install git hooks
if [ -d .git ]; then
  echo "[setup] Installing git hooks"
  cp scripts/git-hooks/pre-commit .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
fi

# Run lint and type checks
npm run lint || echo "[setup] Lint failed or not configured"
npm run typecheck || echo "[setup] Typecheck failed"

# Build the project to verify setup
npm run build

echo "[setup] All done"
