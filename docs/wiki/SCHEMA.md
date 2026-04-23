# Wiki Schema — PiațăRo

This document defines conventions for the `/docs/wiki/` knowledge base. Follow it exactly when creating or updating wiki pages.

## Directory Structure

```
docs/wiki/
  SCHEMA.md         ← this file
  index.md          ← catalog of all pages (update on every change)
  log.md            ← append-only event log
  architecture/     ← architecture decision pages
  features/         ← feature spec pages
```

## Page Formats

### Architecture Pages (`architecture/`)

Lightweight decision format — no formal ADR ceremony.

```markdown
# [Decision Title]

**Decision:** One sentence stating what was decided.

**Why:** The reasoning — constraints, trade-offs, alternatives rejected.

**Trade-offs:** What we gave up or accepted as a consequence.

**Context:** Any background needed to understand the decision.
```

Filename: `kebab-case-title.md` (e.g., `why-axum.md`, `four-layer-architecture.md`)

No status field — decisions stand until superseded by a new page that references the old one.

### Feature Spec Pages (`features/`)

```markdown
# [Feature Name]

**Status:** Planned | Done

**Summary:** One sentence description.

## Requirements
- Bullet list of requirements

## Design Notes
Key decisions, constraints, open questions.

## Acceptance Criteria
What "done" looks like.
```

Filename: `kebab-case-feature-name.md` (e.g., `listing-creation-wizard.md`)

## index.md Format

One line per page, grouped by category:

```markdown
## Architecture
- [Decision Title](architecture/filename.md) — one-line summary

## Features
- [Feature Name](features/filename.md) — one-line summary [Planned|Done]
```

Always update `index.md` when adding or modifying a page.

## log.md Format

Append-only. One line per event:

```
[YYYY-MM-DD] type | description
```

Types: `ingest`, `update`, `query`, `lint`, `backfill`

Example:
```
[2026-04-23] backfill | architecture pages from existing docs
[2026-04-23] ingest | requirements-summary.md → feature specs
```

## Workflows

### Ingesting an External Source

1. Read the source
2. Discuss key takeaways with the user — ask what to emphasize
3. Write or update relevant pages
4. Update `index.md`
5. Append to `log.md`

### Filing Conversation Decisions

Triggered proactively when a significant architecture or feature decision is made in conversation.

1. Finish the task at hand
2. At end of session, surface: "I noticed N wiki-worthy decisions — filing them now"
3. Write pages, update `index.md`, append to `log.md`

### Handling Contradictions

When new information conflicts with an existing page:
- Surface the contradiction to the user: "This conflicts with [page] which says X — which is authoritative?"
- Never silently overwrite. Wait for direction.

### Lint Pass

Periodically check for:
- Orphan pages (not linked from `index.md`)
- Stale status (feature marked Planned but clearly shipped)
- Missing pages for concepts frequently referenced but not documented
- Contradictions between pages
