/**
 * TODO tracker for Build in the Open.
 *
 * Scout can add items here during blog post creation — see the new-blog-post skill.
 * Keep entries honest and concrete. No vague "improve X" items.
 *
 * Statuses: "pending" | "in-progress" | "done"
 * Priority:  "high" | "medium" | "low"
 * Category:  "product" | "content" | "infrastructure" | "marketing"
 * addedBy:   "scout" | "chad"
 */

export interface TodoItem {
  id: string;
  title: string;
  notes?: string;
  status: 'pending' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  category: 'product' | 'content' | 'infrastructure' | 'marketing';
  addedBy: 'scout' | 'chad';
  addedDate: string; // YYYY-MM-DD
  linkedPost?: string; // slug of the post where this was mentioned
}

export const todos: TodoItem[] = [
  // ── IN PROGRESS ──────────────────────────────────────────────
  {
    id: 'ast-reaudit',
    title: 'Re-audit all skills under AST v1.0',
    notes: '398 skills audited under AST v1.0. ~200K remaining in queue. Pipeline is running incrementally.',
    status: 'in-progress',
    priority: 'high',
    category: 'product',
    addedBy: 'scout',
    addedDate: '2026-02-22',
    linkedPost: '2026-02-22-we-rewrote-the-security-scoring-here-s-why',
  },

  // ── PENDING ───────────────────────────────────────────────────
  {
    id: 'scriptable-image-api',
    title: 'Pick a scriptable image generation API',
    notes: 'OpenArt is a multi-model aggregator (Flux, SD3.5, DALL-E 3, etc.) — not just Stability AI. Blog post claim that "OpenArt uses Stability AI under the hood" is an oversimplification. For automation, we need a direct API. Top candidates: (1) fal.ai — Flux Schnell at ~$0.002/image, also has video models (WAN 2.1, Kling) under the same API. (2) Replicate — Flux Schnell ~$0.003/image, huge model selection, simple REST API. (3) Stability AI direct — $0.03-$0.08/image, but their video API is deprecated. At our volume (a few images per post), cost is negligible on any provider. fal.ai has an edge because it covers image AND video under one API. Self-hosting (RunPod ~$0.20/hr) only makes sense at high volume.',
    status: 'pending',
    priority: 'medium',
    category: 'infrastructure',
    addedBy: 'chad',
    addedDate: '2026-02-22',
    linkedPost: '2026-02-22-the-part-of-the-pipeline-i-don-t-control-yet',
  },
  {
    id: 'video-pipeline',
    title: 'Automate the video publishing pipeline',
    notes: 'Blog post → extract hook → generate visuals → assemble video → post to TikTok + YouTube Shorts. Each step is scriptable. Currently all manual. For video generation: Stability AI deprecated their video API (July 2025). Best scriptable options: fal.ai has WAN 2.1 (~$0.20-$0.40/video) and Kling 2.5/3.0 under one API. Replicate also hosts video models. fal.ai is the current frontrunner since it covers both image and video, avoiding two providers.',
    status: 'pending',
    priority: 'medium',
    category: 'content',
    addedBy: 'chad',
    addedDate: '2026-02-22',
    linkedPost: '2026-02-22-the-part-of-the-pipeline-i-don-t-control-yet',
  },
  {
    id: 'marketplace-public',
    title: 'Remove basic auth from marketplace.buildaloud.ai',
    notes: 'Site is live but password-protected. Once AST v1.0 re-audit is complete and the UI shows the new scores, open it up.',
    status: 'pending',
    priority: 'high',
    category: 'product',
    addedBy: 'scout',
    addedDate: '2026-02-22',
    linkedPost: '2026-02-22-the-marketplace-is-live-behind-a-password',
  },
  {
    id: 'malicious-severity-model',
    title: 'Add severity gradations to malicious intent scoring',
    notes: 'Implemented: maliciousIntentScore is now max(severity_weight) across malicious findings (low=5, medium=20, high=50, critical=100). Hidden affiliate redirect scores 5, credential harvesting scores 50, persistent backdoor scores 100. Prompt updated in pipeline/prompts/security-audit.md. New audits will use severity-weighted scoring; existing audits retain old scores until re-audited.',
    status: 'done',
    priority: 'high',
    category: 'product',
    addedBy: 'scout',
    addedDate: '2026-02-23',
    linkedPost: '2026-02-23-not-all-malicious-is-equal',
  },
  {
    id: 'agent-query-api',
    title: 'Design the agent query API for the marketplace',
    notes: 'MCP broker (mcp.buildaloud.ai) covers discovery and audit queries. Remaining gap: authenticated API for paid tiers — filter by AST score, category, framework with Bearer token auth.',
    status: 'in-progress',
    priority: 'high',
    category: 'product',
    addedBy: 'scout',
    addedDate: '2026-02-22',
  },
  {
    id: 'marketplace-category-filter',
    title: 'Add category and AST-type filtering to the marketplace UI',
    notes: 'Current site has danger-level filters. Needs category browsing and per-AST-type filtering (e.g. "show me only skills with no AST-02 findings").',
    status: 'pending',
    priority: 'medium',
    category: 'product',
    addedBy: 'scout',
    addedDate: '2026-02-22',
  },
  {
    id: 'stripe-integration',
    title: 'Implement Stripe payment integration',
    notes: 'No payment code exists yet. Needed for creator subscriptions (trust badges, re-audits) and team API access tiers. Prerequisite for any revenue.',
    status: 'pending',
    priority: 'high',
    category: 'product',
    addedBy: 'scout',
    addedDate: '2026-02-23',
    linkedPost: '2026-02-23-who-pays-to-secure-the-keg',
  },
  {
    id: 'api-key-management',
    title: 'Build API key management for marketplace',
    notes: 'Can\'t sell API access without it. Agents need to authenticate with Bearer tokens to query trust data before skill installation.',
    status: 'pending',
    priority: 'high',
    category: 'product',
    addedBy: 'scout',
    addedDate: '2026-02-23',
    linkedPost: '2026-02-23-who-pays-to-secure-the-keg',
  },
  {
    id: 'b2b-outreach',
    title: 'Start first B2B conversation with an agent framework',
    notes: 'The platform licensing thesis is untested. Pick one agent framework (LangChain, CrewAI, AutoGen, etc.), show them the audit data, see if the pitch lands.',
    status: 'pending',
    priority: 'medium',
    category: 'marketing',
    addedBy: 'scout',
    addedDate: '2026-02-23',
    linkedPost: '2026-02-23-who-pays-to-secure-the-keg',
  },
  {
    id: 'pricing-page',
    title: 'Create a pricing page for the marketplace',
    notes: 'Value prop isn\'t articulated anywhere except the blog. Need a public pricing page with creator, team, and platform tiers.',
    status: 'pending',
    priority: 'medium',
    category: 'marketing',
    addedBy: 'scout',
    addedDate: '2026-02-23',
    linkedPost: '2026-02-23-who-pays-to-secure-the-keg',
  },
  {
    id: 'registry-submissions',
    title: 'Submit MCP broker to external registries',
    notes: 'Submit mcp.buildaloud.ai to smithery.ai, mcp.so, and glama.ai. This is how agents outside Claude Code discover the broker. One-time setup per registry.',
    status: 'pending',
    priority: 'medium',
    category: 'marketing',
    addedBy: 'scout',
    addedDate: '2026-02-23',
    linkedPost: '2026-02-23-the-broker-is-live',
  },
  {
    id: 'e2e-relevance-tests',
    title: 'Add relevance assertions to E2E search tests',
    notes: 'Current E2E tests check that search_skills returns something, not that it returns the right things. Need assertions like: query "send slack message" → lettabot appears in top 5. Score compression (80-84%) means top-N presence, not rank-1 assertions.',
    status: 'pending',
    priority: 'medium',
    category: 'infrastructure',
    addedBy: 'scout',
    addedDate: '2026-02-23',
  },
  {
    id: 'use-cases-ui',
    title: 'Surface useCases field in skill detail page',
    notes: 'useCases was added to audit JSON and is used for search indexing. Should also display on the skill detail page — a "Use when you need to:" section above the capabilities list. Helps humans quickly understand what the skill is for.',
    status: 'pending',
    priority: 'low',
    category: 'product',
    addedBy: 'scout',
    addedDate: '2026-02-23',
  },
  {
    id: 'per-post-og',
    title: 'Generate per-post OG images at build time',
    notes: 'Using satori + sharp to render the post title and Scout branding into a static image at build time. No API cost, runs during astro build.',
    status: 'pending',
    priority: 'low',
    category: 'infrastructure',
    addedBy: 'scout',
    addedDate: '2026-02-22',
    linkedPost: '2026-02-22-the-part-of-the-pipeline-i-don-t-control-yet',
  },
  {
    id: 'on-demand-audit-broker',
    title: 'Wire broker to trigger on-demand audits for unknown skills',
    notes: 'When an agent queries a skill not yet in the catalog, broker should trigger an audit and return the result instead of "not found." Cache results for future queries. This is the core of the audit-on-demand pivot.',
    status: 'pending',
    priority: 'high',
    category: 'product',
    addedBy: 'scout',
    addedDate: '2026-03-01',
    linkedPost: '2026-03-02-we-re-moving-to-cloudflare-and-rethinking-everything-that-costs-money',
  },
  {
    id: 'delete-vercel-projects',
    title: 'Delete old Vercel projects after confirming Cloudflare stability',
    notes: 'Both sites are on Cloudflare Pages now. Vercel projects still exist. Delete them once CF is confirmed stable for a few days.',
    status: 'pending',
    priority: 'low',
    category: 'infrastructure',
    addedBy: 'scout',
    addedDate: '2026-03-01',
    linkedPost: '2026-03-02-we-re-moving-to-cloudflare-and-rethinking-everything-that-costs-money',
  },
  {
    id: 'youtube-channel',
    title: 'Publish first video to YouTube channel',
    notes: 'Channel is set up but pending 24-hour verification. First video (from the brainstorm session) needs captions and text overlay before posting.',
    status: 'pending',
    priority: 'medium',
    category: 'marketing',
    addedBy: 'chad',
    addedDate: '2026-02-21',
    linkedPost: '2026-02-21-i-have-a-face-now',
  },
];
