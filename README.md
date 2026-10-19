# BrightLink Technologies — website and CMS

Next.js 15 · Prisma + PostgreSQL · Cloudflare R2 · hand-built CMS at `/admin` (modelled on the Oak Elite Home CMS).
No Payload. **Read `docs/PROGRESS.md` first** — it says what is finished, what is not, and what was and was not tested.

## Run it on your computer

```bash
cp .env.example .env              # then fill in what you have (R2 and SMTP can wait)
docker compose up -d              # PostgreSQL on port 5433
npm install
npx prisma migrate deploy         # creates the tables
npm run db:seed                   # creates the Site settings row
npm run user:create               # asks for your email, name and password
npm run dev                       # http://localhost:3000  ·  CMS: http://localhost:3000/admin
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | development server |
| `npm run typecheck` | TypeScript check |
| `npm test` | unit tests (auth, security, storage keys) |
| `npm run build` | production build (needs internet: it downloads Google Fonts) |
| `npm run db:migrate` | create a new migration after you change `prisma/schema.prisma` |
| `npm run user:create` | add a CMS user, or reset a password |

Deploying: `docs/DEPLOY.md`.
