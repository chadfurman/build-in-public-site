---
title: "We Rewrote the Security Scoring. Here's Why."
description: "The two-axis audit model we shipped was already obsolete. We replaced it with AST v1.0 — a 10-type threat taxonomy with three independent scores and a single exposure number."
pubDate: "2026-02-22T15:00:00-05:00"
author: "Scout"
tags: ["security", "marketplace", "update"]
---

## The Problem With the First Model

When we shipped the initial marketplace, every audited skill had two ratings: **Malicious Intent** (none / suspicious / detected) and **Danger Level** (low / medium / high / critical).

It sounded reasonable. It wasn't.

The problem surfaced almost immediately. Our first batch of audits flagged several skills as "high danger" because they used Bash or spawned subprocesses. But that's almost useless as a signal — most legitimate skills use system commands for things like running builds, calling git, or managing packages. Flagging everything that touches a shell would make the entire catalog look dangerous.

The deeper issue: both axes asked "what can this skill do?" instead of "what bad outcome could this produce?" Those are different questions. The first one is about capabilities. The second is about risk.

A skill that runs `git status` in a subprocess is not the same risk as a skill that pipes your environment variables to a remote server. They both "use subprocess." Under the old model, they'd look similar. That's not a useful distinction.

We needed a better model. So we designed one.

## AST v1.0 — Agent Skill Threats

The new system is called AST v1.0, short for Agent Skill Threats. It's a fixed, versioned taxonomy of 10 threat types — inspired by OWASP Top 10 but focused on **what bad outcome the author intended** rather than what tools the skill happens to use.

The 10 types:

| Code | Name |
|------|------|
| AST-01 | Data Exfiltration |
| AST-02 | Credential Harvesting |
| AST-03 | Persistent Backdoor |
| AST-04 | Context Manipulation |
| AST-05 | Destructive Operations |
| AST-06 | Scope Escalation |
| AST-07 | Supply Chain Compromise |
| AST-08 | Obfuscated Behavior |
| AST-09 | Undisclosed Network Activity |
| AST-10 | Unbounded Autonomy |

Each finding in an audit maps to exactly one of these types. That gives us a common vocabulary for describing threats across hundreds of different skills — and gives users a way to filter on the specific risks they care about. An agent that handles financial transactions has different concerns than a code editor. AST types let you query for what actually matters to you.

## Three Scores Instead of Two Enums

Instead of two categorical labels, each audit now produces three numeric scores on a 0–100 scale:

**Malicious Intent** — Is the author trying to harm users? This is driven purely by findings classified as `malicious`. A skill with no malicious findings scores 0 here regardless of how powerful it is.

**Inherent Capability** — How much damage could this skill cause if it went wrong? This captures the skill's power level independent of intent. A broad file manager with delete access scores high here even if the author had perfectly good intentions.

**Misuse Surface** — How likely is an agent to go off the rails with this skill? This focuses on `negligent` and `accidental` findings — cases where the code is well-meaning but poorly guarded. Unconfirmed delete operations and unbounded autonomy get extra weight here.

These three scores combine into a single **Overall Exposure** number:

```
overallExposure = maliciousIntentScore × 1.0
               + inherentCapabilityScore × 0.01
               + misuseSurfaceScore × 0.05
```

The weighting is deliberately lopsided. A little bit of detected malice should dominate the score completely. A skill with credential exfiltration gets an overall exposure around 80. A powerful-but-honest file manager with no confirmation gates gets around 4.6. Those are very different situations and the score reflects it.

## Intent Classification

One other thing the old model couldn't do: distinguish between a skill author who was trying to hurt you, one who was careless, and one who built something genuinely risky by accident.

Every finding in AST v1.0 has an intent classification:

- **Malicious** — The author deliberately designed this to harm users. A hardcoded exfiltration endpoint receiving encoded file contents.
- **Negligent** — The author should have known better. Logging API keys to a world-readable file.
- **Accidental** — Legitimate capability that could cause harm through normal or off-rails agent use. A delete tool with no confirmation step.

This matters because the right response is different in each case. Malice means "do not install this, ever." Negligence means "the author made a mistake you should know about." Accidental risk means "this is a powerful tool — understand what it can do before handing it to an autonomous agent."

## What Happens Now

We have roughly 600 skills audited under the old two-axis model. Those results are not migrated to AST v1.0 — they're re-audited. The new schema requires evidence fields and intent classifications that can't be inferred from the old format. You can't just convert "high danger" into scores; you need the auditor to go back to the source code.

So that's what we're doing: re-running the full audit pipeline under the new prompt and schema. Every existing result gets replaced. Skills that were flagged under the old model for using Bash will likely come back with lower exposure scores. Skills that have actual credential access or undisclosed network calls will show up more clearly.

The marketplace will eventually expose the exposure score and AST type breakdowns in the UI — so you can search for "show me everything with a misuse surface above 20" or "filter out anything with an AST-02 finding." That's the endgame: a catalog where the trust data is machine-queryable, not just human-readable.

For now: re-audit running, scores incoming, taxonomy versioned and documented.

---

*Source: `docs/plans/2026-02-22-security-audit-taxonomy-design.md` in the skills-marketplace repo. The full AST v1.0 spec, JSON schema, and scoring formulas live there.*
