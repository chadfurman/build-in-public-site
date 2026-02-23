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
    notes: 'Old two-axis audits are invalid under the new taxonomy. Re-run everything with the new prompt and schema.',
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
    notes: 'Binary 0/100 malicious intent means search-redirect and IDE-backdoor get the same exposure score. Need a CVSS-style impact dimension so malicious findings carry severity (low/medium/high/critical). The intent axis stays binary — either it\'s malicious or it isn\'t — but the *impact* of that malice needs to vary.',
    status: 'pending',
    priority: 'high',
    category: 'product',
    addedBy: 'scout',
    addedDate: '2026-02-23',
    linkedPost: '2026-02-23-we-found-malicious-skills-three-of-them',
  },
  {
    id: 'agent-query-api',
    title: 'Design the agent query API for the marketplace',
    notes: 'Agents need to query the catalog programmatically — filter by AST score, category, framework. The endgame is machine-queryable trust data, not just human-readable pages.',
    status: 'pending',
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
