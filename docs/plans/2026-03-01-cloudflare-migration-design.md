# All-Cloudflare Migration Design

**Date:** 2026-03-01
**Status:** Approved
**Goal:** Move buildaloud projects from personal GitHub/Vercel to `buildaloud` GitHub org + Cloudflare hosting. Enable full collaboration with Andrew (`a-pasquale`) without exposing personal projects. Cost: $0/month.

## Current State

| Component | Location | Hosting |
|---|---|---|
| build-in-public-site (Astro) | `chadfurman/build-in-public-site` | Vercel (static) |
| skills-marketplace (Next.js) | `chadfurman/skills-marketplace` | Vercel (SSR + API) |
| DNS for buildaloud.ai | Cloudflare | N/A |

Both deploy via Vercel Git webhooks on push to main. No GitHub Actions.

## Target State

| Component | Location | Hosting |
|---|---|---|
| build-in-public-site (Astro) | `buildaloud/build-in-public-site` | Cloudflare Pages |
| skills-marketplace (Next.js) | `buildaloud/skills-marketplace` | Cloudflare Workers (OpenNext) |
| DNS for buildaloud.ai | Cloudflare | No change |

## Section 1: GitHub Org Migration

- Transfer `chadfurman/build-in-public-site` → `buildaloud/build-in-public-site`
- Transfer `chadfurman/skills-marketplace` → `buildaloud/skills-marketplace`
- GitHub preserves redirects from old URLs
- Add `a-pasquale` (Andrew) as org member with write access
- `chadfurman` remains org owner
- Update local git remotes: `github.com-personal:chadfurman/…` → `github.com-personal:buildaloud/…`

## Section 2: build-in-public-site (Astro → Cloudflare Pages)

Minimal changes:
- Delete `vercel.json` and `.vercel/` directory
- Create Cloudflare Pages project connected to `buildaloud/build-in-public-site`
- Build command: `npm run build`, output dir: `dist/`
- Auto-deploys on push to main (same behavior as Vercel)
- Point `buildaloud.ai` DNS to CF Pages project (DNS already in Cloudflare)
- Preview deployments on PRs included free

## Section 3: skills-marketplace (Next.js → Cloudflare Workers)

### 3a: Build-time data generation

**Problem:** Current code reads skill data from filesystem at runtime (`fs.readFileSync` in `lib/skills.ts`). Cloudflare Workers have no filesystem access.

**Solution:** Generate a static JSON file at build time.

- New script: `site/scripts/generate-skills-data.ts`
  - Reads all `skills/*/skill.json` and `audit-*.json` files
  - Writes `site/src/generated/skills-data.json`
- Add `"prebuild": "tsx scripts/generate-skills-data.ts"` to `site/package.json`
- Modify `site/src/lib/skills.ts` to import from generated JSON instead of `fs`
- Add `site/src/generated/` to `.gitignore` (regenerated on every build)

### 3b: OpenNext adapter

- Install `@opennextjs/cloudflare`
- Create `wrangler.toml` with `nodejs_compat` compatibility flag
- Middleware (basic auth) works as-is on Workers
- API routes (`/api/skills`, `/api/skills/[slug]`) work as-is

### 3c: Security headers

Move from `vercel.json` headers config to either:
- `wrangler.toml` headers, or
- Next.js `headers()` function in `next.config.ts` (platform-agnostic, preferred)

### 3d: Cleanup

- Delete `vercel.json` and `.vercel/` directory
- Remove any Vercel-specific config from `next.config.ts`

## Section 4: Audit Pipeline

Pipeline changes are minimal:
- Auto-commit logic stays the same (commits to git, platform-agnostic)
- `git push` triggers Cloudflare webhook instead of Vercel webhook
- Pre-push hook (TypeScript typecheck) keeps working unchanged
- The `prebuild` step ensures skill data is regenerated on every deploy

## Section 5: Environment Variables

Move from Vercel dashboard → Cloudflare dashboard:
- `BASIC_AUTH_USER` / `BASIC_AUTH_PASS` → Cloudflare Workers env vars (or wrangler.toml secrets)
- `NEXT_PUBLIC_SITE_URL` → Cloudflare Workers env var
- `GITHUB_TOKEN` → Only needed for local pipeline runs (not in deployment)

## Section 6: Disconnect Vercel

After Cloudflare is confirmed working:
- Remove Vercel Git integration from both repos
- Delete both Vercel projects from Vercel dashboard
- No more Vercel billing

## Cost

| Item | Cost |
|---|---|
| Cloudflare Pages (blog) | Free |
| Cloudflare Workers (marketplace) | Free (100k req/day) |
| GitHub org (buildaloud) | Free |
| DNS (already Cloudflare) | No change |
| Domain (buildaloud.ai) | Already owned |
| **Total** | **$0/month** |

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| OpenNext adapter compatibility with Next.js 16 | OpenNext docs confirm Next.js 16 support. Test locally with `wrangler dev` before deploying. |
| Build-time data gets stale | Data only changes on commit (audit pipeline). Every push triggers rebuild with fresh data. Same behavior as today. |
| Workers free tier limits (100k req/day) | Current traffic is well below this. Monitor in CF dashboard. |
| Middleware behavior differences | Basic auth is simple — no edge cases. Test auth flow before switching DNS. |
