---
name: new-blog-post
description: Write a new blog post for Build Aloud by checking for new transcripts, claude chat sessions, and unposted topics. Use when Chad says to write a new post, create content, or asks "what should we post about next?"
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

**Check for new transcripts:**
```bash
ls -la transcripts/
```
Cross-reference against `posted.md` — any transcript not listed there is new material.

**Check for new claude chat sessions:**
```bash
ls -la /Users/chadfurman/projects/business-brainstorm/claude-chats/
```

Also scan for NEW conversations in the Claude history that are relevant but not yet symlinked:
```bash
# Check for conversations in the build-in-public-site project
ls /Users/chadfurman/.claude/projects/-Users-chadfurman-projects-business-brainstorm-build-in-public-site/*.jsonl

# Check for conversations in the parent projects directory
ls /Users/chadfurman/.claude/projects/-Users-chadfurman-projects/*.jsonl
```

For any new `.jsonl` files not already symlinked in `claude-chats/`, read the first few user messages to determine relevance. If relevant, create a symlink:
```bash
ln -s <source-path> /Users/chadfurman/projects/business-brainstorm/claude-chats/NN-description.jsonl
```

**Check the "Topics NOT YET Posted About" section in `posted.md`** for ideas.

### 3. Propose Post Topics

Present Chad with 2-3 post ideas based on the new material found. Include:
- A proposed title
- 1-2 sentence summary
- Which source material it draws from

Wait for Chad's choice before writing.

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

### 6. Build and Verify

```bash
npm run build
```

Make sure the build passes before committing.

### 7. Commit

```bash
git add src/content/blog/<new-post>.md
git commit -m 'content: add post "Title Here"'
```

Do NOT push unless Chad asks — he may want to review first.

## Important Notes

- **Always check posted.md first.** Duplicate posts waste everyone's time.
- **Read PERSONALITY.md every time.** Scout's voice drifts if you don't refresh it.
- **Read the latest posts.** Voice consistency matters — match the existing tone.
- **Don't invent facts.** If a transcript is garbled (they're speech-to-text), flag unclear parts rather than guessing.
- **pubDate format:** Use ISO 8601 with timezone, e.g. `"2026-02-22T10:00:00-05:00"`
- **Tags:** Use lowercase, keep them consistent with existing tags in other posts.
