# All-Cloudflare Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move both buildaloud projects from personal GitHub + Vercel to `buildaloud` GitHub org + Cloudflare (Pages + Workers). $0/month hosting with full collaboration for Andrew.

**Architecture:** Static Astro blog on Cloudflare Pages. Next.js skills marketplace on Cloudflare Workers via OpenNext adapter. Build-time data generation replaces runtime filesystem reads. DNS stays in Cloudflare.

**Tech Stack:** Astro 5, Next.js 16, OpenNext (`@opennextjs/cloudflare`), Wrangler, Cloudflare Pages/Workers

**Design doc:** `docs/plans/2026-03-01-cloudflare-migration-design.md`

---

### Task 1: Transfer repos to buildaloud GitHub org

**Context:** Both repos currently live under `chadfurman/*`. Transfer them to the `buildaloud` org so Andrew can be added as an org member with write access to everything.

**Step 1: Verify the buildaloud org exists on GitHub**

Run: `gh api /orgs/buildaloud --jq '.login'`
Expected: `buildaloud`

If it doesn't exist yet, create it:
Run: `gh api --method POST /user/orgs -f login=buildaloud -f name="Build Aloud"`

**Step 2: Transfer build-in-public-site**

Run:
```bash
gh api --method POST /repos/chadfurman/build-in-public-site/transfer \
  -f new_owner=buildaloud
```
Expected: 202 response, repo is now at `buildaloud/build-in-public-site`

**Step 3: Transfer skills-marketplace**

Run:
```bash
gh api --method POST /repos/chadfurman/skills-marketplace/transfer \
  -f new_owner=buildaloud
```
Expected: 202 response, repo is now at `buildaloud/skills-marketplace`

**Step 4: Add Andrew as org member**

Run:
```bash
gh api --method PUT /orgs/buildaloud/memberships/a-pasquale \
  -f role=member
```
Expected: Andrew receives org invite

**Step 5: Update local git remotes for build-in-public-site**

Run (from `/Users/chadfurman/projects/business-brainstorm/build-in-public-site`):
```bash
git remote set-url origin git@github.com-personal:buildaloud/build-in-public-site.git
git remote -v
```
Expected: Both fetch and push point to `buildaloud/build-in-public-site`

**Step 6: Update local git remotes for skills-marketplace**

Run (from `/Users/chadfurman/projects/business-brainstorm/skills-marketplace`):
```bash
git remote set-url origin git@github.com-personal:buildaloud/skills-marketplace.git
git remote -v
```
Expected: Both fetch and push point to `buildaloud/skills-marketplace`

**Step 7: Verify both remotes work**

Run (from each repo):
```bash
git fetch origin
```
Expected: No errors. GitHub redirects handle the old URLs during transition.

---

### Task 2: Migrate build-in-public-site to Cloudflare Pages

**Files:**
- Delete: `vercel.json`
- Delete: `.vercel/` directory (already gitignored)

**Step 1: Delete Vercel config files**

Run (from `build-in-public-site/`):
```bash
rm vercel.json
rm -rf .vercel/
```

**Step 2: Commit the removal**

```bash
git add -A
git commit -m "chore: remove Vercel config for Cloudflare Pages migration"
```

**Step 3: Create Cloudflare Pages project via dashboard**

This is a manual step (Cloudflare doesn't have a CLI for Pages project creation with Git integration):

1. Go to https://dash.cloudflare.com → Workers & Pages → Create
2. Select "Pages" → Connect to Git
3. Authorize the `buildaloud` GitHub org
4. Select `buildaloud/build-in-public-site`
5. Build settings:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (project root)
6. Deploy

**Step 4: Configure custom domain**

In Cloudflare Pages project settings → Custom Domains:
1. Add `buildaloud.ai`
2. CF auto-configures DNS since the domain is already in Cloudflare

**Step 5: Verify the site loads**

Run:
```bash
curl -sI https://buildaloud.ai | head -5
```
Expected: `HTTP/2 200` with Cloudflare headers

**Step 6: Push a test change to verify auto-deploy**

```bash
git push origin main
```
Expected: Cloudflare Pages triggers a build. Check status in CF dashboard → Workers & Pages → build-in-public-site → Deployments.

---

### Task 3: Skills marketplace — build-time data generation

**Files:**
- Create: `site/scripts/generate-skills-data.ts`
- Modify: `site/src/lib/skills.ts`
- Modify: `site/.gitignore` (add `src/generated/`)
- Modify: `site/package.json` (add `prebuild` script)

**Step 1: Add `src/generated/` to site/.gitignore**

Append to `site/.gitignore`:
```
# Generated at build time
/src/generated/
```

**Step 2: Create the data generation script**

Create `site/scripts/generate-skills-data.ts`:

```typescript
import fs from "fs";
import path from "path";

const SKILLS_DIR = path.join(__dirname, "..", "..", "skills");
const OUTPUT_DIR = path.join(__dirname, "..", "src", "generated");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "skills-data.json");

interface SkillMetadata {
  name: string;
  slug: string;
  description: string;
  sourceRepo: string;
  githubUrl: string;
  auditedCommit: string;
  version: string | null;
  language: string | null;
  stars: number;
  license: string | null;
  category: string | null;
  tags: string[];
  hasSkillMd: boolean;
  author: string;
  auditedAt: string;
  lastUpdated: string | null;
}

interface AuditResult {
  taxonomyVersion: string;
  commit: string;
  auditedAt: string;
  auditor: string;
  summary: string;
  capabilities: string[];
  useCases?: string[];
  scores: {
    maliciousIntent: number;
    inherentCapability: number;
    misuseSurface: number;
    overallExposure: number;
  };
  findings: Array<{
    type: string;
    severity: string;
    intentClassification: string;
    description: string;
    location: string;
    evidence: string;
  }>;
  notDetected: Array<string | { astId: string; description: string }>;
}

interface SkillWithAudit {
  metadata: SkillMetadata;
  audit: AuditResult;
}

function loadAllSkills(): SkillWithAudit[] {
  if (!fs.existsSync(SKILLS_DIR)) return [];

  const slugs = fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const skills: SkillWithAudit[] = [];

  for (const slug of slugs) {
    const dir = path.join(SKILLS_DIR, slug);
    const metadataPath = path.join(dir, "skill.json");

    if (!fs.existsSync(metadataPath)) continue;

    const metadata: SkillMetadata = JSON.parse(
      fs.readFileSync(metadataPath, "utf-8")
    );

    const files = fs.readdirSync(dir);
    const auditFile = files.find(
      (f) => f.startsWith("audit-") && f.endsWith(".json")
    );
    if (!auditFile) continue;

    const audit: AuditResult = JSON.parse(
      fs.readFileSync(path.join(dir, auditFile), "utf-8")
    );

    skills.push({ metadata, audit });
  }

  // Sort by stars descending, then by name
  skills.sort(
    (a, b) =>
      b.metadata.stars - a.metadata.stars ||
      a.metadata.name.localeCompare(b.metadata.name)
  );

  return skills;
}

// Main
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const skills = loadAllSkills();
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(skills));
console.log(`Generated skills-data.json with ${skills.length} skills`);
```

**Step 3: Add prebuild script to site/package.json**

Change the `scripts` section in `site/package.json`:

```json
"scripts": {
  "dev": "next dev",
  "prebuild": "npx tsx scripts/generate-skills-data.ts",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit"
}
```

**Step 4: Rewrite `site/src/lib/skills.ts` to use generated data**

Replace the entire file:

```typescript
import skillsData from "@/generated/skills-data.json";

export interface SkillMetadata {
  name: string;
  slug: string;
  description: string;
  sourceRepo: string;
  githubUrl: string;
  auditedCommit: string;
  version: string | null;
  language: string | null;
  stars: number;
  license: string | null;
  category: string | null;
  tags: string[];
  hasSkillMd: boolean;
  author: string;
  auditedAt: string;
  lastUpdated: string | null;
}

export interface AuditFinding {
  type: string;
  severity: "info" | "low" | "medium" | "high" | "critical";
  intentClassification: "malicious" | "negligent" | "accidental";
  description: string;
  location: string;
  evidence: string;
}

export interface AuditScores {
  maliciousIntent: number;
  inherentCapability: number;
  misuseSurface: number;
  overallExposure: number;
}

export interface AuditResult {
  taxonomyVersion: string;
  commit: string;
  auditedAt: string;
  auditor: string;
  summary: string;
  capabilities: string[];
  useCases?: string[];
  scores: AuditScores;
  findings: AuditFinding[];
  notDetected: (string | { astId: string; description: string })[];
}

export interface SkillWithAudit {
  metadata: SkillMetadata;
  audit: AuditResult;
}

const allSkills: SkillWithAudit[] = skillsData as SkillWithAudit[];

/** Load all audited skills (pre-generated at build time) */
export function getAllSkills(): SkillWithAudit[] {
  return allSkills;
}

/** Load a single skill by its slug */
export function getSkillBySlug(slug: string): SkillWithAudit | null {
  return allSkills.find((s) => s.metadata.slug === slug) ?? null;
}

/** Get all unique slugs for static generation */
export function getAllSlugs(): string[] {
  return allSkills.map((s) => s.metadata.slug);
}
```

**Step 5: Enable JSON imports in tsconfig if needed**

Check `site/tsconfig.json` has `resolveJsonModule: true`. If not, add it under `compilerOptions`.

**Step 6: Test the generation locally**

Run (from `site/`):
```bash
npx tsx scripts/generate-skills-data.ts
```
Expected: `Generated skills-data.json with N skills` and file exists at `site/src/generated/skills-data.json`

**Step 7: Test the build locally**

Run (from `site/`):
```bash
npm run build
```
Expected: Build succeeds. The `prebuild` script runs first, generates data, then `next build` completes.

**Step 8: Test dev server**

Run (from `site/`):
```bash
npx tsx scripts/generate-skills-data.ts && npm run dev
```
Open http://localhost:3000 and verify skills load correctly.

**Step 9: Commit**

```bash
git add site/scripts/generate-skills-data.ts site/src/lib/skills.ts site/.gitignore site/package.json
git commit -m "feat: replace runtime fs reads with build-time data generation

Cloudflare Workers has no filesystem access. Generate skills-data.json
at build time from skills/ directory. The prebuild script runs before
every next build."
```

---

### Task 4: Skills marketplace — move security headers to Next.js config

**Files:**
- Modify: `site/next.config.ts`
- Delete: `vercel.json` (after moving headers)

**Step 1: Move headers into next.config.ts**

Replace `site/next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Step 2: Delete vercel.json**

Run (from skills-marketplace root):
```bash
rm vercel.json
```

**Step 3: Delete .vercel directory**

Run (from skills-marketplace root):
```bash
rm -rf .vercel/
```

**Step 4: Test locally**

Run (from `site/`):
```bash
npx tsx scripts/generate-skills-data.ts && npm run dev
```
Check headers:
```bash
curl -sI http://localhost:3000 | grep -i "x-content-type\|x-frame\|x-xss\|referrer\|permissions"
```
Expected: All 5 security headers present.

**Step 5: Commit**

```bash
git add site/next.config.ts vercel.json .vercel/
git commit -m "chore: move security headers to next.config.ts, remove Vercel config

Platform-agnostic headers in Next.js config instead of vercel.json."
```

---

### Task 5: Skills marketplace — add OpenNext Cloudflare adapter

**Files:**
- Modify: `site/package.json` (add dependency)
- Create: `site/wrangler.jsonc`
- Create: `site/open-next.config.ts`

**Step 1: Install OpenNext adapter**

Run (from `site/`):
```bash
npm install --save-dev @opennextjs/cloudflare
```

**Step 2: Create open-next.config.ts**

Create `site/open-next.config.ts`:

```typescript
import { defineConfig } from "@opennextjs/cloudflare";

export default defineConfig({});
```

**Step 3: Create wrangler.jsonc**

Create `site/wrangler.jsonc`:

```jsonc
{
  "name": "skills-marketplace",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-04-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

**Step 4: Add Cloudflare build and preview scripts to package.json**

Update `site/package.json` scripts:

```json
"scripts": {
  "dev": "next dev",
  "prebuild": "npx tsx scripts/generate-skills-data.ts",
  "build": "next build",
  "build:worker": "npm run build && npx opennextjs-cloudflare build",
  "preview": "npm run build:worker && npx wrangler dev",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "deploy": "npm run build:worker && npx wrangler deploy"
}
```

**Step 5: Add `.open-next/` to site/.gitignore**

Append to `site/.gitignore`:
```
# OpenNext build output
/.open-next/
```

**Step 6: Test the OpenNext build locally**

Run (from `site/`):
```bash
npm run build:worker
```
Expected: OpenNext builds successfully, outputs to `.open-next/`

**Step 7: Test with wrangler dev**

Run (from `site/`):
```bash
npx wrangler dev
```
Expected: Site loads at http://localhost:8787. Test:
- Homepage loads (may prompt for basic auth)
- Auth works with buildaloud / andrew20!26chad
- `/api/skills` returns JSON
- `/api/skills/<any-slug>` returns individual skill

**Step 8: Commit**

```bash
git add site/package.json site/wrangler.jsonc site/open-next.config.ts site/.gitignore
git commit -m "feat: add OpenNext Cloudflare adapter

Next.js app now builds for Cloudflare Workers. Use 'npm run preview'
to test locally with wrangler, 'npm run deploy' to deploy."
```

---

### Task 6: Deploy skills marketplace to Cloudflare Workers

**Step 1: Set environment variables as secrets**

Run (from `site/`):
```bash
npx wrangler secret put BASIC_AUTH_USER
# Enter: buildaloud

npx wrangler secret put BASIC_AUTH_PASS
# Enter: the actual password

npx wrangler secret put NEXT_PUBLIC_SITE_URL
# Enter: https://marketplace.buildaloud.ai (or whatever subdomain)
```

**Step 2: Deploy**

Run (from `site/`):
```bash
npm run deploy
```
Expected: Wrangler deploys to Cloudflare Workers. Outputs a `*.workers.dev` URL.

**Step 3: Verify on workers.dev URL**

Open the `*.workers.dev` URL in browser. Test:
- Auth prompt appears
- Login works
- Skills list loads
- Individual skill pages load
- API routes return JSON

**Step 4: Configure custom domain (manual step)**

In Cloudflare dashboard → Workers & Pages → skills-marketplace → Settings → Domains & Routes:
1. Add custom domain (e.g., `marketplace.buildaloud.ai` or `skills.buildaloud.ai`)
2. CF auto-configures DNS

**Step 5: Set up Git integration for auto-deploy**

In Cloudflare dashboard → Workers & Pages → skills-marketplace → Settings → Build:
1. Connect to `buildaloud/skills-marketplace` repo
2. Build command: `cd site && npm install && npm run build:worker`
3. Deploy command: auto (wrangler deploy)

Alternatively, add a GitHub Action for deploy (since Workers Git integration may have limitations with monorepo structure):

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloudflare Workers
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install root deps
        run: npm install
      - name: Generate skills data
        run: cd site && npx tsx scripts/generate-skills-data.ts
      - name: Install site deps
        run: cd site && npm install
      - name: Build and deploy
        run: cd site && npm run build:worker && npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

**Step 6: Verify auto-deploy works**

Push a small change to main and verify Cloudflare deploys automatically.

**Step 7: Commit the GitHub Action**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add Cloudflare Workers deploy action

Auto-deploys to Cloudflare Workers on push to main. Generates skills
data at build time, then builds and deploys via OpenNext + wrangler."
```

---

### Task 7: Update CLAUDE.md files and cleanup

**Files:**
- Modify: `build-in-public-site/CLAUDE.md` — update hosting references from Vercel to Cloudflare Pages
- Modify: `skills-marketplace/CLAUDE.md` — update GitHub account references to buildaloud org
- Modify: `business-brainstorm/CLAUDE.md` — update any references

**Step 1: Update build-in-public-site CLAUDE.md**

Change references from "hosted on Vercel" to "hosted on Cloudflare Pages". Update the deployment workflow section to say Cloudflare Pages instead of Vercel.

**Step 2: Update skills-marketplace CLAUDE.md**

Update the GitHub account section to reference the `buildaloud` org instead of `chadfurman`. Update contributor instructions.

**Step 3: Update .gitignore files**

In both repos, replace `.vercel` entries with Cloudflare equivalents (`.wrangler/` for skills-marketplace).

**Step 4: Commit**

```bash
# In each repo:
git add CLAUDE.md .gitignore
git commit -m "docs: update project docs for Cloudflare + buildaloud org migration"
```

---

### Task 8: Disconnect Vercel (manual)

**Only do this after Tasks 2 and 6 are confirmed working.**

**Step 1: Remove Vercel Git integration**

In Vercel dashboard → each project → Settings → Git:
- Disconnect the repository

**Step 2: Delete Vercel projects**

In Vercel dashboard → each project → Settings → Advanced → Delete Project

**Step 3: Verify everything still works**

- `buildaloud.ai` loads the blog from Cloudflare Pages
- `marketplace.buildaloud.ai` (or chosen subdomain) loads the marketplace from Cloudflare Workers
- Push to main triggers auto-deploy on both
- Andrew can push and trigger deploys

---

## Execution Order Summary

| Task | Description | Depends on |
|------|-------------|------------|
| 1 | Transfer repos to buildaloud org | — |
| 2 | Migrate blog to Cloudflare Pages | Task 1 |
| 3 | Build-time data generation for marketplace | — (can run in parallel with 1-2) |
| 4 | Move security headers to next.config.ts | — (can run in parallel) |
| 5 | Add OpenNext Cloudflare adapter | Tasks 3, 4 |
| 6 | Deploy marketplace to Cloudflare Workers | Tasks 1, 5 |
| 7 | Update docs and cleanup | Tasks 2, 6 |
| 8 | Disconnect Vercel | Tasks 2, 6 (confirmed working) |
