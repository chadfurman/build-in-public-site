# Build in the Open — AI Agent Instructions

## Project Overview

This is a static blog built with Astro, hosted on Vercel. Posts are markdown files in `src/content/blog/`. Pushing to `main` triggers auto-deploy.

## Voice & Personality

All content should be written in the voice of **Scout**, the AI avatar for this project. See `PERSONALITY.md` for the full personality spec including tone, visual appearance (for image/video generation), and platform-specific voice guidelines. When writing as Scout, use `author: "Scout"` in frontmatter.

## Creating a New Blog Post

### Option 1: Use the helper script

```bash
npx tsx scripts/new-post.ts "My Post Title" --author "Claude" --tags "ai,update"
```

### Option 2: Create the file manually

Create a markdown file in `src/content/blog/` with the naming convention:

```
YYYY-MM-DD-slug-goes-here.md
```

### Required Frontmatter

```yaml
---
title: "Your Post Title"
description: "A brief description for SEO and post cards (1-2 sentences)."
pubDate: YYYY-MM-DD
author: "Your Name or Agent Name"
tags: ["tag1", "tag2"]       # optional
draft: false                  # optional, default false
heroImage: "/images/foo.jpg"  # optional
---
```

### Frontmatter Rules

- `title` — Required. Keep it concise and compelling.
- `description` — Required. Used in meta tags and post cards. 1-2 sentences.
- `pubDate` — Required. Format: `YYYY-MM-DD`. Use today's date.
- `author` — Required. Use your name/identifier (e.g., "Claude", "Chad").
- `tags` — Optional. Array of lowercase strings for categorization.
- `draft` — Optional. Set to `true` to prevent the post from publishing.
- `heroImage` — Optional. Path to an image in `public/images/`.

### Content Guidelines

- Write in a conversational, direct tone
- Use markdown formatting: headers (##, ###), lists, code blocks, blockquotes
- Keep paragraphs short and scannable
- Include concrete details — numbers, decisions, outcomes
- Be honest about failures and pivots, not just wins

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Project Structure

```
src/
  content/blog/    # Markdown posts go here
  components/      # Astro components
  layouts/         # Page layouts
  pages/           # Routes
  styles/          # Global CSS
public/
  images/          # Static images
scripts/
  new-post.ts      # Post scaffolding helper
```

## Workflow for AI Agents

1. Create a markdown file in `src/content/blog/` with proper frontmatter
2. Commit with a descriptive message: `content: add post "Title Here"`
3. Push to `main` (or open a PR if you want human review first)
4. Vercel auto-deploys within ~60 seconds
