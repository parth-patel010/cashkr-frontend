#!/usr/bin/env bash
# One-time VPS bootstrap for frontend static releases (Nginx root → current).
# Usage: sudo ./scripts/deploy/bootstrap-vps.sh

set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-deploy}"
APP_ROOT="${APP_ROOT:-/opt/cashkr/frontend}"

id -u "$DEPLOY_USER" >/dev/null 2>&1 || useradd --system --create-home --shell /bin/bash "$DEPLOY_USER"

mkdir -p "${APP_ROOT}/releases"
touch /var/lock/cashkr-frontend-deploy.lock
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "$APP_ROOT"
chown "${DEPLOY_USER}:${DEPLOY_USER}" /var/lock/cashkr-frontend-deploy.lock

NGINX_SNIPPET="/etc/nginx/snippets/cashkr-frontend-root.conf"
if [[ ! -f "$NGINX_SNIPPET" ]]; then
  mkdir -p /etc/nginx/snippets
  cat > "$NGINX_SNIPPET" <<'EOF'
# Include from your server block:
#   include /etc/nginx/snippets/cashkr-frontend-root.conf;
root /opt/cashkr/frontend/current;
index index.html;
location / {
  try_files $uri $uri/ /index.html;
}
EOF
  echo "Wrote $NGINX_SNIPPET — include it in your www.devicekart.in server block"
fi

echo "Frontend bootstrap OK: $APP_ROOT"
echo "Nginx must use root /opt/cashkr/frontend/current (symlink)."
