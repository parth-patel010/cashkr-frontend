# Production frontend deploy (VPS / Nginx)

Exact-SHA Vite `dist/` built on GitHub Actions, transferred to the VPS, unpacked under `releases/<sha>`, atomic `current` symlink. No app secrets in the artifact.

## Layout

```
/opt/cashkr/frontend/
  releases/<sha>/     # contents of Vite dist/
  current -> releases/<sha>
  deploy.log
```

Nginx `root` (or alias) must be `/opt/cashkr/frontend/current`. See `scripts/deploy/bootstrap-vps.sh` for a snippet.

## Defaults

| Item | Default |
|---|---|
| Health URL | `https://www.devicekart.in/` (HTTP 200) |
| Keep releases | `5` |
| Deploy user | `deploy` |

If production frontend is still only on Vercel, either point DNS/`www` at this Nginx root before enabling the deploy job, or disable the `deploy` job until Nginx is ready.

## One-time VPS

```bash
sudo bash scripts/deploy/bootstrap-vps.sh
# Include /etc/nginx/snippets/cashkr-frontend-root.conf in the www server block
sudo nginx -t && sudo systemctl reload nginx
```

Reuse the same SSH secrets as backend (`VPS_HOST`, `VPS_USER`, `VPS_PORT`, `VPS_SSH_PRIVATE_KEY`, `VPS_SSH_KNOWN_HOSTS`) in the frontend repo’s **`production`** environment.

Optional vars:

| Name | Purpose |
|---|---|
| `FRONTEND_HEALTH_URL` | Override homepage health URL |
| `VITE_API_BASE_URL` | Public API base baked into the build (e.g. `https://devicekart.in/api`) |
| `VITE_MOBILE_APP_API_KEY` | Optional public app key header if used |

## Rollback test

```bash
export APP_ROOT=/opt/cashkr/frontend
export HEALTH_URL=https://www.devicekart.in/
sudo -u deploy bash /opt/cashkr/frontend/scripts/deploy/rollback-test.sh
```

See `scripts/deploy/failure-drills.md`.
