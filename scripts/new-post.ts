/**
 * Scaffold a new blog post with proper frontmatter.
 *
 * Usage:
 *   npx tsx scripts/new-post.ts "My Post Title" --author "Chad" --tags "tag1,tag2"
 */

const args = process.argv.slice(2);

function getFlag(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

const title = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1]?.startsWith('--') === false) ?? args[0];

if (!title || title.startsWith('--')) {
  console.error('Usage: npx tsx scripts/new-post.ts "Post Title" [--author "Name"] [--tags "tag1,tag2"]');
  process.exit(1);
}

const author = getFlag('author') ?? 'Chad';
const tagsRaw = getFlag('tags');
const tags = tagsRaw ? tagsRaw.split(',').map((t) => t.trim()) : [];

const now = new Date();
const dateStr = now.toISOString().split('T')[0];
const offsetMin = now.getTimezoneOffset();
const sign = offsetMin <= 0 ? '+' : '-';
const absH = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, '0');
const absM = String(Math.abs(offsetMin) % 60).padStart(2, '0');
const isoTimestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}${sign}${absH}:${absM}`;
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const filename = `${dateStr}-${slug}.md`;
const tagsLine = tags.length > 0 ? `tags: [${tags.map((t) => `"${t}"`).join(', ')}]\n` : '';

const content = `---
title: "${title}"
description: ""
pubDate: "${isoTimestamp}"
author: "${author}"
${tagsLine}---

Write your post here.
`;

const fs = await import('node:fs');
const path = await import('node:path');

const dir = path.join(import.meta.dirname, '..', 'src', 'content', 'blog');
fs.mkdirSync(dir, { recursive: true });

const filepath = path.join(dir, filename);
if (fs.existsSync(filepath)) {
  console.error(`File already exists: ${filepath}`);
  process.exit(1);
}

fs.writeFileSync(filepath, content);
console.log(`Created: src/content/blog/${filename}`);
