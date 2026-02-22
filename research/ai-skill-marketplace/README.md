# AI Skill Marketplace Audit

## What We're Doing

There's an explosion of AI agent skills, MCP servers, plugins, and tools being published across a fragmented ecosystem of marketplaces and registries. Most of them are unvetted. Nobody knows which ones actually work, which are safe, and which are worth using.

**The play**: Pull skills from existing marketplaces, audit them one-by-one using Claude, and publish the results. This generates:

1. **Content** — Each audit is a blog post (feed the build-in-the-open site)
2. **Trust signal** — A curated, human+AI-reviewed skill directory has value
3. **Product discovery** — By auditing 100+ skills, we'll find gaps in the market (skills that should exist but don't, or skills that are universally broken)
4. **Audience** — Developers searching for "is X MCP server safe" or "best Claude skills for Y" find us

## The Audit Process

For each skill/server/plugin:

1. **Source it** — Download or clone from the marketplace
2. **Read the code** — Have Claude analyze the source for:
   - What it actually does vs. what it claims
   - Security issues (data exfiltration, excessive permissions, injection vectors)
   - Code quality (error handling, edge cases, maintainability)
   - Dependencies and supply chain risk
3. **Test it** — Run it in a sandboxed environment if possible
4. **Score it** — Simple rating system (works/broken, safe/sketchy, recommended/skip)
5. **Write it up** — Publish as a blog post with the full audit

## Existing Marketplaces & Sources

### Tier 1: Primary Sources (start here)

#### Anthropic Skills Repo (Official)
- **URL**: https://github.com/anthropics/skills
- **What**: Official first-party skills for Claude Code (SKILL.md format). Reference implementation.
- **Scale**: Dozens of official skills including a skill-creator meta-skill
- **Install**: `claude mcp add-from-skills` or via OpenSkills CLI
- **Curation**: Official — maintained by Anthropic
- **Audit priority**: HIGH — establish the baseline of what "good" looks like

#### OpenAI Skills Catalog (Official)
- **URL**: https://github.com/openai/skills / https://developers.openai.com/codex/skills/
- **What**: Official skills for Codex CLI, Codex IDE extension, and ChatGPT (same SKILL.md format)
- **Install**: Via Codex CLI
- **Curation**: Official — maintained by OpenAI
- **Audit priority**: HIGH — compare against Anthropic's baseline

#### Skills.sh (Vercel)
- **URL**: https://skills.sh
- **What**: Directory + leaderboard + package manager for agent skills. Works across Claude Code, Codex, Cursor, Copilot, Windsurf, Goose, and more.
- **Scale**: Top skills have 26,000+ installs within weeks of launch
- **Install**: `npx skills add <repo> -a claude-code`
- **Curation**: Open submission with community ratings and leaderboard
- **Audit priority**: HIGH — Vercel-backed, high install counts = high impact

#### SkillsMP
- **URL**: https://skillsmp.com
- **What**: Agent skills aggregator — indexes skills from GitHub for Claude Code / Codex / ChatGPT
- **Scale**: 200,000+ indexed skills (aggregated from GitHub)
- **Format**: SKILL.md files (Anthropic's agent skills spec, adopted by OpenAI too)
- **Install**: One-click install links, works through skills CLIs
- **Curation**: Community-submitted, aggregated from GitHub — minimal curation
- **Audit priority**: HIGH — massive volume, low curation = lots of garbage mixed with gems

#### AgentSkill.sh
- **URL**: https://agentskill.sh
- **What**: Large-scale agent skills directory with two-layer security scanning
- **Scale**: 48,000+ skills
- **Install**: Via `/learn` installer
- **Curation**: Open with automated security scanning
- **Audit priority**: HIGH — interesting to compare their security scanning against our manual audits

#### ClawHub / OpenClaw
- **URL**: https://clawhub.ai / https://claw-hub.net
- **What**: "npm for AI agents" — skill registry with vector search, version control, community ratings
- **Scale**: ~3,286 skills (down from 10,700+ after security purge)
- **Install**: `clawhub install skill-name`
- **Curation**: Community-driven with automated malware scanning (VirusTotal partnership)
- **SECURITY NOTE**: Suffered major supply chain attack ("ClawHavoc") — 341-824 confirmed malicious skills found in Feb 2026. 2,419 packages removed.
- **Audit priority**: VERY HIGH — the security angle alone is a blog post series

#### Awesome Agent Skills (VoltAgent)
- **URL**: https://github.com/VoltAgent/awesome-agent-skills
- **What**: 380+ agent skills from official dev teams (Anthropic, Google Labs, Vercel, Stripe, Cloudflare, Trail of Bits, Sentry, Expo, Hugging Face) plus community
- **Format**: SKILL.md compatible
- **Curation**: Higher quality — official team submissions featured
- **Audit priority**: HIGH — good starting point, higher signal-to-noise ratio

#### Awesome Claude Skills (ComposioHQ)
- **URL**: https://github.com/ComposioHQ/awesome-claude-skills
- **What**: Curated list of Claude Skills for Claude.ai, Claude Code, and API
- **Curation**: Curated list format (awesome-list style)
- **Audit priority**: MEDIUM — more curated, good for finding the "best of" to review

### Tier 2: MCP Server Directories

#### Glama
- **URL**: https://glama.ai/mcp/servers
- **What**: Most comprehensive MCP directory. Indexes the entire ecosystem with hosting services.
- **Scale**: 17,564 servers (as of Feb 20, 2026)
- **Install**: Documented install commands per server
- **Curation**: Automated indexing with quality metadata
- **Audit priority**: HIGH — largest single source, good for discovery

#### Official MCP Registry
- **URL**: https://registry.modelcontextprotocol.io
- **What**: The official open-source registry API for publicly available MCP servers. Verified by pinging servers every 5 seconds.
- **Scale**: 16,670+ servers in the broader ecosystem
- **Install**: Yes — via registry API (OpenAPI spec available)
- **Curation**: Community-driven with automated verification
- **Audit priority**: HIGH — the canonical source

#### PulseMCP
- **URL**: https://www.pulsemcp.com/servers
- **What**: Daily-updated MCP server directory
- **Scale**: 8,610+ servers
- **Curation**: Open submission, automated indexing
- **Audit priority**: HIGH — good for finding MCP servers to audit

#### mcp.so
- **URL**: https://mcp.so
- **What**: Community-driven MCP server index with quality ratings
- **Scale**: 3,000+ servers
- **Curation**: Community ratings
- **Audit priority**: MEDIUM — has existing ratings to compare against

#### Awesome MCP Servers (punkpeye)
- **URL**: https://github.com/punkpeye/awesome-mcp-servers
- **What**: Curated list of MCP servers (the OG awesome-list)
- **Web directory**: https://mcpservers.org
- **Scale**: 1,200+ servers
- **Curation**: Awesome-list style (PR-based)
- **Audit priority**: MEDIUM — good quality baseline

#### Smithery
- **URL**: https://smithery.ai
- **What**: MCP server registry with automated installation guides
- **Scale**: 2,200+ servers
- **Install**: One-click install flows
- **Audit priority**: MEDIUM — the install automation is interesting to audit

#### MCP Server Finder
- **URL**: https://www.mcpserverfinder.com
- **What**: Directory and search for MCP servers
- **Audit priority**: LOW — aggregator, use as discovery tool

#### LobeHub MCP Marketplace
- **URL**: https://lobehub.com/mcp
- **What**: MCP-compatible plugins with one-click installation within LobeHub platform
- **Scale**: 10,000+ tools and MCP-compatible plugins
- **Curation**: Community-driven, open platform
- **Audit priority**: MEDIUM — large scale, different ecosystem angle

#### MCP Awesome
- **URL**: https://mcp-awesome.com
- **What**: 1,200+ "quality-verified" MCP servers
- **Audit priority**: MEDIUM — claims quality verification, worth checking their methodology

### Tier 3: Platform Marketplaces

#### Cursor Marketplace
- **URL**: https://cursor.com/marketplace
- **What**: Bundled plugins combining MCP servers, skills, subagents, hooks, and rules. Single-install packages.
- **Scale**: New (launched Feb 17, 2026). Partners: Amplitude, AWS, Figma, Linear, Stripe, Cloudflare, Vercel, Databricks, Snowflake, Hex.
- **Install**: `/add-plugin` command or browse marketplace
- **Curation**: Launch partner integrations + community submissions
- **Audit priority**: MEDIUM — brand new, worth reviewing launch partners

#### ChatGPT App Directory
- **URL**: Built into ChatGPT (Tools → App directory)
- **What**: OpenAI's official app store, launched Dec 18, 2025
- **What it has**: Apps from Adobe, GitHub, Replit, Gmail, Google Drive, Stripe, etc.
- **Format**: Apps SDK (based on MCP)
- **Curation**: Reviewed by OpenAI before publication
- **Audit priority**: LOW for code audit (closed source), HIGH for capability review

#### GPT Store
- **URL**: Built into ChatGPT
- **What**: Custom GPTs — prompt-wrapped ChatGPT configurations
- **Scale**: Millions of GPTs
- **Curation**: Minimal
- **Audit priority**: LOW — mostly prompt wrappers, less interesting for code audit

#### Vercel Marketplace
- **URL**: https://vercel.com/marketplace
- **What**: Production-ready agents and AI services (CodeRabbit, Corridor, Sourcery, etc.)
- **Format**: Vercel integrations with unified billing
- **Curation**: Vetted by Vercel
- **Audit priority**: LOW — already curated, but good for comparison

#### Taskade
- **URL**: https://www.taskade.com/agents/categories
- **What**: AI agent marketplace for project management and workflow automation
- **Scale**: 500,000+ agents created, 1,000+ templates
- **Curation**: Platform-managed
- **Audit priority**: LOW — different use case (productivity, not coding)

### Tier 4: Enterprise / Governance

#### Kong MCP Registry
- **URL**: Part of Kong Konnect (https://konghq.com)
- **What**: Enterprise directory for registering, discovering, and governing MCP servers
- **Launched**: Feb 2, 2026 (tech preview)
- **Audit priority**: WATCH — enterprise play, interesting for governance angle

#### MintMCP
- **URL**: https://www.mintmcp.com
- **What**: MCP gateway with one-click deployment, OAuth/SSO, SOC 2 Type II
- **Audit priority**: WATCH — security layer for MCP, good to understand

#### Strata Maverics
- **URL**: https://www.strata.io
- **What**: AI Identity Gateway — connects MCP servers to enterprise identity infrastructure
- **Audit priority**: WATCH — identity/auth layer

### Tier 5: Framework Tool Registries

#### Composio
- **URL**: https://composio.dev
- **What**: 500+ LLM-ready tools with managed auth. Framework-agnostic (LangChain, CrewAI, OpenAI, etc.). Connects 250+ apps.
- **Install**: `pip install composio-core` / JS SDK
- **Curation**: Professionally maintained
- **Audit priority**: MEDIUM — good tool quality, interesting auth patterns

#### LangChain Hub / LangSmith
- **URL**: https://smith.langchain.com
- **What**: Prompts, chains, agent configurations. LangSmith Agent Builder GA since Jan 2026.
- **Install**: `langchain hub pull`
- **Curation**: Mix of official and community
- **Audit priority**: LOW — more about orchestration than individual skills

#### Hugging Face Hub
- **URL**: https://huggingface.co
- **What**: The de facto open-source AI model/dataset/app registry. smolagents library, tiny-agents toolkit, HF MCP Server.
- **Scale**: 2M+ models, 500K+ datasets, 1M+ Spaces
- **Curation**: Open with community ratings/trending
- **Audit priority**: LOW for skills specifically, but the MCP server is worth auditing

#### Zapier AI Actions
- **URL**: https://zapier.com/ai-actions
- **What**: 20,000+ actions across 7,000+ apps that AI agents can execute. MCP support added 2025.
- **Install**: Via Zapier API
- **Curation**: Professionally maintained
- **Audit priority**: LOW — already battle-tested, but MCP integration is new

### Tier 6: Enterprise Agent Marketplaces

#### AWS Marketplace (AI Agents)
- **URL**: https://aws.amazon.com/marketplace (AI Agent & Tools category)
- **What**: Pre-built agents from Anthropic, Salesforce, IBM, PwC, Stripe, etc. MCP and A2A protocol support.
- **Scale**: 900+ agents and tools at launch (July 2025)
- **Curation**: Enterprise-vetted
- **Audit priority**: WATCH — enterprise, not our immediate target

#### Microsoft Copilot Agent Store
- **URL**: Within Microsoft 365 Copilot Chat
- **What**: Centralized marketplace for agents. Supports Copilot Studio agents (low-code and pro-code).
- **Scale**: 70+ agents, growing
- **Curation**: Enterprise-curated by Microsoft
- **Audit priority**: WATCH

### Standards to Know

- **SKILL.md format** — Anthropic's agent skills spec (Dec 2025), adopted by OpenAI for Codex/ChatGPT
- **AGENTS.md standard** — OpenAI (Aug 2025), adopted by 60,000+ open-source projects and all major agents
- **MCP (Model Context Protocol)** — The underlying protocol for tool/server communication
- **A2A (Agent-to-Agent Protocol)** — Google's protocol for cross-agent communication
- **AAIF (Agentic AI Foundation)** — Linux Foundation governance body for agent standards. Co-founded by OpenAI, anchored by MCP + AGENTS.md

### Tools for the Audit Workflow

#### OpenSkills CLI
- **URL**: https://github.com/numman-ali/openskills
- **NPM**: `npx openskills install <skill>`
- **What**: Universal skills loader — works with Claude Code, Cursor, Windsurf, Aider, Codex
- **Why it matters**: Programmatic skill installation = we can script the audit pipeline

#### Skills CLI (Vercel)
- **URL**: https://skills.sh
- **NPM**: `npx skills add <repo> -a claude-code`
- **What**: Vercel's package manager for agent skills. Leaderboard + ratings.
- **Why it matters**: Higher-signal curation via install counts and ratings

## Audit Template

Each audit should cover:

```
## [Skill/Server Name]
**Source**: [marketplace + URL]
**Author**: [who published it]
**Version**: [version audited]
**Last updated**: [when]

### Claims vs Reality
- What it says it does:
- What it actually does:

### Security
- Permissions requested:
- Data access:
- External network calls:
- Dependency risk:
- Red flags:

### Code Quality
- Error handling: [good/ok/poor]
- Edge cases: [handled/some/none]
- Test coverage: [yes/partial/none]
- Maintainability: [clean/messy/abandoned]

### Verdict
- Works: [yes/partial/no]
- Safe: [yes/caution/no]
- Recommended: [yes/maybe/skip]

### Score: [X/10]
```

## Where to Start

1. **Anthropic's official skills repo** — Audit these first to establish the gold standard baseline
2. **Skills.sh top-installed** — The most popular community skills (26K+ installs, highest blast radius)
3. **ClawHub post-incident** — The security story is compelling: audit what survived their malware purge
4. **VoltAgent/awesome-agent-skills** — Official team skills from Stripe, Vercel, Cloudflare, etc.
5. **Pick 5 MCP servers from Glama** — Cross-reference with awesome-mcp-servers for the most-used ones

## Content Angle

Each audit = one blog post. Batch them as:
- "I Audited the Top 10 Claude Skills — Here's What I Found"
- "The ClawHavoc Incident: What 341 Malicious AI Skills Looked Like"
- "The MCP Server Security Problem Nobody's Talking About"
- "Which AI Agent Marketplaces Can You Actually Trust?"
- "Official vs Community Skills: Is the Quality Gap Real?"
- Weekly "Skill of the Week" reviews

This content targets developers searching for skill reviews, which is a growing search category with basically zero competition right now.

## Scale of the Opportunity

The numbers across all sources:
- **200,000+** skills indexed on SkillsMP alone
- **48,000+** skills on AgentSkill.sh
- **17,500+** MCP servers on Glama
- **3M+** custom GPTs in the GPT Store
- **900+** enterprise AI agents on AWS Marketplace
- **341+** confirmed malicious skills found in just one registry (ClawHub)

Nobody is systematically auditing these. The security angle alone could be a business.
