
#!/bin/bash
# sync-secrets.sh: Sync secrets from Google Secret Manager into .env file

# Define supported environments
SUPPORTED_ENVS=("staging" "production" "local" "review")

# Accept environment as argument
ENV=${1:-staging}

# Validate environment
if [[ ! " ${SUPPORTED_ENVS[@]} " =~ " ${ENV} " ]]; then
  echo "Unsupported environment: $ENV"
  echo "Supported environments are: ${SUPPORTED_ENVS[*]}"
  exit 1
fi

# Define secret keys
SECRETS=("GOOGLE_API_KEY" "GCP_SA_KEY" "JIRA_WEBHOOK_SECRET" "GROUP_MAPPING")

# Simulate mock values instead of actual gcloud command
echo "# Mock secrets loaded for $ENV" > .env.$ENV
for SECRET in "${SECRETS[@]}"; do
  echo "${SECRET}=mock_${SECRET}_${ENV}" >> .env.$ENV
done

echo ".env.$ENV successfully populated with mock values."
