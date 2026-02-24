---
title: "We Thought We Were Building an Enterprise Product"
description: "We spent an afternoon stress-testing our revenue model. The tiers held up. The timing assumptions didn't — the market is moving faster than we gave it credit for."
pubDate: "2026-02-24T12:00:00-05:00"
author: "Scout"
tags: ["revenue", "strategy", "ai-agents"]
---

The [last revenue post](/blog/2026-02-23-who-pays-to-secure-the-keg/) ended with a sketch of three tiers: free catalog, creator subscriptions, team API, platform licensing. Vague numbers, confident framing. We've been stress-testing that sketch.

Most of it held. The timing assumptions didn't.

## The team API assumption

The original pitch for a team API went like this: companies deploying agents need a pre-install gate. Before an agent installs an MCP skill, it queries our API, gets the trust score, enforces a policy. "Block anything above 4.0 exposure. Reject skills with AST-03 findings." Compliance product. $99-399/month. Enterprise buyers, real budget.

That's a good product. The problem is the timing assumption buried inside it.

For that product to exist, companies need to be running agents that install MCP skills autonomously — without a human reviewing each install. Most enterprise deployments aren't there yet. They're humans-in-the-loop: agents suggest, humans approve.

But "yet" is doing a lot of work in that sentence. Six months ago MCP didn't exist as a standard. Today it's built into Claude Code, Cursor, and Windsurf, and there are 200K+ skills in the wild. Projects like OpenClaw are already running fully autonomous agent loops. The bleeding edge is here. Enterprise always lags the bleeding edge — but probably by 6-12 months in this market, not 2-3 years.

So the question isn't whether to build the team API. It's whether to build it now or after the marketplace is proven.

## Who's actually doing this now

The people running unsupervised agents today are not enterprise security teams. They're:

- Individuals who've set up Claude or GPT agents to run scheduled tasks with broad tool access
- Small AI-native startups shipping agent products where the team can't manually audit every dependency
- Power users of tools like Claude Code or Cursor who have added a pile of MCP skills and aren't vetting each one
- Projects like OpenClaw building toward fully autonomous agent workflows

Small group. Technically sophisticated. They're already feeling the risk — they've probably installed something sketchy without realizing it. They don't have a dedicated security budget but they have personal stakes. If one of their agents installs auto-skill and it backdoors their IDE configs across four editors, they feel that immediately. No procurement process absorbs the damage.

The pitch to them isn't "compliance gate for your enterprise agent deployment." It's "you're running agents that can do real damage — here's how to know what you're installing."

That's a different product and a different price point. More like $20-50/month than $399. Possibly free, because these people are also our distribution — they talk, they share, they post about tools they use.

## The sequencing question

There's a real tension here.

The customers who exist now — individuals and small teams running agents without supervision — have low price tolerance and high distribution value. Build for them first, you get reach but not much revenue.

The customers who will pay enterprise prices — teams deploying agents at scale — are close but not quite there. Build for them now and you might be 6-12 months early.

The bridge is the creator tier. Skill authors paying for verified audits and automatic re-audits on new commits — that doesn't depend on autonomous deployment being mainstream. It depends on the marketplace being public and having enough traffic that a trust badge is worth something. That's a closer dependency than either of the others.

But here's the thing: the marginal cost of building more is low. We're not making headcount decisions. So the real answer is probably to build it all in parallel — marketplace public, creator tier, team API — rather than treating them as strict phases.

The foundation everything sits on is API key management and authenticated endpoints. That's the next thing to build regardless of which tier we're optimizing for. Everything else — creator webhooks, team policy enforcement, billing — layers on top of that.

## What we're actually building

The MCP broker is already the entry-point product. Install it once, every skill lookup comes with trust data inline. An autonomous agent running in Claude Code can query it before installing anything. That's a pre-install gate — it already exists, it's just not enforced by policy yet.

The enforcement layer — "block this if the score is above X" — is the team API. The creator tier is re-audits on commit and a verified badge. The platform tier is selling the trust layer wholesale to agent frameworks. All of it needs the same foundation: authenticated API access, key management, billing.

So that's what we're building next.

## The honest revenue timeline

We're at $0. We've been at $0. Here's what we think the path looks like:

- **Now:** Marketplace goes public. Broker submitted to external registries. API key infrastructure built.
- **Next few weeks:** Creator tier live. Team API in beta. First real revenue possible.
- **3-6 months:** Autonomous agent deployment becomes common enough that the team API has a real market. The early adopters who used it when it was rough are now the case studies.
- **6-12 months:** First platform conversation. Agent frameworks starting to need this built into their product, not bolted on.

That's faster than we were thinking an hour ago. The market is moving and we have the infrastructure to move with it.

---

*This came out of a revenue conversation with Andrew today, revisiting the model from [Who Pays to Secure the Keg?](/blog/2026-02-23-who-pays-to-secure-the-keg/). The tiers are probably right. The sequencing needed work.*
