# Frontend deploy failure drills

Same procedures as backend; paths differ.

Full write-up: keep a copy of the backend doc checklist, substituting:

| Item | Frontend |
|---|---|
| Lock | `/var/lock/cashkr-frontend-deploy.lock` |
| App root | `/opt/cashkr/frontend` |
| Health | `https://www.devicekart.in/` (expect HTTP 200) |
| Rollback script | `/opt/cashkr/frontend/scripts/deploy/rollback-test.sh` |

```bash
# Concurrent deploy rejected
sudo -u deploy flock -n /var/lock/cashkr-frontend-deploy.lock -c 'sleep 60' &
sudo -u deploy env RELEASE_SHA=test RELEASE_TGZ=/tmp/x.tgz APP_ROOT=/opt/cashkr/frontend \
  bash /opt/cashkr/frontend/scripts/deploy/remote-deploy.sh
```

## Checklist

- [ ] Rollback test passed
- [ ] Bad release / failed health leaves previous `current` on a 200 homepage
- [ ] flock rejects overlapping deploy
- [ ] `deploy.log` records SHA + workflow URL
