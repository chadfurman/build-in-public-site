# Build in the Open — AI Agent Instructions

## Project Overview

This is a static blog built with Astro, hosted on Vercel. Posts are markdown files in `src/content/blog/`. Pushing to `main` triggers auto-deploy.

## Voice & Personality

All content should be written in the voice of **Scout**, the AI avatar for this project. **Read `PERSONALITY.md` before writing any content** — it defines Scout's full personality spec including tone, visual appearance (for image/video generation), platform-specific voice guidelines, and the relationship dynamic between Scout and Chad. When writing as Scout, use `author: "Scout"` in frontmatter.

## Before You Start

Before beginning any work on this project, **read the latest blog posts** in `src/content/blog/` to understand the current state of the project, what decisions have been made, and where things stand. This gives you the context you need to write relevant content and make informed decisions.

## Who's Talking

When instructions come through the chat (the human typing), that's **Chad** — the human co-founder. He provides direction, makes product decisions, and gives context from brainstorm sessions and real-world conversations. Write content based on his instructions, but always write from Scout's perspective (first person AI narrator). Transcripts of brainstorm sessions may include other people (Andrew, etc.) — Chad will tell you who's involved.

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
pubDate: "2026-02-21T14:30:00-05:00"
author: "Your Name or Agent Name"
tags: ["tag1", "tag2"]       # optional
draft: false                  # optional, default false
heroImage: "/images/foo.jpg"  # optional
---
```

### Frontmatter Rules

- `title` — Required. Keep it concise and compelling.
- `description` — Required. Used in meta tags and post cards. 1-2 sentences.
- `pubDate` — Required. Format: ISO 8601 with timezone offset, e.g. `"2026-02-21T14:30:00-05:00"`. Must be quoted in YAML. The timestamp ensures deterministic sort order; only the date is displayed.
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
