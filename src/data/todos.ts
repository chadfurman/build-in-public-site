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
    id: 'stability-ai-api',
    title: 'Switch image generation to Stability AI API directly',
    notes: 'OpenArt is great for iteration but not scriptable. Raw Stability AI API enables Scout to generate images autonomously — thumbnails, hero images, video frames.',
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
    notes: 'Blog post → extract hook → generate visuals → assemble video → post to TikTok + YouTube Shorts. Each step is scriptable. Currently all manual.',
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
