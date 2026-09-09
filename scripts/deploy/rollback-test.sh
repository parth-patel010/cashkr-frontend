#!/usr/bin/env bash
# Frontend rollback drill — requires ≥2 releases under APP_ROOT.
set -euo pipefail

APP_ROOT="${APP_ROOT:-/opt/cashkr/frontend}"
HEALTH_URL="${HEALTH_URL:-https://www.devicekart.in/}"
CURRENT_LINK="${APP_ROOT}/current"
RELEASES_DIR="${APP_ROOT}/releases"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"; }

[[ -L "$CURRENT_LINK" ]] || { echo "No current symlink"; exit 1; }
CURRENT_REAL="$(readlink -f "$CURRENT_LINK")"
mapfile -t ALL < <(ls -1dt "${RELEASES_DIR}"/*/ 2>/dev/null | sed 's:/*$::')
PREV=""
for dir in "${ALL[@]}"; do
  if [[ "$dir" != "$CURRENT_REAL" ]]; then PREV="$dir"; break; fi
done
[[ -n "$PREV" ]] || { echo "Need at least two releases"; exit 1; }

log "Switch to previous: $PREV"
ln -sfn "$PREV" "${CURRENT_LINK}.new"
mv -Tf "${CURRENT_LINK}.new" "$CURRENT_LINK"
sleep 1
code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "$HEALTH_URL" || echo 000)"
[[ "$code" == "200" ]] || { echo "FAIL previous HTTP $code"; exit 1; }

log "Restore: $CURRENT_REAL"
ln -sfn "$CURRENT_REAL" "${CURRENT_LINK}.new"
mv -Tf "${CURRENT_LINK}.new" "$CURRENT_LINK"
sleep 1
code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "$HEALTH_URL" || echo 000)"
[[ "$code" == "200" ]] || { echo "FAIL restore HTTP $code"; exit 1; }

log "FRONTEND ROLLBACK TEST PASSED"
echo "OK" > "${APP_ROOT}/rollback-test-last-ok.txt"
