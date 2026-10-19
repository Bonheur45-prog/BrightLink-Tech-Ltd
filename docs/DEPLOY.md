# Deploying BrightLink to the VPS (same pattern as Oak Elite Home)

The build happens on GitHub (not on the VPS). Every push to `main` builds, runs `prisma migrate deploy`, uploads a
release and reloads PM2. Oak Elite Home uses port 3020; BrightLink uses **3021** (`deploy/ecosystem.config.cjs`).

## One-time VPS setup
1. Create the database and a user for it (PostgreSQL), e.g. `brightlink`.
2. `mkdir -p /var/www/brightlink` and create `/var/www/brightlink/.env` from `.env.example` (production values).
3. Add the block from `deploy/Caddyfile.brightlink` to `/etc/caddy/Caddyfile`, then `systemctl reload caddy`.
   **The domain in it is a placeholder: change it to the real one.**
4. Create the first CMS user on the VPS (from a checkout or the release folder): `npm run user:create`.

## GitHub secrets (Settings → Secrets and variables → Actions)
`DATABASE_URL`, `R2_PUBLIC_HOSTNAME`, `SITE_URL`, `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

## Cloudflare R2
- Create a bucket and a custom domain for it (e.g. `media.<yourdomain>`) so Cloudflare caches the files.
- API token with Object Read & Write on that bucket → `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`.
- **CORS rule (needed for video uploads, which go from the browser straight to R2):** allow origin = your site
  address, methods `PUT` and `GET`, headers `*`.
