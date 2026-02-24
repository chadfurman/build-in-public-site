/**
 * Scout Comment Reply Bot
 *
 * Fetches GitHub Discussions (Giscus comments) on the build-in-public-site repo,
 * filters out low-effort comments and already-replied threads, generates Scout-voice
 * replies via Anthropic API, and posts them as the scout-buildaloud bot account.
 *
 * Run via: npx tsx scripts/scout-replies.ts
 * Required env vars: SCOUT_GITHUB_TOKEN, ANTHROPIC_API_KEY
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

// ─── Constants ───────────────────────────────────────────────────────────────

const REPO_OWNER = 'chadfurman';
const REPO_NAME = 'build-in-public-site';
const CATEGORY_ID = 'DIC_kwDORVwLe84C282K'; // General category from BlogPost.astro
const BOT_LOGIN = 'scout-buildaloud';
const GITHUB_API = 'https://api.github.com/graphql';
const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';
const MAX_TOKENS = 400;
const POST_DELAY_MS = 2000;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Author {
  login: string;
}

interface ReplyNode {
  author: Author;
}

interface Comment {
  id: string;
  body: string;
  author: Author;
  replies: {
    nodes: ReplyNode[];
  };
}

interface Discussion {
  id: string;
  url: string;
  comments: {
    nodes: Comment[];
  };
}

interface DiscussionsResponse {
  data: {
    repository: {
      discussions: {
        nodes: Discussion[];
      };
    };
  };
  errors?: Array<{ message: string }>;
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
  error?: { message: string };
}

// ─── Counters ─────────────────────────────────────────────────────────────────

const stats = {
  replied: 0,
  skippedAlreadyReplied: 0,
  skippedLowEffort: 0,
  skippedBotOwn: 0,
  skippedNoPost: 0,
};

// ─── Low-effort Detection ─────────────────────────────────────────────────────

const LOW_EFFORT_OPENERS = [
  'great', 'nice', 'cool', 'awesome', 'amazing', 'wow',
  'thanks', 'thank you', 'good', 'love this', 'well done',
];

function stripMarkdownAndUrls(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, '')         // URLs
    .replace(/!\[.*?\]\(.*?\)/g, '')         // image links
    .replace(/\[.*?\]\(.*?\)/g, '')          // links
    .replace(/```[\s\S]*?```/g, '')          // code blocks
    .replace(/`[^`]*`/g, '')                 // inline code
    .replace(/#{1,6}\s/g, '')               // headers
    .replace(/[*_~`]/g, '')                  // markdown emphasis
    .replace(/\s+/g, ' ')
    .trim();
}

function isLowEffort(body: string): boolean {
  if (body.length < 20) return true;

  const stripped = stripMarkdownAndUrls(body);
  if (stripped.length < 15) return true;

  const lower = stripped.toLowerCase().trim();
  for (const opener of LOW_EFFORT_OPENERS) {
    if (lower.startsWith(opener)) {
      const remainder = lower.slice(opener.length).trim();
      if (remainder.length < 15) return true;
    }
  }

  return false;
}

// ─── GitHub GraphQL ───────────────────────────────────────────────────────────

async function githubGraphQL<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const token = process.env.SCOUT_GITHUB_TOKEN;
  if (!token) throw new Error('SCOUT_GITHUB_TOKEN env var not set');

  const res = await fetch(GITHUB_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'scout-reply-bot/1.0',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json() as T & { errors?: Array<{ message: string }> };
  if ((data as { errors?: Array<{ message: string }> }).errors?.length) {
    const msgs = (data as { errors: Array<{ message: string }> }).errors.map((e) => e.message).join('; ');
    throw new Error(`GitHub GraphQL errors: ${msgs}`);
  }

  return data;
}

async function fetchDiscussions(): Promise<Discussion[]> {
  const query = `
    query($owner: String!, $name: String!, $categoryId: ID!) {
      repository(owner: $owner, name: $name) {
        discussions(
          first: 50
          categoryId: $categoryId
          orderBy: { field: UPDATED_AT, direction: DESC }
        ) {
          nodes {
            id
            url
            comments(first: 100) {
              nodes {
                id
                body
                author {
                  login
                }
                replies(first: 50) {
                  nodes {
                    author {
                      login
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await githubGraphQL<DiscussionsResponse>(query, {
    owner: REPO_OWNER,
    name: REPO_NAME,
    categoryId: CATEGORY_ID,
  });

  return data.data.repository.discussions.nodes;
}

async function postReply(discussionId: string, replyToId: string, body: string): Promise<void> {
  const mutation = `
    mutation($discussionId: ID!, $replyToId: ID!, $body: String!) {
      addDiscussionComment(input: {
        discussionId: $discussionId
        replyToId: $replyToId
        body: $body
      }) {
        comment {
          id
        }
      }
    }
  `;

  await githubGraphQL(mutation, { discussionId, replyToId, body });
}

// ─── Post Resolution ──────────────────────────────────────────────────────────

function resolvePostFromDiscussionUrl(discussionUrl: string): string | null {
  // Giscus maps pathnames — the discussion title/URL includes the blog path
  // e.g. https://github.com/chadfurman/build-in-public-site/discussions/42
  // The discussion URL itself doesn't contain the post slug.
  // Giscus uses data-mapping="pathname" which means the discussion body/title
  // contains the original page pathname like /blog/2026-02-23-the-broker-is-live
  //
  // However, we only have the discussion URL here (not the body).
  // The plan says: "Resolve the post slug from the discussion URL (pathname = /blog/<slug>)"
  // But GitHub discussion URLs don't contain the blog path — Giscus stores the
  // page pathname as the discussion title.
  //
  // We need to fetch the discussion title to extract the slug.
  return null; // handled in fetchDiscussionTitle
}

async function fetchDiscussionTitle(discussionId: string): Promise<string | null> {
  const query = `
    query($id: ID!) {
      node(id: $id) {
        ... on Discussion {
          title
        }
      }
    }
  `;

  interface TitleResponse {
    data: {
      node: {
        title: string;
      };
    };
  }

  const data = await githubGraphQL<TitleResponse>(query, { id: discussionId });
  return data.data.node?.title ?? null;
}

function slugFromTitle(title: string): string | null {
  // Giscus sets discussion title to the page pathname.
  // Actual format observed: "blog/2026-02-23-the-broker-is-live/" (no leading slash, trailing slash)
  const match = title.match(/\/?blog\/([^/\s]+)/);
  return match ? match[1] : null;
}

function readPostContent(slug: string): string | null {
  const blogDir = path.join(REPO_ROOT, 'src', 'content', 'blog');
  const filePath = path.join(blogDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    // Try with trailing slash stripped or other variations
    return null;
  }

  return fs.readFileSync(filePath, 'utf-8');
}

function getRecentPostSummaries(excludeSlug: string | null, count = 3): string {
  const blogDir = path.join(REPO_ROOT, 'src', 'content', 'blog');
  const files = fs.readdirSync(blogDir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .reverse();

  const summaries: string[] = [];

  for (const file of files) {
    if (summaries.length >= count) break;
    const slug = file.replace(/\.md$/, '');
    if (excludeSlug && slug === excludeSlug) continue;

    const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    const descMatch = content.match(/^description:\s*["']?(.+?)["']?\s*$/m);

    if (titleMatch) {
      const title = titleMatch[1];
      const desc = descMatch ? descMatch[1] : '';
      summaries.push(`- **${title}**${desc ? `: ${desc}` : ''}`);
    }
  }

  return summaries.join('\n');
}

// ─── Anthropic API ────────────────────────────────────────────────────────────

function readPersonality(): string {
  const personalityPath = path.join(REPO_ROOT, 'PERSONALITY.md');
  return fs.readFileSync(personalityPath, 'utf-8');
}

async function generateReply(
  personalityContent: string,
  postContent: string,
  commentBody: string,
  recentPostSummaries: string,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY env var not set');

  const systemPrompt = `${personalityContent}

---

You are replying to a comment on Scout's blog. Write Scout's reply following these rules:
- Direct, dry, technical tone — no hype, no emoji, no filler sign-offs
- 1-3 short paragraphs, under 200 words total
- No "Great question!" or "Thanks for the comment!" openers
- No sign-off filler like "Keep building!" or "Cheers!"
- Be substantive — engage with the actual content of the comment
- Write as Scout in first person`;

  const userPrompt = `## Recent posts (for context)
${recentPostSummaries}

## Post being commented on
${postContent}

## Comment to reply to
${commentBody}

Write Scout's reply.`;

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json() as AnthropicResponse;

  if (data.error) {
    throw new Error(`Anthropic API error: ${data.error.message}`);
  }

  const textBlock = data.content.find((c) => c.type === 'text');
  if (!textBlock) throw new Error('No text content in Anthropic response');

  return textBlock.text.trim();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Scout Reply Bot starting...');

  const personalityContent = readPersonality();
  console.log('Loaded PERSONALITY.md');

  let discussions: Discussion[];
  try {
    discussions = await fetchDiscussions();
  } catch (err) {
    console.error('Failed to fetch discussions:', err);
    process.exit(1);
  }

  console.log(`Found ${discussions.length} discussions`);

  for (const discussion of discussions) {
    // Fetch title to resolve slug (Giscus sets title = page pathname)
    let slug: string | null = null;
    let postContent: string | null = null;

    try {
      const title = await fetchDiscussionTitle(discussion.id);
      if (title) {
        slug = slugFromTitle(title);
        if (slug) {
          postContent = readPostContent(slug);
        }
      }
    } catch (err) {
      console.warn(`Could not resolve post for discussion ${discussion.id}:`, err);
    }

    if (!postContent) {
      console.log(`Skipping discussion ${discussion.id} — post not found (slug: ${slug ?? 'unknown'})`);
      stats.skippedNoPost += discussion.comments.nodes.length;
      continue;
    }

    const recentSummaries = getRecentPostSummaries(slug, 3);

    for (const comment of discussion.comments.nodes) {
      // Skip bot's own comments
      if (comment.author.login === BOT_LOGIN) {
        stats.skippedBotOwn++;
        continue;
      }

      // Skip if already replied by bot
      const alreadyReplied = comment.replies.nodes.some(
        (r) => r.author.login === BOT_LOGIN,
      );
      if (alreadyReplied) {
        stats.skippedAlreadyReplied++;
        continue;
      }

      // Skip low-effort comments
      if (isLowEffort(comment.body)) {
        stats.skippedLowEffort++;
        console.log(`Skipping low-effort comment ${comment.id}: "${comment.body.slice(0, 60)}..."`);
        continue;
      }

      // Generate and post reply
      try {
        console.log(`Generating reply for comment ${comment.id}...`);
        const replyBody = await generateReply(
          personalityContent,
          postContent,
          comment.body,
          recentSummaries,
        );

        await postReply(discussion.id, comment.id, replyBody);
        stats.replied++;
        console.log(`Posted reply to comment ${comment.id}`);

        // Pause between posts
        await new Promise((resolve) => setTimeout(resolve, POST_DELAY_MS));
      } catch (err) {
        console.error(`Error replying to comment ${comment.id}:`, err);
        // Continue — don't abort the run for one failed comment
      }
    }
  }

  console.log('\n── Summary ──────────────────────────────');
  console.log(`Replies posted:          ${stats.replied}`);
  console.log(`Skipped (already replied): ${stats.skippedAlreadyReplied}`);
  console.log(`Skipped (low-effort):    ${stats.skippedLowEffort}`);
  console.log(`Skipped (bot own):       ${stats.skippedBotOwn}`);
  console.log(`Skipped (no post found): ${stats.skippedNoPost}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
