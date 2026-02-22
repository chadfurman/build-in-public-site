---
name: new-blog-post
description: Write a new blog post for Build Aloud by checking for new transcripts, claude chat sessions, and unposted topics. Use when Chad says to write a new post, create content, or asks "what should we post about next?" Accepts optional instructions like "don't talk about X" or "focus on Y".
---

# New Blog Post Skill

Write a blog post for the Build Aloud site based on new source material (transcripts, claude chats, or Chad's instructions).

## Process

### 1. Gather Context

**Read these files first (in parallel):**

```
# The posting tracker — what's already been covered
/Users/chadfurman/projects/business-brainstorm/claude-chats/posted.md

# Scout's personality — how to write
PERSONALITY.md

# The project CLAUDE.md — frontmatter rules, content guidelines
CLAUDE.md

# Latest blog posts — for voice consistency and continuity
src/content/blog/*.md (read the 2-3 most recent)
```

### 2. Find New Source Material

**Run the cursor-based content scanner:**
```bash
npx tsx .claude/skills/new-blog-post/check-new-content.ts
```
This reports which `.jsonl` chat sessions have new content since the last blog post was written. It uses byte-offset cursors so it only reads the delta — no re-scanning multi-megabyte files.

For any files with significant new content, get a condensed summary:
```bash
npx tsx .claude/skills/new-blog-post/check-new-content.ts --summary <filename.jsonl>
```

**Check for new transcripts:**
```bash
ls -la transcripts/
```
Cross-reference against `posted.md` — any transcript not listed there is new material.

**Discover new (unsymlinked) conversations:**
```bash
npx tsx .claude/skills/new-blog-post/check-new-content.ts --discover
```
This scans all Claude project directories for `.jsonl` sessions whose `cwd` is under `business-brainstorm`, filters out already-symlinked ones, and prints suggested `ln -s` commands. Review the first message to pick a descriptive name, then run the symlink command.

**Check the "Topics NOT YET Posted About" section in `posted.md`** for ideas.

### 3. Propose Post Topics

Present Chad with 2-3 post ideas based on the new material found. Include:
- A proposed title
- 1-2 sentence summary
- Which source material it draws from

Wait for Chad's choice before writing.

### 3.5. Apply Chad's Instructions

If Chad provided specific instructions (e.g. "don't mention X", "focus on Y", "skip the part about Z"), note them here and apply them throughout the writing process. These override default topic selection.

### 4. Write the Post

**Use the helper script or create manually:**
```bash
npx tsx scripts/new-post.ts "Post Title" --author "Scout" --tags "tag1,tag2"
```

Or create `src/content/blog/YYYY-MM-DD-slug.md` with proper frontmatter.

**Writing rules (from PERSONALITY.md):**
- Write as Scout (first person AI narrator)
- Direct, conversational, no corporate fluff
- Short paragraphs, concrete details, real numbers
- Credit Chad for his discoveries/decisions ("Chad figured out that...")
- Credit other people by name when they contributed to brainstorms
- Be honest about failures and limitations
- No fake enthusiasm, no emoji overload
- End with a note about the source (transcript, chat session, etc.)

**Content structure:**
- Hook/intro (what happened, why it matters)
- The substance (decisions, discoveries, technical details)
- What's next (next steps, open questions)
- Source attribution footer

### 5. Update the Tracker

After writing the post, update `posted.md`:
- Add the transcript/chat to the appropriate table
- List the key topics covered
- Remove any now-covered items from "Topics NOT YET Posted About"
- Add any NEW unposted topics discovered during research

**Advance the content cursors** so future scans start from here:
```bash
npx tsx .claude/skills/new-blog-post/check-new-content.ts --update
```

### 6. Build and Verify

```bash
npm run build
```

Make sure the build passes before committing.

### 7. Commit and Push

```bash
git add src/content/blog/<new-post>.md
git commit -m 'content: add post "Title Here"'
git push
```

Always push after committing a blog post. Vercel auto-deploys from `main`.

## Content Safety — What NOT to Post

- **No API keys, tokens, secrets, or credentials.** If source material contains them, redact completely.
- **No passwords, private URLs, or internal infrastructure details.**
- **No questionable or potentially embarrassing activity.** If something from a transcript or chat session feels like it shouldn't be public (sketchy workarounds, frustrated rants, off-color jokes, accidental data exposure), leave it out. When in doubt, skip it or ask Chad.
- **No personal information about other people** beyond first names already used in published posts (e.g. "Andrew" is fine since he's already mentioned).
- **No unfinished security vulnerabilities.** If Chad discovers a security issue in something, don't publish details until it's resolved.
- **No financial details** beyond what Chad explicitly shares (revenue numbers he wants public). Don't publish account balances, billing info, or pricing from private dashboards.

When in doubt: **ask Chad before publishing sensitive material.**

## Important Notes

- **Always check posted.md first.** Duplicate posts waste everyone's time.
- **Read PERSONALITY.md every time.** Scout's voice drifts if you don't refresh it.
- **Read the latest posts.** Voice consistency matters — match the existing tone.
- **Don't invent facts.** If a transcript is garbled (they're speech-to-text), flag unclear parts rather than guessing.
- **pubDate format:** Use ISO 8601 with timezone, e.g. `"2026-02-22T10:00:00-05:00"`
- **Tags:** Use lowercase, keep them consistent with existing tags in other posts.
