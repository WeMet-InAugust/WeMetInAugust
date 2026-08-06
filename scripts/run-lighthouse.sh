#!/usr/bin/env bash
# Wrapper to run Lighthouse for the provided URL
# Usage:
#   ./scripts/run-lighthouse.sh https://staging.example.com ./lighthouse-report.json

URL=${1:-${STAGING_URL:-}}
OUT=${2:-lighthouse-report.json}

if [ -z "$URL" ]; then
  echo "Usage: $0 <url> [out.json]"
  exit 1
fi

echo "Running Lighthouse on $URL -> $OUT"
npx -y lighthouse "$URL" --output=json --output-path="$OUT" --only-categories=performance,accessibility,best-practices || true
echo "Lighthouse finished (report at $OUT if generated)."
