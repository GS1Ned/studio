#!/usr/bin/env bash
set -euo pipefail

# Project setup script with Codex integration

# Create template environment file
if [ ! -f .env.template ]; then
  echo "[setup] Creating .env.template from .env.example"
  cp .env.example .env.template
fi

# Generate environment variants
for env in development test production; do
  target=".env.${env}"
  if [ ! -f "$target" ]; then
    echo "[setup] Creating $target from .env.template"
    cp .env.template "$target"
  fi
done

# Copy main .env if not present
if [ ! -f .env ]; then
  echo "[setup] Creating .env from .env.template"
  cp .env.template .env
  echo "[setup] Please edit .env with your credentials"
fi

# Ensure gitignore rules
if ! grep -q '^\.env\*' .gitignore; then
  echo ".env*" >> .gitignore
fi
if ! grep -q '!\.env.template' .gitignore; then
  echo "!.env.template" >> .gitignore
fi
if ! grep -q '!\.env.example' .gitignore; then
  echo "!.env.example" >> .gitignore
fi

# Create Codex configuration
if [ ! -f .codexrc.json ]; then
  echo "[setup] Creating .codexrc.json"
  cat <<'EOF' > .codexrc.json
{
  "fullAuto": true
}
EOF
fi

# Install Codex CLI if missing
if ! command -v codex >/dev/null 2>&1; then
  echo "[setup] Installing Codex CLI"
  npm install -g codex-cli
fi

# Install Node dependencies deterministically
if [ ! -d node_modules ]; then
  echo "[setup] Installing npm dependencies via npm ci"
  npm ci
else
  echo "[setup] npm dependencies already installed"
fi

# Install git hooks
if [ -d .git ]; then
  echo "[setup] Installing git hooks"
  cp scripts/git-hooks/pre-commit .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
fi

# Export environment versions
export CODEX_ENV_NODE_VERSION="$(node --version)"
if command -v python3 >/dev/null 2>&1; then
  export CODEX_ENV_PYTHON_VERSION="$(python3 --version | awk '{print $2}')"
fi

# Lint, typecheck, build and test
npm run lint || echo "[setup] Lint failed or not configured"
npm run typecheck || echo "[setup] Typecheck failed"
npm run build
npm test || echo "[setup] Tests failed"

echo "[setup] All done"

cat <<'EOF'
Next steps:
  - Update the generated .env files with your secrets
  - Run 'npm run dev' to start the development server
EOF
