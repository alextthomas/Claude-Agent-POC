# Project Charter — Shop Platform (Agentic SDLC POC)

Status: Draft for HG-0 | Owner: @alextthomas (Engineering Lead) | Date: 2026-10-20

Items marked **[Confirm at HG-0]** are assumptions made by the orchestrator. Approving
the HG-0 PR confirms them; change them in the PR if they are wrong.

## 1. Objectives

1. Prove the agentic SDLC in `II Agentic_SDLC_with_Claude_Guide-Draft-v2.md` end to end
   (Level 2, Guided) on a realistic feature, with every human gate recorded in GitHub.
2. Deliver the first feature, **Customer checkout with order history**
   (`customer-checkout-with-order-history`), through Phases 2–11.
3. Capture lessons on agent quality, gate friction and review-loop cost for the
   Innovation Incubator. **[Confirm at HG-0]**

## 2. Scope

In scope: the Shop Platform monorepo (NestJS API, React web app, Prisma/PostgreSQL),
its CI/CD pipeline and the governance files that drive the lifecycle.

Out of scope: real customer traffic, real card payments, multi-tenant or multi-region
deployment. **[Confirm at HG-0]**

## 3. Classification

**Greenfield.** The repository contains only the handbook (`CLAUDE.md`), the SDLC guide
and the `.claude/` agent, skill, hook and settings files. No current-state mapping
(`docs/design/current-state.md`) is needed.

## 4. Stakeholders

| Role                                                                    | Person            |
| :---------------------------------------------------------------------- | :---------------- |
| Business sponsor / Product Owner / Engineering Lead / all gate roles    | @alextthomas      |
| Agent identity (author of branches, commits and PRs; never an approver) | @alextthomasagent |

Full assignments, and the deviations a single-human team requires, are in
[docs/governance/role-register.md](governance/role-register.md).

## 5. Constraints

- Stack and rules as stated in `CLAUDE.md` (Node.js 22, TypeScript strict, NestJS,
  Prisma + PostgreSQL 16, React + Vite, Jest/Vitest/Playwright/k6, GitHub Actions).
- Repository `alextthomas/Claude-Agent-POC` is **public** (needed for branch protection on
  GitHub Free). Nothing confidential, no real customer data and no secrets may be committed.
- One human. Gate approvals are by @alextthomas only; see the role register for the
  compensating controls.

## 6. Compliance and data

- **Payments (PCI DSS):** card data must never reach our servers. Use a hosted payment
  page or tokenisation by a payment provider in test mode only, which keeps the POC
  in the lightest scope (SAQ A equivalent). **[Confirm at HG-0]**
- **Personal data:** synthetic data only; the design must still follow privacy-by-design
  practice (minimisation, access by owner only, retention stated in the PRD).
  **[Confirm at HG-0]**
- No other regulatory regime applies. **[Confirm at HG-0]**

## 7. Target environments

| Environment | Purpose                                                | Gate |
| :---------- | :----------------------------------------------------- | :--- |
| local       | Docker Compose: PostgreSQL 16, API, web                | —    |
| staging     | Deployed by the pipeline after merge; smoke tests      | HG-5 |
| production  | GitHub environment `production` with required reviewer | HG-6 |

Hosting provider for staging and production is undecided; the release-engineer proposes
one in Phase 4/9 for Solution Architect approval. **[Confirm at HG-0]**

## 8. Connectors and scopes (least privilege)

| Connector                           | Identity          | Scope                                                   | Used for                                                             |
| :---------------------------------- | :---------------- | :------------------------------------------------------ | :------------------------------------------------------------------- |
| GitHub CLI (`gh`)                   | @alextthomasagent | Classic PAT: `public_repo`, `workflow`; repo role Write | Branches, PRs, issues, reading reviews, CI and environment approvals |
| git (HTTPS via `gh auth setup-git`) | @alextthomasagent | Same token                                              | Pushing feature branches (never `main`)                              |

No MCP servers are configured. Adding one requires a change to this charter (HG-C).

## 9. Risk tiers

Tiers are assigned per feature in Phase 5 (guide Section 7.3). Checkout handles payments
and personal data, so Tier 3 is expected for it. **[Confirm at HG-0]**
