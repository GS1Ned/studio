#!/usr/bin/env bash
set -euo pipefail

# Configure Firebase and gcloud using values from .env
if [ ! -f .env ]; then
  echo "[configure] .env not found. Run ./scripts/setup.sh first." >&2
  exit 1
fi

# Load environment variables
source .env

if [ -z "${GCP_PROJECT_ID:-}" ]; then
  echo "[configure] GCP_PROJECT_ID not set in .env" >&2
  exit 1
fi

# Configure Firebase CLI project
if command -v firebase >/dev/null 2>&1; then
  echo "[configure] Setting Firebase project to $GCP_PROJECT_ID"
  firebase use --add "$GCP_PROJECT_ID"
else
  echo "[configure] Firebase CLI not installed" >&2
fi

# Configure gcloud project
if command -v gcloud >/dev/null 2>&1; then
  echo "[configure] Setting gcloud project to $GCP_PROJECT_ID"
  gcloud config set project "$GCP_PROJECT_ID"
else
  echo "[configure] gcloud CLI not installed" >&2
fi

echo "[configure] Done"
