#!/usr/bin/env bash
# Push env vars into Google Secret Manager for Firebase App Hosting (--force grants backend access).
# Used locally (after firebase login to the right account) and in .github/workflows/sync-firebase-apphosting-secrets.yml.
set -euo pipefail

PROJECT_ID="${FIREBASE_APPHOSTING_PROJECT_ID:-${NEXT_PUBLIC_FIREBASE_PROJECT_ID:-}}"
if [ -z "${PROJECT_ID}" ]; then
  echo "Set FIREBASE_APPHOSTING_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  exit 1
fi

put_secret() {
  local name="$1"
  local value="$2"
  if [ -z "${value}" ]; then
    echo "Skip ${name} (empty)"
    return 0
  fi
  printf '%s' "${value}" | npx --yes firebase-tools@latest apphosting:secrets:set "${name}" \
    --data-file - \
    --force \
    --project "${PROJECT_ID}"
  echo "Set ${name}"
}

put_secret NEXT_PUBLIC_FIREBASE_API_KEY "${NEXT_PUBLIC_FIREBASE_API_KEY:-}"
put_secret NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN "${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:-}"
put_secret NEXT_PUBLIC_FIREBASE_PROJECT_ID "${NEXT_PUBLIC_FIREBASE_PROJECT_ID:-}"
put_secret NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET "${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:-}"
put_secret NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID "${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:-}"
put_secret NEXT_PUBLIC_FIREBASE_APP_ID "${NEXT_PUBLIC_FIREBASE_APP_ID:-}"
put_secret NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID "${NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:-}"
put_secret RESEND_API_KEY "${RESEND_API_KEY:-}"
put_secret CRON_SECRET "${CRON_SECRET:-}"

BACKEND="${FIREBASE_APPHOSTING_BACKEND:-}"
if [ -z "${BACKEND}" ]; then
  echo "Listing App Hosting backends in ${PROJECT_ID}..."
  npx --yes firebase-tools@latest apphosting:backends:list --project "${PROJECT_ID}" || true
  echo "If grantaccess is still needed, set FIREBASE_APPHOSTING_BACKEND and re-run grant step in the workflow."
else
  SECRETS="NEXT_PUBLIC_FIREBASE_API_KEY,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,NEXT_PUBLIC_FIREBASE_PROJECT_ID,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,NEXT_PUBLIC_FIREBASE_APP_ID,NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,RESEND_API_KEY,CRON_SECRET"
  npx --yes firebase-tools@latest apphosting:secrets:grantaccess "${SECRETS}" \
    --backend "${BACKEND}" \
    --project "${PROJECT_ID}"
  echo "Granted backend ${BACKEND} access to secrets."
fi

echo "Done. Trigger a new App Hosting rollout in Firebase console."
