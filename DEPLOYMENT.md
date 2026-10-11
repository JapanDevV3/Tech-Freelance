# Deployment (Docker on a single VPS)

Stack: Caddy (HTTPS) → Next.js app → PostgreSQL. Migrations run automatically on every deploy.

## 1. Prepare the server (Ubuntu 22.04/24.04)

```bash
# Docker Engine + compose plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # log out and back in

# Firewall: SSH + web only. Postgres is bound to 127.0.0.1 and the app is not published.
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw enable
```

Point your domain's DNS **A record** at the server's IP before the first start. Caddy needs it to issue the certificate.

## 2. Configure

```bash
git clone https://github.com/JapanDevV3/Tech-Freelance.git && cd Tech-Freelance
cp .env.example .env
```

Fill in `.env`:

| Variable | Notes |
|----------|-------|
| `SITE_DOMAIN` | e.g. `example.com` (no scheme) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `POSTGRES_PASSWORD` | `openssl rand -base64 24` — set it **before** the first start; the DB keeps the first password |
| `STORAGE_DRIVER` | `local` (uploads kept in the `cfh_uploads` volume) |
| `RATE_LIMIT_DRIVER` | `memory` for one instance, `upstash` + the two Upstash vars for more |
| `R2_PUBLIC_URL` | only if images are served from R2; it is read at **build** time |

## 3. Start / update

```bash
docker compose --profile prod up -d --build
docker compose --profile prod logs -f app
```

To deploy a new version: `git pull && docker compose --profile prod up -d --build`.

## Local development

```bash
docker compose up -d                       # database only, then `npm run dev` on the host
docker compose --profile dev up --build    # db + Next.js dev server in Docker (hot reload)
```

The Docker dev server runs at <http://localhost:3000> (change with `DEV_PORT`), applies migrations on start, and bind-mounts the repo, so edits reload instantly.

- Run **one or the other**: both use port 3000.
- After changing `package.json`/the lockfile: `docker compose --profile dev up --build -V` (`-V` refreshes the container's `node_modules`).
- If edits are not picked up, set `WATCHPACK_POLLING=true`.
- Docker creates empty, root-owned `node_modules/` and `.next/` folders in the repo. If you also run npm on the host, `sudo rm -rf node_modules .next` first (with the container stopped).

## 4. Backups

```bash
# Database
docker compose exec -T db pg_dump -U cfh computer_fix_hub | gzip > backup-$(date +%F).sql.gz

# Uploads (volume name is prefixed with the compose project name, check `docker volume ls`)
docker run --rm -v tech-freelance_cfh_uploads:/data -v "$PWD":/backup alpine \
  tar czf /backup/uploads-$(date +%F).tgz -C /data .
```

Schedule the database dump with cron and copy the files off the server.
