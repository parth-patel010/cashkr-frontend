#!/usr/bin/env bash
# Remote frontend deploy — runs ON the VPS under flock.
# Env: RELEASE_SHA, RELEASE_TGZ, APP_ROOT, HEALTH_URL, KEEP_RELEASES

set -euo pipefail

RELEASE_SHA="${RELEASE_SHA:?RELEASE_SHA required}"
RELEASE_TGZ="${RELEASE_TGZ:?RELEASE_TGZ required}"
APP_ROOT="${APP_ROOT:-/opt/cashkr/frontend}"
HEALTH_URL="${HEALTH_URL:-https://www.devicekart.in/}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
LOCK_FILE="${LOCK_FILE:-/var/lock/cashkr-frontend-deploy.lock}"
LOG_FILE="${APP_ROOT}/deploy.log"
NGINX_RELOAD="${NGINX_RELOAD:-0}"

RELEASES_DIR="${APP_ROOT}/releases"
CURRENT_LINK="${APP_ROOT}/current"
NEW_RELEASE="${RELEASES_DIR}/${RELEASE_SHA}"

log() {
  local line="[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*"
  echo "$line"
  mkdir -p "$(dirname "$LOG_FILE")"
  echo "$line" >> "$LOG_FILE"
}

die() { log "ERROR: $*"; exit 1; }

health_check() {
  local url="$1"
  local attempts="${2:-8}"
  local i code
  for i in $(seq 1 "$attempts"); do
    code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "$url" || echo 000)"
    if [[ "$code" == "200" ]]; then
      log "Health check OK: $url ($code)"
      return 0
    fi
    log "Health check attempt $i/$attempts got HTTP $code: $url"
    sleep 2
  done
  return 1
}

previous_release() {
  if [[ -L "$CURRENT_LINK" ]]; then
    readlink -f "$CURRENT_LINK" || true
  fi
}

atomic_switch() {
  local target="$1"
  local tmp_link="${CURRENT_LINK}.new"
  ln -sfn "$target" "$tmp_link"
  mv -Tf "$tmp_link" "$CURRENT_LINK"
}

rollback_to() {
  local prev="$1"
  [[ -n "$prev" && -d "$prev" ]] || die "No previous release to roll back to"
  log "Rolling back frontend to $prev"
  atomic_switch "$prev"
  if [[ "$NGINX_RELOAD" == "1" ]]; then
    sudo nginx -t && sudo systemctl reload nginx || true
  fi
  health_check "$HEALTH_URL" 6 || die "Frontend rollback health check failed"
  log "Frontend rollback successful"
}

prune_releases() {
  local keep="$1"
  mapfile -t all < <(ls -1dt "${RELEASES_DIR}"/*/ 2>/dev/null | sed 's:/*$::' || true)
  local count="${#all[@]}"
  (( count <= keep )) && return 0
  local current_real
  current_real="$(readlink -f "$CURRENT_LINK" 2>/dev/null || true)"
  local i
  for (( i=keep; i<count; i++ )); do
    local dir="${all[$i]}"
    [[ "$dir" == "$current_real" ]] && continue
    log "Pruning old release: $dir"
    rm -rf "$dir"
  done
}

deploy_main() {
  [[ -f "$RELEASE_TGZ" ]] || die "Missing release archive: $RELEASE_TGZ"
  mkdir -p "$RELEASES_DIR"

  local prev
  prev="$(previous_release)"
  log "Starting frontend deploy SHA=$RELEASE_SHA previous=${prev:-none}"

  rm -rf "$NEW_RELEASE"
  mkdir -p "$NEW_RELEASE"
  tar -xzf "$RELEASE_TGZ" -C "$NEW_RELEASE"

  # Vite dist contents must include index.html at release root
  if [[ ! -f "${NEW_RELEASE}/index.html" ]]; then
    local inner
    inner="$(find "$NEW_RELEASE" -mindepth 1 -maxdepth 1 -type d | head -n1 || true)"
    if [[ -n "$inner" && -f "${inner}/index.html" ]]; then
      shopt -s dotglob
      mv "$inner"/* "$NEW_RELEASE"/
      rmdir "$inner" 2>/dev/null || rm -rf "$inner"
      shopt -u dotglob
    fi
  fi
  [[ -f "${NEW_RELEASE}/index.html" ]] || die "index.html missing after extract (expected Vite dist)"

  atomic_switch "$NEW_RELEASE"

  if [[ "$NGINX_RELOAD" == "1" ]]; then
    sudo nginx -t && sudo systemctl reload nginx
  fi

  if ! health_check "$HEALTH_URL" 8; then
    log "Frontend health check failed"
    if [[ -n "$prev" ]]; then
      rollback_to "$prev"
    fi
    die "Frontend deploy failed health check for SHA=$RELEASE_SHA"
  fi

  prune_releases "$KEEP_RELEASES"
  log "Frontend deploy SUCCESS SHA=$RELEASE_SHA"
  echo "$RELEASE_SHA" > "${APP_ROOT}/current-sha.txt"
}

mkdir -p "$(dirname "$LOCK_FILE")"
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  die "Another frontend deploy holds $LOCK_FILE"
fi
deploy_main
