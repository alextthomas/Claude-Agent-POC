# **END-TO-END AGENTIC SDLC WITH CLAUDE**

## Build, Test, Ship and Maintain Enterprise Applications — Version 1.0

A practical, enterprise-ready methodology for running the full software development life cycle with a lean team of Claude agents, independent review, and a mandatory Human Gateway.

Reference stack: Node.js LTS | TypeScript (strict) | NestJS | React \+ TypeScript | PostgreSQL \+ Prisma | Docker | GitHub Actions | Playwright

## **Document Control**

| Item | Value |
| :---- | :---- |
| Document | End-to-End Agentic SDLC with Claude — Build, Test, Ship and Maintain Enterprise Applications |
| Version | 2.0 |
| Date | 19 October 2026 |
| Status | **Draft for Solution Architect review** — open decisions are listed in Section 19 |
| Owner | Solution Architect (to be named) |
| Editor | Ajith Aravind |
| Audience | Solution architects, engineering leads, developers, QA, DevOps, security and delivery managers |

### **Evidence statement**

This document is a methodology and implementation guide. **No code, tests, reviews or deployments were executed to produce it.** All commands, configuration files, prompts and report samples are examples to adapt and verify in your environment. Claude product features, command names and file formats change between versions; every item marked **\[Verify\]** must be checked against the current official documentation (Claude Code: code.claude.com/docs; Claude API and Agent SDK: docs.claude.com) before use.

### **Labels used in this document**

| Label | Meaning |
| :---- | :---- |
| **MANDATORY** | A control that must be in place for any change merged to a protected branch or released. It cannot be relaxed by an agent. |
| **CONFIGURABLE** | A control the project may relax for low-risk, non-production work, with the decision recorded. |
| **RECOMMENDED** | Good practice; adopt unless there is a documented reason not to. |
| **\[Verify\]** | Product- or version-dependent detail; confirm in current documentation. |
| **\[SA-Dnn\]** | An unresolved decision requiring Solution Architect approval (Section 19.4). |
| **Illustrative** | An example output or mock-up, not evidence of a real run. |

Contents

**1\. Executive Summary	6**

**2\. Key Architectural Decisions	7**

**3\. Core Concepts in Plain Language	8**

**4\. Reference Architecture and Technology Stack	10**

4.1 Reference architecture	10

4.2 Reference technology stack	10

4.3 Technology selection criteria	12

4.4 Choosing the right database	13

4.5 Repository layout	13

**5\. Agent Design Rationale	14**

5.1 Design principles	14

5.2 How each responsibility is assigned	14

5.3 Result	15

**6\. Final Agent Catalogue	16**

6.1 Catalogue overview	16

6.2 Agent specifications	16

6.3 Skills catalogue	19

6.4 Ownership boundaries (RACI)	20

**7\. End-to-End SDLC Workflow	21**

7.1 Lifecycle overview	21

7.2 Workflow diagram	21

7.3 Risk tiers and conditional paths	25

7.4 Phase specifications	25

**8\. Human Gateway Design	31**

8.1 Principles (MANDATORY)	31

8.2 Gate catalogue and approval matrix	31

8.3 Decision options	32

8.4 Authorisation and audit trail	32

8.5 Timeouts and escalation	33

8.6 Material change and stale approvals	33

8.7 Mandatory versus configurable gates	34

**9\. Independent Review: Architect Review and Critical Review	35**

9.1 Independence requirements (MANDATORY)	35

9.2 Architect Review Agent — criteria	35

9.3 Critical Review Agent — criteria	36

9.4 Severity model and blocking rules	36

9.5 Finding format	37

9.6 Review report template	37

9.7 Consolidation and disagreement	38

**10\. Rework, Escalation and Exception Handling	39**

10.1 The control loop	39

10.2 Finding lifecycle	40

10.3 Rules	40

10.4 Escalation record	41

10.5 Exceptions (HG-X)	41

10.6 Agents that must never bypass controls	41

**11\. Implementing the Workflow with Claude	42**

11.1 What Claude provides, and what it does not	42

11.2 Capability by environment	42

11.3 Three implementation levels	43

11.4 Environment setup	44

11.5 Agent files	46

11.6 Skills	46

11.7 Hooks	47

11.8 The orchestration skill: /sdlc-feature	47

11.9 Workflow state and “files, not chat”	48

11.10 Claude in CI: authoritative reviews	48

11.11 Running Claude non-interactively	50

11.12 Level 3 — Agent SDK (TypeScript)	51

**12\. Reusable Prompts	52**

12.1 Agent prompts	52

12.2 Stage prompts for the orchestrator	53

**13\. Testing Strategy and Quality Gates	54**

13.1 Test pyramid (Node.js/TypeScript)	54

13.2 Building the suite (QA prompt)	54

13.3 Measurable quality gates	55

13.4 The self-healing loop (bounded)	56

**14\. Security, Governance and Audit Controls	57**

14.1 Controls register	57

14.2 Prompt-injection and tool-safety rules (MANDATORY)	58

14.3 Alignment with Well-Architected principles (cloud-neutral)	58

**15\. CI/CD, Release and Deployment Workflow	59**

15.1 Pipeline overview	59

15.2 CI workflow (starter)	60

15.3 Delivery and promotion	61

15.4 Release readiness checklist (Phase 9\)	62

**16\. Reports and Evidence	63**

**17\. Maintenance and Continuous Improvement	64**

17.1 Maintenance/Operations capability	64

17.2 Emergency changes	65

**18\. Implementation Roadmap	67**

**19\. Risks, Assumptions, Dependencies and Unresolved Decisions	68**

19.1 Risks	68

19.2 Assumptions	68

19.3 Dependencies	68

19.4 Unresolved decisions requiring Solution Architect approval	69

**20\. Common Pitfalls and Troubleshooting	70**

20.1 Common pitfalls	70

20.2 Troubleshooting	70

**21\. Document Acceptance Checklist	71**

**Appendix A. Ready-to-Use Agent Files	73**

**Appendix B. Skill Files	76**

**Appendix C. Templates	78**

C.1 Gate decision record (mirror of the system of record)	78

C.2 Finding schema (.claude/skills/review-findings/schema.json)	78

C.3 Exception record (.sdlc/exceptions/EX-\<n\>.yaml)	79

C.4 Workflow state (.sdlc/state/\<feature\>.json)	79

**Appendix D. Quick Command Reference	80**

**Appendix E. Glossary	81**

# **1\. Executive Summary**

This guide describes a practical, enterprise-ready methodology for running the full software development life cycle — requirements, UX, design, build, review, test, release and maintenance — with a lean team of Claude agents, independent quality reviews and mandatory human approval. It is written for teams building Node.js/TypeScript applications and is designed to be adopted incrementally, starting with a single pilot feature.

The methodology rests on five design choices:

1. **Node.js and TypeScript as the primary stack.** The standard path is Node.js LTS, strict TypeScript, NestJS, REST/OpenAPI, Prisma (or TypeORM), Jest/Vitest with Supertest, Playwright, ESLint and Prettier. React with TypeScript is the default web frontend. Python is an optional technology for specialised workloads such as data science or existing Python services.

2. **A lean team of seven agents**, each with one clear responsibility: Product/Requirements, Solution Architect, Developer, Architect Review, Critical Review, Testing/QA and Release/DevOps. Backend, frontend and database implementation belong to one Developer Agent that uses specialist skills. Security scanning and technical writing are skills. UX/Prototype and Maintenance/Operations are conditional capabilities rather than permanent agents.

3. **A Human Gateway** of seven phase gates (HG-0 to HG-6) and three cross-cutting gates (HG-C change control, HG-X exceptions, HG-E escalation), each with entry conditions, evidence packs, decision options, authorised roles, audit records, timeouts and invalidation rules. Approvals are recorded in systems the agents cannot write to (for example, GitHub pull-request reviews and protected environments), not inferred from chat.

4. **Independent Architect Review and Critical Review.** Both run in fresh contexts against a pinned commit, produce structured findings with severity and evidence, block progress on Critical and High findings, and must re-verify every fix. A finding is closed only by evidence from a re-review — never by the Developer Agent stating that it is fixed.

5. **Evidence over assertion.** Every stage writes artifacts bound to a commit; CI is the objective referee; nothing is reported as reviewed, tested or deployed without linked evidence.

The workflow has eleven phases, each with entry conditions, owner, activities, outputs, quality checks, approvals and failure paths. Risk tiers decide how much ceremony a change needs, while mandatory controls cannot be relaxed. Section 11 is explicit about what Claude provides natively, what needs tool integrations or CI, and what needs a workflow engine — because defining agents in Markdown does not by itself create a reliable, persistent multi-agent system.

**What a team gets at the end:** a reference Node.js/TypeScript monorepo layout, seven agent files, a skill library, an orchestration skill with enforced gates, a CI pipeline with a findings gate, review and approval templates, measurable quality gates, and a prioritised 90-day roadmap.

# **2\. Key Architectural Decisions**

The decisions below shape the rest of the guide. Each records the rationale and the main alternative considered, so that teams adapting the methodology know what they would be giving up by changing it.

| ID | Decision | Rationale | Alternatives considered |
| ----- | ----- | ----- | ----- |
| AD-01 | One Developer Agent owns backend, frontend and database implementation; specialism is supplied by skills. | A single owner per change removes hand-off conflicts on shared types and contracts and simplifies accountability. Context-window limits are handled by sub-tasks, not permanent agents. | Separate backend, frontend and database agents (rejected: overlapping file ownership, more orchestration, little quality gain). |
| AD-02 | Reviewers are separate agents with read-only tools, fresh context and no access to the developer’s self-assessment. | Independence is a property of context and permissions, not of prompt wording. | Append review instructions to the Developer prompt (rejected: the reviewer would share the author’s context and assumptions). |
| AD-03 | The authoritative review run happens in CI on the pull-request head commit; local reviews are advisory. | Results are bound to a commit SHA and stored outside the agent’s working tree, giving tamper-evident evidence. | Local-only reviews (rejected: findings files are editable by the agent that is being reviewed). |
| AD-04 | Human approvals are recorded in GitHub (PR reviews, CODEOWNERS, protected environments) or an equivalent system of record, and verified by the orchestrator through the API. | Approval cannot be simulated in chat or inferred from silence. Branch protection can dismiss stale approvals on new commits. | Chat confirmation (rejected: not auditable or role-checked). \[SA-D07\] for non-GitHub platforms. |
| AD-05 | Security review is a capability split between Critical Review (code-level), Architect Review (security architecture) and scanners in CI; a human AppSec reviewer is mandatory for Tier 3 changes. | An AI reviewer is not a substitute for security specialists or formal assessments. | A standalone security review agent (rejected: duplicates Critical Review; implies coverage it cannot guarantee). |
| AD-06 | Maintenance/Operations is a post-release capability run through existing agents and playbook skills, not a standalone agent. | Avoids an agent with broad production reach; production issues re-enter the normal lifecycle. | Standalone Ops agent (deferred; revisit at Level 3 automation). |
| AD-07 | Risk tiers (1 Low, 2 Standard, 3 High) scale review depth and configurable gates; mandatory gates and both reviews always run for code reaching a protected branch. | Proportionate control without letting low-risk paths skip independent review. | One-size-fits-all (rejected: too slow for low-risk work). |

# **3\. Core Concepts in Plain Language**

Learn these terms once and the rest of the guide is straightforward.

| Concept | What it is | Where it lives |
| ----- | ----- | ----- |
| **Claude Code** | Claude working in your terminal, IDE, desktop app or web session. It reads files, runs commands and edits code within the permissions you set. \[Verify surfaces for your plan\] | Your machine or a managed session |
| **CLAUDE.md** | The project handbook Claude reads at the start of every session: stack, commands, rules, definition of done. | Repository root |
| **Agent (sub-agent)** | A specialist Claude with its own role, instructions, allowed tools and separate context window. The main session delegates to it and receives a summary. | .claude/agents/\*.md |
| **Orchestrator** | The main session (or a program/workflow engine) that plans the work, invokes agents, checks gates and records state. It does not write application code. | Main Claude Code session, or your SDK program |
| **Skill** | A packaged set of instructions (and optional scripts) that an agent loads when relevant, for example “NestJS module conventions” or “Prisma migration rules”. | .claude/skills/\<name\>/SKILL.md |
| **Slash command** | A reusable prompt invoked as /name. In current Claude Code versions skills can also be invoked this way \[Verify\]. | .claude/skills/ or .claude/commands/ |
| **MCP connector** | A Model Context Protocol server giving Claude controlled access to an external system (GitHub, database, browser, Jira, monitoring). | claude mcp add, .mcp.json |
| **Hook** | A script that runs automatically at a fixed moment (before/after a tool, when Claude stops), used to format, block risky actions or enforce checks. | .claude/settings.json |
| **Agent SDK** | A TypeScript/Python library to run the same agents from your own programs, schedulers or services. | Your code |
| **Human Gateway** | The set of mandatory human decision points. A gate pauses the workflow until an authorised person records a decision in the system of record. | GitHub reviews/environments or your approval system |
| **Finding** | One structured review result: ID, severity, evidence, rationale, recommended fix and verification criteria. | CI review artifact; .sdlc/findings/ mirror |
| **Evidence pack** | The bundle of artifacts presented at a gate: documents, diffs, test reports, findings and exceptions, all tied to a commit SHA. | reports/\<YYYY-MM-DD\>-\<version\>/, CI artifacts |
| **Risk tier** | Low / Standard / High classification of a change that decides review depth and which configurable gates apply. | Implementation plan, PR label |
| **Workflow state** | A machine-readable record of where a feature is in the lifecycle, which artifacts are approved, and at which commit. | .sdlc/state/\<feature\>.json or workflow engine |

**Mental model.** Think of a software company. You and your colleagues are the accountable humans: Product Owner, Solution Architect, Engineering Lead, QA Lead, Security Lead and Release Manager. The orchestrator is the delivery manager. Agents are specialists. Reviewers are an independent design authority and a “red team”. MCP connectors are the keys to company systems. CI and the Human Gateway are the inspectors and sign-off authority. CLAUDE.md is the company handbook.

# **4\. Reference Architecture and Technology Stack**

## **4.1 Reference architecture**

You talk to the orchestrator. It delegates work to agents, which use skills and connectors to act on the repository and external systems. CI is the objective referee, and the Human Gateway holds decision authority. Everything produces evidence tied to a commit.

![][image1]

*Figure 1 — Reference architecture. Reviewers are read-only; deployments are triggered by the pipeline after human approval, never directly by an agent.*

## **4.2 Reference technology stack**

The agent design is stack-aware but not stack-locked: every agent reads CLAUDE.md to learn the project’s choices. The defaults below are recommendations, subject to documented justification in an ADR.

| Layer | Default | Alternatives | Choose the alternative when |
| ----- | ----- | ----- | ----- |
| Runtime | Node.js Active LTS, pinned via .nvmrc and engines | — | Never use non-LTS in production |
| Language | TypeScript, strict: true, noUncheckedIndexedAccess: true | — | Mandatory for application code |
| Backend framework | **NestJS** (modules, DI, guards, pipes, OpenAPI decorators) | Fastify; Express.js | Fastify for small, high-throughput services; Express for very small services or existing Express code |
| API style | REST \+ OpenAPI 3.1 (contract-first) | GraphQL; event-driven (Kafka, SQS, RabbitMQ) | GraphQL for client-driven aggregation; events for asynchronous integration — ADR required |
| Validation | class-validator \+ class-transformer (NestJS-native) | Zod (shared schemas via nestjs-zod or similar) | Zod when schemas are shared with the frontend in packages/contracts \[SA-D02\] |
| Data access | **Prisma** (schema, typed client, Prisma Migrate) | TypeORM; Kysely/Drizzle | TypeORM for existing TypeORM codebases or heavy entity/repository patterns \[SA-D01\] |
| Primary database | PostgreSQL (current supported major) | MySQL, SQL Server, Oracle, MongoDB | See Section 4.4 |
| Cache / queue | Redis (cache, rate limits); BullMQ for jobs | RabbitMQ, Kafka, SQS | Durable cross-service messaging |
| Frontend | React \+ TypeScript; Vite SPA or Next.js | Angular, Vue | Next.js when SSR/SEO or edge rendering is required \[SA-D03\] |
| Unit tests | Jest for NestJS API (scaffold default); Vitest for web | Vitest everywhere | Unify on one runner once tooling is proven \[SA-D04\] |
| API / integration tests | Supertest \+ NestJS testing module; Testcontainers or CI service for PostgreSQL | Pactum | — |
| Contract checks | Spectral (OpenAPI lint); OpenAPI response validation in Supertest tests | Schemathesis (optional, Python-based); Pact for consumer-driven contracts | Multiple consumers of one API |
| End-to-end | Playwright \+ @axe-core/playwright | Cypress | Existing Cypress estate |
| Load | k6 (JavaScript scripts) | Artillery, JMeter | — |
| Mutation (Tier 3\) | StrykerJS | — | Evidence that tests detect defects |
| Code quality | ESLint (typescript-eslint, strict type-checked), Prettier, tsc \--noEmit | Biome | Team preference, with equivalent rules |
| Security scanning | CodeQL or Semgrep (SAST), gitleaks (secrets), Trivy (containers/IaC), npm audit or OSV-Scanner (dependencies), CycloneDX SBOM, licence allow-list | SonarQube, Snyk, Checkmarx | Existing enterprise tooling |
| Logging | Pino (nestjs-pino), JSON, correlation IDs, redaction | Winston | — |
| Metrics / tracing | OpenTelemetry SDK → Prometheus/Grafana, Tempo/Jaeger, or vendor | Datadog, New Relic, CloudWatch, Azure Monitor | Existing platform |
| Health | @nestjs/terminus liveness/readiness endpoints | — | — |
| Errors | Sentry (optional) | Vendor APM | — |
| AuthN / AuthZ | OIDC with the enterprise IdP; @nestjs/passport \+ JWT; role/attribute guards | — | — |
| Secrets | Cloud secret manager or HashiCorp Vault; .env only for local development | — | — |
| Containers | Multi-stage Dockerfile, non-root user, slim or distroless Node base image | — | — |
| Orchestration / hosting | Kubernetes (cloud or on-premise), ECS, Azure Container Apps, Cloud Run \[SA-D14\] | VMs with systemd | On-premise without Kubernetes |
| IaC | Terraform or OpenTofu | Pulumi (TypeScript), CloudFormation, Bicep | Platform team standard |
| CI/CD | GitHub Actions | GitLab CI, Azure DevOps, Jenkins | Existing platform \[SA-D07\] |
| Package manager | npm workspaces | pnpm | Large monorepos needing faster installs |
| Documentation | ADRs (Markdown), OpenAPI spec, README, runbooks | — | — |

**Python as an optional technology.** Python may be used for data science, machine learning, analytics pipelines, or existing Python services. When it is used, it is isolated as its own service (for example services/ml-scoring/) behind an API contract, has its own CI job and quality gates, and is recorded in an ADR. The Developer Agent then loads a python-service skill rather than a separate agent. Python is not used for the standard application path.

## **4.3 Technology selection criteria**

Before adopting any component, the Solution Architect Agent records an ADR that evaluates: fit with requirements; compatibility with Node.js LTS and strict TypeScript; maintenance activity and release cadence; licence; security history and supply-chain posture; team capability; operational cost; and enterprise support. The agent must not add a technology simply because it appears in this table.

## **4.4 Choosing the right database**

| Need | Pick | Why |
| ----- | ----- | ----- |
| Orders, payments, users, strong consistency | PostgreSQL / MySQL / SQL Server | ACID transactions, joins, mature tooling |
| Flexible documents, catalogues, content | MongoDB | Schema flexibility, nested data (Prisma and TypeORM both support MongoDB with limitations — check before choosing) |
| Sessions, rate limits, hot reads | Redis | In-memory speed |
| Search and analytics on text | OpenSearch / Elasticsearch | Full-text and aggregations |
| Reporting and BI at scale | Snowflake / BigQuery / Redshift | Columnar warehouse |
| Embeddings / semantic search | pgvector or a vector database | Similarity search for AI features |

## **4.5 Repository layout**

shop-platform/  
  CLAUDE.md                      \# project handbook (Section 11.4)  
  .claude/  
    agents/                      \# 7 agent definitions (Appendix A)  
    skills/                      \# skills incl. sdlc-feature orchestration (Appendix B)  
    hooks/                       \# hook scripts  
    settings.json                \# permissions \+ hooks (Section 11.4, Step 6\)  
  .mcp.json                      \# shared MCP connector config (optional)  
  .sdlc/  
    state/                       \# workflow state per feature (Appendix C.4)  
    findings/                    \# local mirror of review findings (advisory)  
    exceptions/                  \# approved exception records (CODEOWNERS-protected)  
  docs/  
    requirements/                \# PRDs with REQ/US/AC IDs  
    ux/                          \# journeys, screen specs (when UI in scope)  
    design/                      \# ADRs, openapi.yaml, data model, diagrams  
    plans/                       \# implementation plans and task lists  
    reviews/                     \# human-readable review reports  
    runbooks/                    \# deploy, rollback, incident  
  apps/  
    api/                         \# NestJS service (src/modules/\*, test/)  
    web/                         \# React \+ TypeScript app  
  packages/  
    contracts/                   \# generated OpenAPI types / shared schemas  
  prisma/  
    schema.prisma  
    migrations/  
  prototypes/                    \# throwaway clickable prototypes (not shipped)  
  tests/  
    integration/                 \# QA-owned API \+ DB tests  
    e2e/                         \# Playwright journeys  
    load/                        \# k6 scripts  
  scripts/sdlc/                  \# gate and findings checks  
  reports/\<YYYY-MM-DD\>-\<version\>/ \# evidence packs  
  .github/  
    workflows/                   \# ci.yml, claude-review.yml, deploy.yml  
    CODEOWNERS  
  docker-compose.yml  
  package.json  tsconfig.base.json  eslint.config.mjs  .nvmrc

# **5\. Agent Design Rationale**

The team is deliberately small. A responsibility becomes a standalone agent only when it needs its own judgement, its own permissions boundary, or independence from the work it checks. Everything else is a **skill** (specialist knowledge an agent loads when needed) or a **capability** (work activated only in certain conditions and carried out by existing agents).

## **5.1 Design principles**

* **One owner per change.** A single agent implements a change end to end, so shared types, contracts and migrations stay consistent.

* **Independence through context and permissions.** Reviewers are separate agents with read-only tools and a fresh context; independence is not achieved through prompt wording.

* **Permissions boundaries justify agents.** Work that needs different access — pipelines and infrastructure, for example — has its own agent.

* **Conditional work is a capability.** Work that only some projects need does not get a permanent agent.

* **Humans are accountable.** Agents produce and check work; named humans approve it.

## **5.2 How each responsibility is assigned**

| Responsibility | Assigned to | Form | Reason |
| ----- | ----- | ----- | ----- |
| Requirements, PRD, acceptance criteria | Product/Requirements Agent | Agent | Distinct discipline at the start of the lifecycle with clear inputs and outputs |
| Solution design, ADRs, API contract, logical data model | Solution Architect Agent | Agent | Design authority must be distinct from implementation and from review |
| Backend implementation (NestJS) | Developer Agent | Skill: nestjs-backend | One owner per change |
| Frontend implementation (React) | Developer Agent | Skill: react-frontend | Frontend and backend share contracts in packages/contracts; one agent keeps them consistent |
| Database migrations and seed data | Developer Agent | Skill: prisma-migrations | Migrations ship with the code that uses them; the logical data model is decided by the Solution Architect |
| Integrations with external systems | Developer Agent | Skill: integration-adapters | Part of the same implementation change |
| Architecture conformance review | Architect Review Agent | Agent | Must be independent of the author (Section 9\) |
| Adversarial review | Critical Review Agent | Agent | Must be independent of the author and of the Architect Review (Section 9\) |
| Security review | Critical Review (code level), Architect Review (security architecture), CI scanners; human AppSec for Tier 3 | Skill: security-scan plus controls | Avoids a duplicate reviewer; an AI reviewer is not a substitute for security specialists |
| Testing and verification | Testing/QA Agent | Agent | Independent verification against requirements, separate from the code author |
| CI/CD, containers, infrastructure, release preparation | Release/DevOps Agent | Agent | Distinct permissions boundary |
| Documentation and release notes | Developer, Release/DevOps, orchestrator | Skill: docs-writer | Needs no independent judgement; accuracy is checked by reviewers and QA |
| UX journeys, screen specs and prototypes | Requirements Agent (ux-spec), Developer (ux-prototype); approved by the UX Lead | Capability | Needed only when a UI is in scope |
| Maintenance and operations | Existing agents via incident-triage and dependency-update | Capability | Avoids an agent with broad production reach; changes re-enter the lifecycle |
| Orchestration | Main session or workflow engine | Role, not an agent | Plans, delegates and checks gates; has no implementation powers |

## **5.3 Result**

The team has **seven agents**: four that create artifacts (Requirements, Solution Architect, Developer, Release/DevOps), one that verifies against requirements (QA), and two independent reviewers (Architect Review, Critical Review). The orchestrator is a role played by the main session or a workflow engine, not an eighth agent.

# **6\. Final Agent Catalogue**

## **6.1 Catalogue overview**

| Agent | File | Purpose | Primary outputs | Suggested model \[Verify\] |
| ----- | ----- | ----- | ----- | ----- |
| Product/Requirements | requirements-analyst.md | Turn business goals into an approved, testable PRD | docs/requirements/\<feature\>.md, docs/ux/\<feature\>.md (when UI) | Sonnet |
| Solution Architect | solution-architect.md | Define the solution and record decisions | docs/design/\<feature\>-adr.md, openapi.yaml, data model, diagrams, docs/plans/\<feature\>-plan.md | Opus |
| Developer | developer.md | Implement the approved design in Node.js/TypeScript (and React) | Code, unit tests, migrations, config, API docs, implementation notes | Sonnet |
| Architect Review | architect-reviewer.md | Independent conformance and quality-attribute review | Structured findings \+ docs/reviews/\<feature\>-architect-\<sha\>.md | Opus |
| Critical Review | critical-reviewer.md | Independent adversarial review | Structured findings \+ docs/reviews/\<feature\>-critical-\<sha\>.md | Opus |
| Testing/QA | qa-engineer.md | Verify requirements with traceable tests | Test plan, traceability matrix, integration/E2E/load tests, reports/test-summary.md, defects | Sonnet |
| Release/DevOps | release-engineer.md | Make the change releasable and operable | Dockerfiles, workflows, IaC, deployment plan, rollback runbook, release notes | Sonnet |

Model choice follows a simple cost principle: strongest reasoning for design and review, balanced models for building and testing. Model names and aliases are environment-dependent.

## **6.2 Agent specifications**

### **Product/Requirements Agent (requirements-analyst)**

| Field | Specification |
| ----- | ----- |
| Responsibilities | Elicit and structure requirements; write the PRD; number every requirement (REQ-n), user story (US-n) and acceptance criterion (AC-n.m, Given/When/Then); capture NFRs (security, performance, availability, audit, accessibility, privacy); list assumptions, dependencies, risks, out-of-scope items and open questions. When UI is in scope, produce user journeys and screen specifications using the ux-spec skill. |
| Inputs | Business goal, project charter (Phase 1), existing system context, stakeholder notes, tickets (via Jira/Confluence MCP, read-only by default). |
| Outputs | docs/requirements/\<feature\>.md; docs/ux/\<feature\>.md when applicable; optional Jira issues (write only when the human asks). |
| Tools | Read, Write, Grep, Glob; Atlassian MCP (read; write by request). |
| Permissions | Write limited by instruction to docs/requirements/\*\* and docs/ux/\*\*. No Bash. |
| Completion criteria | Every story has measurable ACs; every NFR has a target or is listed as an open question; no unresolved open question is hidden; traceability IDs are unique. |
| Must not | Make design decisions; invent business rules — ask instead; mark its own PRD approved. |

### **Solution Architect Agent (solution-architect)**

| Field | Specification |
| ----- | ----- |
| Responsibilities | Component and module design; API contract (OpenAPI 3.1); logical data model; authentication/authorisation design; secrets and data-protection design; integration patterns; error model; observability; deployment model; failure scenarios; technology ADRs with options considered; Node.js/TypeScript alignment. Produces the implementation plan in Phase 5 (task breakdown, dependencies, file ownership, test expectations, risk tier proposal). |
| Inputs | Approved PRD (HG-1 record), approved UX spec (HG-2, if applicable), CLAUDE.md, existing codebase. |
| Outputs | docs/design/\<feature\>-adr.md, docs/design/openapi.yaml, docs/design/\<feature\>-data-model.md (with Mermaid ER diagram), docs/plans/\<feature\>-plan.md. |
| Tools | Read, Grep, Glob, Write. |
| Permissions | Write limited by instruction to docs/design/\*\* and docs/plans/\*\*. No Bash. |
| Completion criteria | Every requirement maps to a component and (where relevant) an endpoint and entity; every ADR has ≥ 2 options with trade-offs; Spectral lint passes on the OpenAPI file (run by orchestrator or CI); risks and failure scenarios listed. |
| Must not | Write application code; approve its own design; override a reviewer finding. |

### **Developer Agent (developer)**

| Field | Specification |
| ----- | ----- |
| Responsibilities | Implement approved tasks in TypeScript: NestJS modules, controllers, services, DTOs/validation, guards; React components and API integration; Prisma schema changes and migrations; configuration; unit tests; API documentation; implementation notes. Fix findings and defects routed to it. Uses skills: nestjs-backend, react-frontend, prisma-migrations, integration-adapters, ux-prototype (Phase 3), docs-writer, python-service (optional). |
| Inputs | Approved design and plan (HG-3, HG-4 records), task ID, routed findings or defects with evidence. |
| Outputs | Code under apps/\*\*, packages/\*\*, prisma/\*\*; unit tests; docs/plans/\<feature\>-impl-notes.md; a commit on a feature branch. |
| Tools | Read, Write, Edit, Grep, Glob, Bash (allow-listed: lint, typecheck, unit tests, Prisma generate/migrate on local DB, git status/diff/add/commit). |
| Permissions | No push to main; no edits to tests/integration/\*\*, tests/e2e/\*\* (QA-owned), .github/\*\* (Release-owned), .sdlc/exceptions/\*\*, docs/design/\*\* (approved artifacts). No production credentials. |
| Completion criteria | Lint, typecheck and unit tests pass locally; diff coverage target met; every task’s ACs addressed; implementation notes list deviations from the design (a deviation triggers HG-C). |
| Must not | Weaken or delete tests or assertions to pass; change the API contract or data model without returning to the Solution Architect; mark findings resolved; claim checks passed without command output. |

### **Architect Review Agent (architect-reviewer) and Critical Review Agent (critical-reviewer)**

Specified in full in Section 9\. Both have read-only tools (Read, Grep, Glob, and Bash restricted to lint, typecheck, test and scan commands), run in a fresh context, and return findings in the schema in Appendix C.2. Neither edits code or approves anything.

### **Testing/QA Agent (qa-engineer)**

| Field | Specification |
| ----- | ----- |
| Responsibilities | Test strategy and plan; traceability matrix (AC → test); integration and API tests (Supertest), contract checks, Playwright E2E with accessibility checks, regression selection, k6 load tests, review of unit-test adequacy; run suites; classify each failure (product defect, test defect, environment); defect reports; release-readiness evidence. Uses security-scan skill to run and summarise scanners when CI is not available. |
| Inputs | Approved PRD, design, plan; the commit under test; CI results. |
| Outputs | docs/plans/\<feature\>-test-plan.md, reports/traceability.csv, tests under tests/\*\*, reports/test-summary.md, defect records. |
| Tools | Read, Write, Edit, Grep, Glob, Bash (test runners, docker compose for local services); Playwright MCP. |
| Permissions | Edit only tests/\*\*, reports/\*\* and docs/plans/\*-test-plan.md. No production code edits. |
| Completion criteria | 100% of ACs mapped to at least one test; all selected suites executed with raw results saved; every failure classified; quality gates in Section 13.3 evaluated with evidence. |
| Must not | Delete or loosen an assertion to make a test pass; fix product code; report a pass without the runner output. |

### **Release/DevOps Agent (release-engineer)**

| Field | Specification |
| :---- | :---- |
| Responsibilities | CI/CD workflows; Dockerfiles (non-root, health checks); docker-compose for local; IaC; environment configuration (without secret values); deployment plan; rollback runbook; operational readiness (dashboards, alerts, SLOs); release notes via docs-writer; prepare the HG-5 evidence on the pull request (feature PR, or release PR when releases are batched). |
| Inputs | Approved design (deployment model), QA evidence, HG-5 record. |
| Outputs | .github/workflows/\*\*, Dockerfiles, infra/\*\*, docs/runbooks/deploy.md, docs/runbooks/rollback.md, reports/\<YYYY-MM-DD\>-\<version\>/release-notes.md. |
| Tools | Read, Write, Edit, Grep, Glob, Bash (docker build, compose, actionlint, terraform fmt/validate/plan against non-production); GitHub MCP (PRs, checks). |
| Permissions | May trigger deployment to non-production environments where the pipeline permits. **Never** deploys to production directly; production deployment runs from the pipeline after HG-6. No secret values in files. |
| Completion criteria | Build is reproducible from a clean checkout; actions pinned to SHAs; least-privilege workflow permissions; rollback documented and rehearsed in staging; health checks and alerts defined. |
| Must not | Bypass environment protection; store secrets; change application logic. |

## **6.3 Skills catalogue**

Skills keep agents lean: specialist knowledge loads only when needed.

| Skill | Used by | Contents |
| ----- | ----- | ----- |
| sdlc-feature | Orchestrator (/sdlc-feature) | Phase sequence, gate checks, state updates, routing rules (Section 11.8) |
| nestjs-backend | Developer | Module structure, DTO validation, guards, error filter, logging, OpenAPI decorators, Jest/Supertest patterns |
| react-frontend | Developer | Component conventions, data fetching against packages/contracts, loading/error/empty states, WCAG 2.2 AA, Vitest \+ Testing Library |
| prisma-migrations | Developer | Migration rules, expand/contract, rollback scripts, seed data (dev only), index justification |
| integration-adapters | Developer | Outbound HTTP clients, retries/timeouts/circuit breakers, idempotency, queue consumers |
| ux-spec | Requirements | Journey and screen-spec templates, states, accessibility notes |
| ux-prototype | Developer | Throwaway clickable prototype in prototypes/ (Vite \+ React) or link to Figma; never shipped |
| security-scan | Critical Review, QA | How to run and triage Semgrep/CodeQL, gitleaks, Trivy, npm audit/OSV; OWASP Top 10 and OWASP API Top 10 checklists |
| review-findings | Both reviewers, orchestrator | Finding schema, severity rules, fingerprinting, re-review protocol |
| traceability | Requirements, QA | ID conventions, matrix format, coverage checks |
| docs-writer | Developer, Release, orchestrator | README, API docs, runbooks, release notes, executive summary; “never invent numbers” |
| evidence-pack | Orchestrator, Release | Assemble gate evidence tied to a commit SHA |
| incident-triage | Maintenance capability | Collect signals, reproduce, write failing test, root-cause template, post-mortem |
| dependency-update | Maintenance capability | Assess Dependabot/Renovate PRs, breaking changes, test and risk summary |
| python-service | Developer (optional) | Rules for isolated Python services: contract, own CI job, pytest, ruff, mypy |

## **6.4 Ownership boundaries (RACI)**

R \= Responsible, A \= Accountable (always a human), C \= Consulted, I \= Informed.

| Activity | Req. | Sol. Arch. | Dev | Arch Rev | Crit Rev | QA | Release | Accountable human |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| PRD and acceptance criteria | R | C | — | — | C | C | — | Product Owner |
| UX journeys / screen specs | R | C | — | — | C | — | — | UX Lead / Product Owner |
| Clickable prototype | C | — | R | — | — | — | — | UX Lead |
| Architecture, ADRs, OpenAPI, data model | C | R | C | C (review) | C (review) | C | C | Solution Architect |
| Implementation plan and risk tier | C | R | C | — | C | C | C | Engineering Lead |
| Application code and unit tests | — | C | R | — | — | I | — | Engineering Lead |
| Integration/E2E/load tests | C | — | C | — | — | R | — | QA Lead |
| Architecture conformance review | — | I | I | R | — | — | — | Solution Architect |
| Adversarial review | — | I | I | — | R | — | — | Engineering Lead (Security Lead for security findings) |
| CI/CD, containers, IaC, runbooks | — | C | C | — | — | C | R | Release Manager / Platform Lead |
| Production deployment | — | — | — | — | — | I | R (prepares) | Release Manager (HG-6) |
| Exceptions to findings | — | C | C | C | C | C | — | Solution Architect / Security Lead for High; Engineering Lead for Medium (HG-X) |

# **7\. End-to-End SDLC Workflow**

## **7.1 Lifecycle overview**

| Phase | Name | Responsible | Key outputs | Gate |
| ----- | ----- | ----- | ----- | ----- |
| 1 | Project Initialisation | Orchestrator \+ Engineering Lead | Project charter, CLAUDE.md, policies, connectors, greenfield/brownfield assessment | HG-0 (configurable) |
| 2 | Requirements Engineering | Product/Requirements | PRD with REQ/US/AC IDs, NFRs, risks | **HG-1 (mandatory)** |
| 3 | UX and Prototype | Requirements (ux-spec) \+ Developer (ux-prototype) | Journeys, screen specs, clickable prototype | HG-2 (mandatory when UI in scope, Tier 2/3) |
| 4 | Solution Architecture | Solution Architect; reviewed by Architect Review \+ Critical Review | ADRs, OpenAPI, data model, security and deployment design, design review findings | **HG-3 (mandatory)** |
| 5 | Implementation Planning | Solution Architect | Task breakdown, dependencies, ownership, test expectations, risk tier | HG-4 (configurable; mandatory for Tier 3\) |
| 6 | Code Generation and Development | Developer | Code, unit tests, migrations, config, API docs, implementation notes | — (automated checks) |
| 7 | Independent Review | Architect Review \+ Critical Review | Consolidated findings bound to a commit SHA; rework loop | — (blocking rules; HG-E/HG-X when triggered) |
| 8 | QA and Verification | Testing/QA | Test results, traceability, defects, coverage | — (quality gates) |
| 9 | Release Readiness | Release/DevOps \+ QA | Evidence pack, release notes, rollback plan, readiness checklist | **HG-5 (mandatory)** |
| 10 | Deployment | Pipeline (prepared by Release/DevOps) | Staging then production deployment, smoke and health checks | **HG-6 (mandatory)** |
| 11 | Maintenance and Continuous Improvement | Maintenance capability via existing agents | Triage records, fixes via the lifecycle, post-mortems, learnings | HG-C when material |

Cross-cutting gates: **HG-C** (material change to scope, architecture, security posture or production behaviour), **HG-X** (exception to accept a blocking finding or quality-gate breach) and **HG-E** (escalation when a retry budget is exhausted).

## **7.2 Workflow diagram**

The workflow is shown in four parts so that each remains readable. Diamonds are decision points; HG-n diamonds are Human Gateway gates.

**Part A (left): Phases 1 to 3 — initialisation, requirements and UX. Part B (right): Phases 4 and 5 — architecture and planning.**

![][image2]   ![][image3]

**Part C — Phases 6 to 8: build, independent review and QA**

![][image4]

**Part D — Phases 9 to 11: release, deployment and maintenance**

![][image5]

*Figure 2 — End-to-end workflow with Human Gateway decision points (diamonds). HG-C and HG-X can be raised from any phase; HG-X and HG-E appear in Figure 3 and HG-C triggers are defined in Section 8.6.*

## **7.3 Risk tiers and conditional paths**

The Solution Architect proposes a tier in the implementation plan; the Engineering Lead confirms it at HG-4. When HG-4 is skipped, the Engineering Lead confirms the tier as an additional approver on the HG-3 pull request. Any reviewer may raise the tier with a finding; only a human may lower it.

| Tier | Typical changes | Configurable gates | Review depth | Extra mandatory controls |
| :---- | :---- | :---- | :---- | :---- |
| **1 — Low** | Documentation, internal tooling, copy changes, non-production config, refactor with full test protection and no contract/schema change | HG-0, HG-2, HG-4 may be skipped (recorded) | Both reviews run in “conformance” mode on the diff | — |
| **2 — Standard** | New endpoints or screens, business logic, non-destructive schema change | HG-4 optional per policy | Full review | Integration and E2E for affected journeys |
| **3 — High** | Authentication/authorisation, payments, PII/regulated data, destructive or data-migrating schema change, public API breaking change, infrastructure or network change, new third-party data processor | None skipped | Full review \+ human AppSec review \+ Stryker mutation run on changed modules | Security Lead added as a third approver at HG-5; rehearsed rollback; HG-4 mandatory |

**What can never be skipped (MANDATORY at every tier for code reaching a protected branch):** an HG-1 and HG-3 approval covering the scope (new, or inherited for a defect fix), HG-5, and HG-6 where the change reaches production; both independent reviews; CI quality gates; secrets scanning; the rule that blocking findings are closed only by re-review evidence or an approved HG-X exception.

**Parallel execution (where safe).** Work may run in parallel only when it operates on stable, approved inputs and does not write the same files:

* Architect Review and Critical Review run in parallel on the same pinned commit.

* After HG-3, the Developer may split implementation into sub-tasks (API module, web pages, migration) in parallel when the OpenAPI contract and data model are approved; each sub-task owns distinct paths.

* QA may write integration and E2E tests from the approved contract while development is in progress, then executes them against the reviewed commit.

* Release/DevOps may prepare pipelines and infrastructure in parallel with development.

Parallel work never runs across a gate: nothing after HG-3 starts before HG-3 is approved.

**Defect-fix and documentation paths.** A defect fix or documentation-only change that stays within an already approved PRD and design **inherits** that HG-1 and HG-3 approval: the implementation plan cites the approved artifacts and their SHAs, and work enters at Phase 5 or 6\. If the fix changes requirements, the API contract, the data model or the security design, HG-C applies and the affected gates are re-approved before implementation continues. Phases 6 to 10, both reviews, CI gates, HG-5 and HG-6 always apply.

## **7.4 Phase specifications**

Each phase lists entry conditions, responsible role, activities, outputs, quality checks, approval and failure handling.

### **Phase 1 — Project Initialisation**

| Element | Specification |
| :---- | :---- |
| Entry conditions | Business sponsor has named a Product Owner and Engineering Lead; repository exists or is approved to be created. |
| Responsible | Orchestrator (main session) with the Engineering Lead. |
| Activities | Capture objectives, scope, stakeholders, constraints, compliance needs, target environments; record repository and existing-system context; classify as **greenfield** or **brownfield**. For brownfield, ask Claude to map the codebase (modules, frameworks, test status, build commands) into docs/design/current-state.md. Run /init and edit CLAUDE.md (Section 11.4). Configure permissions, hooks and least-privilege MCP connectors. Name the human role holders for each gate. |
| Outputs | docs/project-charter.md; CLAUDE.md; .claude/settings.json; .github/CODEOWNERS mapping gate roles to paths; gate role register. |
| Quality checks | CLAUDE.md states stack, commands, rules, definition of done; every gate has a named role holder and deputy; secrets are denied in settings. |
| Approval | HG-0 (CONFIGURABLE): Engineering Lead confirms charter and role register. |
| Failure / rework | Missing role holders or unresolved compliance scope → do not proceed past Phase 1\. |

### **Phase 2 — Requirements Engineering**

| Element | Specification |
| :---- | :---- |
| Entry conditions | Charter exists; business goal stated. |
| Responsible | Product/Requirements Agent. Human: Product Owner. |
| Activities | Draft or refine the PRD; ask open questions rather than guess; number REQ/US/AC; capture NFRs with targets; list assumptions, dependencies, risks, out-of-scope items. Optionally a lightweight Critical Review of the PRD to find ambiguity (RECOMMENDED for Tier 3). |
| Outputs | docs/requirements/\<feature\>.md on a branch; PR titled \[HG-1\] PRD: \<feature\>. |
| Quality checks | Every story has testable Given/When/Then ACs; NFRs measurable; no open question marked resolved without an answer. |
| Approval | **HG-1 (MANDATORY)** — Product Owner approves the PRD PR. |
| Failure / rework | Changes requested → Requirements Agent revises with the reviewer’s comments as input; re-submitted PR re-enters HG-1. |

### **Phase 3 — UX and Prototype (conditional)**

| Element | Specification |
| :---- | :---- |
| Entry conditions | HG-1 approved; UI in scope. |
| Responsible | Requirements Agent (ux-spec) for journeys and screen specs; Developer (ux-prototype) for a clickable prototype in prototypes/\<feature\>/ or a Figma link via MCP. Human: UX Lead and Product Owner. |
| Activities | Map each user story to a journey and screens; specify states (loading, empty, error, success), validation messages, accessibility notes; build a clickable prototype; check every AC is reachable. |
| Outputs | docs/ux/\<feature\>.md, prototype link or folder, coverage table (US → screen). |
| Quality checks | 100% of UI-facing stories covered; accessibility notes per screen. |
| Approval | **HG-2** — MANDATORY when UI is in scope for Tier 2/3; CONFIGURABLE for Tier 1\. |
| Failure / rework | Changes → back to Phase 3; if a change alters requirements → HG-C and update the PRD (re-approval at HG-1 for the changed sections). |

### **Phase 4 — Solution Architecture**

| Element | Specification |
| :---- | :---- |
| Entry conditions | HG-1 approved (and HG-2 where applicable). |
| Responsible | Solution Architect Agent; design review by Architect Review and Critical Review. Human: Solution Architect. |
| Activities | Component design; OpenAPI contract; data model; authN/authZ; secrets and data protection; integrations; error model; observability; deployment model; ADRs with options; failure scenarios. Run Spectral on the OpenAPI file. Run **design review** (both reviewers, parallel, pinned to the design commit). Resolve blocking findings. |
| Outputs | ADR, openapi.yaml, data model, diagrams; design review findings. |
| Quality checks | Requirements → component/endpoint/entity mapping complete; Spectral 0 errors; no open Critical/High design findings without HG-X. |
| Approval | **HG-3 (MANDATORY)** — Solution Architect; Security Lead also approves for Tier 3\. |
| Failure / rework | Findings → Solution Architect Agent revises → design re-review; budget exhausted → HG-E. |

### **Phase 5 — Implementation Planning**

| Element | Specification |
| :---- | :---- |
| Entry conditions | HG-3 approved. |
| Responsible | Solution Architect Agent (with Developer and QA consulted). Human: Engineering Lead. |
| Activities | Break requirements into tasks (T-n) linked to REQ/AC IDs; define dependencies, parallelisable units and path ownership; set test expectations per task; propose risk tier; QA drafts the test plan skeleton. |
| Outputs | docs/plans/\<feature\>-plan.md, docs/plans/\<feature\>-test-plan.md (draft), .sdlc/state/\<feature\>.json updated. |
| Quality checks | Every AC appears in at least one task and one planned test; each task has completion criteria. |
| Approval | HG-4 — CONFIGURABLE; MANDATORY for Tier 3 or when organisational policy requires. |
| Failure / rework | Changes → revise plan; plan reveals design gap → HG-C back to Phase 4\. |

### **Phase 6 — Code Generation and Development**

| Element | Specification |
| :---- | :---- |
| Entry conditions | HG-3 (and HG-4 if required) approved for this scope, or inherited for a defect fix (Section 7.3); feature branch created from main. |
| Responsible | Developer Agent. Human: Engineering Lead (oversight). |
| Activities | Implement tasks in order; Prisma schema and migrations; unit tests; API docs; config; run lint, typecheck, unit tests; self-check against ACs; write implementation notes including any deviation from the design. Commit with conventional commits referencing task IDs. The orchestrator pushes the feature branch (push is not pre-approved, so a human confirms it) and opens a draft PR; it marks the PR ready for review when the tasks are complete. |
| Outputs | Commits on the feature branch; draft PR; implementation notes. |
| Quality checks | ESLint 0 errors; tsc \--noEmit 0 errors; unit tests pass; diff coverage ≥ target; no new any or @ts-ignore without justification; Stop hook passes. |
| Approval | None (automated checks). Any design deviation → HG-C. |
| Failure / rework | Check failures → Developer fixes (bounded by the retry budget in Section 10.3). |

### **Phase 7 — Independent Review**

| Element | Specification |
| :---- | :---- |
| Entry conditions | Phase 6 checks pass on a pushed commit; PR marked ready for review. |
| Responsible | Architect Review and Critical Review (parallel, fresh context, same SHA). Orchestrator consolidates. |
| Activities | Review per Section 9; consolidate findings with attribution; route blocking findings to the Developer (or Solution Architect for design-level issues); Developer reworks; automated checks; re-review of every prior finding on the new SHA. |
| Outputs | Findings per round (CI artifact \+ PR comment); docs/reviews/\<feature\>-\*.md; findings register mirror. |
| Quality checks | 0 open Critical/High findings on the head SHA (or each covered by an approved HG-X exception); every Medium has a decision (fix now or tracked ticket). |
| Approval | No gate by default; HG-X for exceptions; HG-E when budget exhausted. |
| Failure / rework | See Section 10\. |

### **Phase 8 — QA and Verification**

| Element | Specification |
| :---- | :---- |
| Entry conditions | Phase 7 passed on the head SHA. |
| Responsible | Testing/QA Agent. Human: QA Lead. |
| Activities | Run integration, contract, E2E, accessibility, regression and (Tier 2/3 or release) load tests; verify traceability; classify failures; raise defects; route product defects through rework (which re-enters Phase 7 for the changed code). |
| Outputs | JUnit XML, HTML reports, coverage, reports/traceability.csv, reports/test-summary.md, defects. |
| Quality checks | Quality gates in Section 13.3. |
| Approval | None; results feed HG-5. |
| Failure / rework | Product defect → Developer → Phase 6 checks → Phase 7 re-review for the changed code → Phase 8 re-run of affected suites. Test defect → QA fixes test (assertion changes reviewed by Critical Review). Environment issue → Release/DevOps. |

### **Phase 9 — Release Readiness**

| Element | Specification |
| :---- | :---- |
| Entry conditions | Phase 8 gates met on the head SHA. |
| Responsible | Release/DevOps Agent with QA. Humans: Engineering Lead, QA Lead, Release Manager. |
| Activities | Verify reproducible build from clean checkout; configuration and secret references per environment; migration plan and rollback (rehearsed in staging for Tier 3); observability (dashboards, alerts, SLOs); runbooks; SBOM and licence report; release notes; assemble evidence pack (evidence-pack skill). |
| Outputs | reports/\<YYYY-MM-DD\>-\<version\>/ evidence pack and release-summary.md, attached to the pull request under HG-5 (the feature PR; or a release PR from a release branch when releases are batched). |
| Quality checks | Readiness checklist (Section 15.4) complete; all evidence bound to the release SHA. |
| Approval | **HG-5 (MANDATORY)** — Engineering Lead \+ QA Lead; plus Security Lead for Tier 3\. |
| Failure / rework | Reject → route to owning agent; any code change invalidates HG-5 and re-enters Phase 7 for the change. |

### **Phase 10 — Deployment**

| Element | Specification |
| :---- | :---- |
| Entry conditions | HG-5 approved on the release SHA; change window confirmed. |
| Responsible | CI/CD pipeline (prepared by Release/DevOps). Human: Release Manager / Service Owner. |
| Activities | Merge to main deploys to staging; run smoke tests and health checks; request HG-6; on approval deploy to production using blue/green or canary; post-deploy smoke tests and health checks; monitor error rate and latency for the agreed observation window. |
| Outputs | Deployment records, smoke-test results, monitoring snapshot, deployment entry in the release report. |
| Quality checks | Staging smoke 100% pass; production health checks green; SLO burn rate within threshold. |
| Approval | **HG-6 (MANDATORY, never relaxable)** — Release Manager (and Service Owner/CAB where required). |
| Failure / rework | Failed staging → back to rework; failed production verification → automated or one-command rollback per runbook, incident opened, Phase 11 triage. |

### **Phase 11 — Maintenance and Continuous Improvement**

| Element | Specification |
| :---- | :---- |
| Entry conditions | Release in production; or a new incident, defect, dependency update or improvement request. |
| Responsible | Maintenance capability (Section 17\) using existing agents. Human: Service Owner. |
| Activities | Monitor; triage incidents and defects; reproduce with a failing test; route changes into the lifecycle at the right phase (defect fix → Phase 5/6; new feature → Phase 2; architectural change → Phase 4 via HG-C); post-mortems; feed learnings into CLAUDE.md, skills and checklists. |
| Outputs | Triage records, PRs, post-mortems, updated skills. |
| Quality checks | Every production change went through Phases 6–10. |
| Approval | As per the phase re-entered; HG-C for material changes. |
| Failure / rework | Repeated incidents in one area → architecture review request. |

# **8\. Human Gateway Design**

## **8.1 Principles (MANDATORY)**

1. **Pause until decided.** At a mandatory gate the workflow stops. No downstream phase starts until an authorised decision exists in the system of record.

2. **No simulated or inferred approval.** Silence, a timeout, a chat message such as “looks good”, or an agent’s statement is never approval. The orchestrator verifies the decision through the system-of-record API (for example the GitHub PR review state or environment approval).

3. **Role-based authority.** Each gate names the role(s) that may decide. Authority is enforced by the platform (CODEOWNERS, required reviewers, environment protection rules), not by prompt text.

4. **Separation of duties.** The person who requested or drove the agent work may not be the sole approver at HG-5 or HG-6.

5. **Bound to versions.** An approval is valid only for the artifact version (commit SHA or document hash) presented. Material change invalidates it (Section 8.6).

6. **Evidence-based.** The approver sees a defined evidence pack, not a summary alone.

7. **Auditable.** Every decision records who, when, what version, decision, rationale and conditions, in a store agents cannot modify.

## **8.2 Gate catalogue and approval matrix**

| Gate | Name | Type | Responsible human role | Entry conditions | Evidence pack | Resumes when |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **HG-0** | Project charter | CONFIGURABLE | Engineering Lead | Charter, CLAUDE.md, settings drafted | Charter, role register, connector list with scopes | Approved |
| **HG-1** | PRD and requirements | MANDATORY | Product Owner | PRD complete; open questions answered or explicitly deferred | PRD diff, open-question log, NFR table, optional critical-review notes | PRD PR approved and merged |
| **HG-2** | UX and prototype | MANDATORY when UI in scope (Tier 2/3) | UX Lead \+ Product Owner | HG-1 approved; UX spec and prototype ready | Journeys, screen specs, prototype link, story-to-screen coverage | Approved |
| **HG-3** | Architecture and design | MANDATORY | Solution Architect (+ Security Lead for Tier 3\) | Design artifacts complete; design review has no open Critical/High (or approved HG-X) | ADRs, OpenAPI \+ Spectral result, data model, security design, design findings and dispositions | Design PR approved and merged |
| **HG-4** | Implementation plan | CONFIGURABLE (MANDATORY for Tier 3\) | Engineering Lead | HG-3 approved; plan and draft test plan ready | Task list, traceability seed, risk tier rationale, parallelisation plan | Approved |
| **HG-5** | Code and quality acceptance | MANDATORY | Engineering Lead \+ QA Lead (+ Security Lead for Tier 3\) | Phases 7–9 complete on the release SHA | Evidence pack: diff, CI results, findings register (all rounds), exceptions, test summary, coverage, traceability, security scans, SBOM, release notes, rollback plan | Required approvals on the PR; all required checks green |
| **HG-6** | Production deployment | MANDATORY, never relaxable | Release Manager (+ Service Owner / CAB if policy requires) | HG-5 approved; staging deployment and smoke tests passed for the same SHA | Staging results, change record, deployment and rollback plan, monitoring plan, change window | Environment approval granted |
| **HG-C** | Material change | MANDATORY when triggered | Owner of the gate whose approved artifact changes | A material change (Section 8.6) detected or proposed | Change description, impact analysis, updated artifacts, affected gates | Affected gates re-approved |
| **HG-X** | Exception | MANDATORY when triggered | Per severity/domain (Section 10.5) | Request to accept a blocking finding or gate breach | Exception record (Appendix C.3), compensating controls, expiry | Exception record approved and merged |
| **HG-E** | Escalation | MANDATORY when triggered | Engineering Lead (Solution Architect for design loops) | Retry budget exhausted or reviewer/developer deadlock | Finding history across rounds, attempted fixes, root-cause hypothesis | Decision recorded |

## **8.3 Decision options**

| Decision | Meaning | Effect on workflow |
| ----- | ----- | ----- |
| **Approve** | Artifact accepted as presented | Proceed to next phase; approval bound to the SHA/hash |
| **Approve with conditions** | Accepted subject to listed conditions (e.g. follow-up ticket by date) | Proceed; conditions recorded and tracked; not allowed at HG-6 for unresolved Critical/High |
| **Request changes** | Specific changes needed; scope otherwise accepted | Return to the producing agent with the reviewer’s comments as mandatory input and explicit rework criteria |
| **Return for rework** | Material problem; redo the phase (or an earlier phase) | Route to the named phase; downstream approvals invalidated |
| **Reject** | Do not proceed with this work as defined | Workflow stops; state set to rejected; Product Owner decides next step |

Every non-approval decision must include written feedback that states what must change and how the change will be verified. The orchestrator passes this feedback verbatim to the agent.

## **8.4 Authorisation and audit trail**

**Recommended implementation on GitHub (Level 2):**

| Gate | System of record | Enforcement |
| ----- | ----- | ----- |
| HG-1, HG-2, HG-3, HG-4 | Pull request containing the documents | CODEOWNERS for docs/requirements/\*\*, docs/ux/\*\*, docs/design/\*\*, docs/plans/\*\*; “Require review from Code Owners”; “Dismiss stale approvals when new commits are pushed” |
| HG-5 | Code pull request | Required status checks (CI, reviews, findings gate), required approvals (count by tier), CODEOWNERS |
| HG-6 | GitHub environment production | Required reviewers; “prevent self-review” where available \[Verify\]; deployment branch restricted to main |
| HG-X | PR adding .sdlc/exceptions/\<id\>.yaml (High) or .sdlc/exceptions/medium/\<id\>.yaml (Medium) | CODEOWNERS: Security team and Solution Architect for .sdlc/exceptions/; Engineering Lead for .sdlc/exceptions/medium/ |
| HG-C, HG-E | Issue with label gate:HG-C / gate:HG-E plus re-approval PRs | Issue templates; decision comment by an authorised role |

**Audit record.** Each gate decision produces a record (Appendix C.1) containing: gate ID, feature, artifact references and SHA/hash, decision, decider identity and role, timestamp (UTC), rationale, conditions, linked findings/exceptions. With GitHub, the authoritative record is the PR review/environment approval plus the organisation audit log; the orchestrator mirrors a copy into reports/\<YYYY-MM-DD\>-\<version\>/gates.json for convenience — the mirror is never the source of truth.

**Tamper evidence.** Agents have no write permission to approvals. Branch protection, signed commits (RECOMMENDED) and the platform audit log provide tamper evidence. For regulated environments, export audit logs to a write-once store \[SA-D08\].

## **8.5 Timeouts and escalation**

| Gate | Default SLA | On timeout |
| ----- | ----- | ----- |
| HG-1, HG-2, HG-3 | 2 business days | Reminder to role holder and deputy; after 2 more days escalate to Engineering Lead / Delivery Manager |
| HG-4 | 1 business day | Reminder; then escalate to Engineering Lead’s deputy |
| HG-5 | 1 business day | Reminder; escalate to Delivery Manager |
| HG-6 | Per change window | If the window passes, the approval request lapses; re-request with a new window |
| HG-X, HG-E | 2 business days | Escalate to Head of Engineering |

A timeout **never** results in approval. A scheduled workflow (for example a daily GitHub Actions job) can post reminders; SLAs are defaults \[SA-D09\].

## **8.6 Material change and stale approvals**

An approval becomes **stale** and must be renewed when any of the following changes after approval:

| Change | Invalidates |
| ----- | ----- |
| Scope, user stories or acceptance criteria | HG-1 (affected sections), then HG-3/HG-4 if impacted |
| OpenAPI contract, data model, component boundaries, technology choice, auth design | HG-3 (and HG-4) |
| Risk tier raised | HG-4 and any tier-dependent approvals |
| Any code commit after HG-5 | HG-5 |
| Any change to the deployable artifact after HG-6 | HG-6 |
| Security posture (new data flow, new third-party processor, changed secret handling, network exposure) | HG-3 and HG-5; Security Lead sign-off |
| Production behaviour (feature flag defaults, config affecting users, migration plan) | HG-5 and HG-6 |

Detection: CODEOWNERS and “dismiss stale approvals” catch file-level changes; the Developer must declare design deviations in implementation notes; Architect Review flags undeclared deviations as High findings.

## **8.7 Mandatory versus configurable gates**

Mandatory: HG-1, HG-3, HG-5, HG-6, and HG-C/HG-X/HG-E when triggered; HG-2 when UI is in scope for Tier 2/3; HG-4 for Tier 3\. Configurable: HG-0; HG-2 for Tier 1; HG-4 for Tier 1/2. Relaxing a configurable gate is recorded in the workflow state with the name of the human who decided. **No agent may relax any gate.** For non-production experiments (spikes, prototypes) on unprotected branches, gates do not apply — but such work cannot be merged to a protected branch without entering the lifecycle.

# **9\. Independent Review: Architect Review and Critical Review**

## **9.1 Independence requirements (MANDATORY)**

| Requirement | How it is achieved |
| ----- | ----- |
| Separate agents | Distinct agent files with their own instructions; not appended to the Developer prompt |
| Fresh context | Each review runs as a new sub-agent invocation or a new CI job; no conversation carry-over |
| Pinned version | Inputs reference a commit SHA; findings record that SHA |
| No self-assessment as evidence | Reviewers receive requirements, design, diff, test and scan outputs — not the Developer’s summary of its own work (implementation notes are allowed only for declared deviations) |
| Read-only | Tools: Read, Grep, Glob, Bash restricted to lint/typecheck/test/scan commands; no Edit/Write to code |
| Authoritative run in CI | The review job on the PR head SHA is the system of record; local runs are advisory pre-checks |
| Different perspective | Architect Review checks conformance and quality attributes; Critical Review hunts for defects. A different model or model version may be used for one reviewer \[SA-D06\] |

## **9.2 Architect Review Agent — criteria**

The Architect Review answers: *“Is this built according to the approved design and sound architecture principles?”*

| Area | Checks |
| ----- | ----- |
| Approved design and ADRs | Implementation matches ADR decisions; undeclared deviations are High findings |
| Component boundaries | NestJS module boundaries respected; no cross-module reach-through to repositories; dependency direction (controllers → services → repositories); no circular imports |
| Maintainability | Modularity, cohesion, naming, duplication, extensibility points; complexity hotspots |
| Scalability | Statelessness of API instances; pagination; N+1 queries; queue use for long work |
| Data | Prisma schema matches data model; constraints, indexes justified by queries; transactions where invariants span tables; idempotency; migration safety (expand/contract) |
| API contracts and integration | Responses match OpenAPI; versioning; error model (consistent problem-details shape); timeouts, retries, circuit breakers on outbound calls |
| Security architecture | AuthN at the edge, AuthZ per endpoint/resource (guards), secrets from vault/env, PII classification and encryption, least-privilege service identities |
| Performance and resilience | Caching strategy, connection pooling, graceful shutdown, health/readiness, back-pressure |
| Observability | Structured logs with correlation IDs and redaction, metrics for golden signals, tracing spans across boundaries |
| Deployment readiness | Config externalised, twelve-factor alignment, container hardening, migration ordering with deploys |
| Principles | Enterprise architecture principles in CLAUDE.md; Well-Architected pillars (Section 14.3) |

## **9.3 Critical Review Agent — criteria**

The Critical Review answers: *“What is wrong, missing or unproven — and how will this fail?”* It works adversarially and must not merely restate the Architect Review.

| Area | Checks |
| ----- | ----- |
| Assumptions and requirements | Unstated assumptions; ACs not implemented; ambiguous requirements interpreted silently |
| Logic and edge cases | Boundary values, null/undefined handling, time zones, currency rounding, concurrency and race conditions (double submit, lost update), retries causing duplicates |
| Failure modes | Partial failure across DB and external calls; timeouts; poison messages; behaviour when dependencies are down |
| Security | OWASP Top 10 and OWASP API Security Top 10: broken object-level authorisation, injection (including Prisma raw queries), mass assignment, SSRF, insecure deserialisation, secrets in code/logs, missing rate limits; uses security-scan results as input |
| Tests | Missing tests for ACs and error paths; assertions that cannot fail; over-mocking; snapshot-only tests; tests weakened in this diff (any loosened assertion is High) |
| Input validation and data integrity | DTO validation on every input; whitelist/forbid unknown properties; DB constraints back up app validation |
| Dependencies and operations | New dependencies: maintenance, licence, known vulnerabilities, size; operational toil; missing alerts |
| Complexity | Over-engineering, speculative abstractions, hidden maintenance cost |
| Evidence gaps | Claims of “tests pass” or “fixed” without output; reports inconsistent with CI results |

The Critical Review is not a penetration test, formal threat model, or compliance assessment; where those are required, they are performed by qualified humans and recorded at HG-3/HG-5.

## **9.4 Severity model and blocking rules**

| Severity | Definition | Examples | Blocking rule | Who may approve an exception (HG-X) |
| :---- | :---- | :---- | :---- | :---- |
| **Critical** | Exploitable security flaw, data loss/corruption, legal/regulatory breach, or failure of a mandatory control | Missing authorisation on order lookup; secrets committed; destructive migration without backup | Blocks merge, release and deployment | **Not waivable for production by default.** Fix required. Any risk-acceptance path requires executive risk owner \+ Security Lead \[SA-D10\] |
| **High** | Significant defect or design violation likely to cause incidents, security weakness, or undeclared deviation from approved design | Race condition on payment capture; no timeout on payment provider call; assertion loosened | Blocks merge to protected branch and release | Solution Architect (architecture) or Security Lead (security), with compensating control and expiry ≤ 30 days |
| **Medium** | Quality or robustness issue with limited impact | Missing pagination limit on internal endpoint; inconsistent error shape | Must be fixed before release **or** tracked with owner and due date, accepted by Engineering Lead at HG-5 | Engineering Lead |
| **Low** | Minor improvement | Naming, small duplication | Advisory; logged | Not required |
| **Info** | Observation or praise | — | None | — |

Rules: a reviewer may not downgrade a finding raised by the other reviewer; when duplicate findings differ in severity, the higher applies until a human decides. Medium findings that recur across three releases in the same area are escalated to High.

## **9.5 Finding format**

Each reviewer returns a JSON array of finding objects like the one below. The JSON Schema is in Appendix C.2; save it as .claude/skills/review-findings/schema.json.

{  
  "id": "CR-checkout-007",  
  "fingerprint": "sha1(category|file|normalised-title)",  
  "reviewer": "critical-reviewer",  
  "reviewed\_sha": "3f9c2ab",  
  "severity": "High",  
  "category": "security/authorization",  
  "title": "Order lookup does not verify ownership",  
  "location": { "file": "apps/api/src/modules/orders/orders.controller.ts", "lines": "41-58" },  
  "evidence": "GET /orders/:id loads by id only; no check that order.customerId equals the caller's sub claim.",  
  "requirement\_refs": \["REQ-4", "AC-4.2"\],  
  "rationale": "Any authenticated user can read another customer's order (OWASP API1: BOLA).",  
  "recommended\_fix": "Scope the query by customerId from the JWT, or apply an ownership guard.",  
  "verification": "Integration test: user B requesting user A's order returns 404; test must fail on current code.",  
  "blocking": **true**,  
  "status": "open"  
}

## **9.6 Review report template**

\# \<Architect|Critical\> Review — \<feature\> — round \<n\>  
Reviewed SHA: \<**sha**\>   Base: \<**base-sha**\>   Date (UTC): \<**timestamp**\>   Reviewer: \<**agent** **\+** **model**\>  
Inputs: PRD \<path@sha\>, ADR \<path@sha\>, OpenAPI \<path@sha\>, CI run \<**id**\>, scans \<**ids**\>

\#\# Verdict  
PASS | PASS WITH NON-BLOCKING FINDINGS | BLOCKED

\#\# Prior findings re-verified  
| ID | Previous status | Result on this SHA (verified-fixed / still-open / regressed) | Evidence |

\#\# New findings  
| ID | Severity | Category | Location | Title | Blocking |

\#\# Details  
(one block per finding: evidence, rationale, recommended fix, verification criteria)

\#\# Coverage statement  
What was reviewed, what was not reviewed and why (e.g. "infra/ not changed").

The **coverage statement** is mandatory: a review that does not state what it did not examine cannot support a PASS.

## **9.7 Consolidation and disagreement**

The orchestrator merges both reviewers’ outputs into one register **without rewriting findings**: it groups duplicates by fingerprint and location, keeps each reviewer’s attribution, and applies the higher severity. Disagreements are resolved as follows:

| Situation | Resolution |
| :---- | :---- |
| Reviewers disagree on severity | Higher severity stands; the Developer may request a human decision via HG-X (if a lower severity would remove blocking) |
| Developer disputes a finding | Developer marks disputed with evidence (e.g. a test demonstrating correctness). The originating reviewer re-evaluates once in a fresh context. If still disputed → human decision: Solution Architect (architecture), Security Lead (security), Engineering Lead (other) |
| Reviewer contradicts approved ADR | Treated as a design question → HG-C to Solution Architect; not silently overridden by either side |
| Reviewer error (false positive) confirmed by human | Finding closed as invalid with rationale; pattern fed back into the reviewer’s skill to reduce repeats |

# **10\. Rework, Escalation and Exception Handling**

## **10.1 The control loop**

![][image6]

*Figure 3 — Review and rework loop. The loop never ends in an automatic pass.*

## **10.2 Finding lifecycle**

![][image7]

*Figure 4 — Finding states. Only a re-review on a new SHA can move a finding to VerifiedFixed; only a human can move it to Accepted or Invalid.*

## **10.3 Rules**

| Topic | Rule |
| :---- | :---- |
| **Blocking finding** | Any Critical or High finding; any finding that breaks a MANDATORY control; any Medium that a gate approver marks blocking. |
| **Prioritisation** | Critical → High → Medium; within severity, findings on shared contracts/data model first (they cause rework elsewhere), then by blast radius. |
| **Assignment** | Code findings → Developer; design findings → Solution Architect Agent (HG-C if approved design changes); test findings → QA; pipeline/infra findings → Release/DevOps. Each finding has exactly one owner. |
| **Tracking** | Findings register keyed by id and fingerprint; status changes only per Figure 4; register mirrored to .sdlc/findings/\<feature\>.json for the orchestrator and to PR comments for humans. |
| **Fix evidence** | The owner provides a commit SHA and, for defects, a test that failed before the fix and passes after. “Fixed” without evidence is ignored. |
| **Regression test selection** | Always: lint, typecheck, full unit suite. Plus: integration tests for affected modules (determined by changed paths → module map in CLAUDE.md); E2E journeys touching affected endpoints/screens (traceability matrix); full regression suite before HG-5. Contract tests whenever openapi.yaml or controllers change. |
| **Re-review scope** | Re-review re-checks every prior open finding on the new SHA **and** reviews the incremental diff for new issues. A full re-review is required if the incremental diff exceeds 30% of the original change or touches a different module \[default; SA-D11\]. |
| **Retry budget** | Per finding: 3 rework cycles. Per phase: 4 review rounds. Automated-check failures inside Phase 6: 5 attempts before escalation. |
| **Escalation** | Budget exhausted → HG-E with the finding history. Options: extend budget (once), human pairing, re-scope (Phase 2), redesign (Phase 4), request exception (HG-X, only where severity allows), or stop. **Reaching a retry limit never passes a failed review.** |
| **Endless-loop prevention** | Budgets plus escalation; reviewers must re-use finding IDs (fingerprints) so the same issue is not re-raised as “new”; new Low/Info findings in round ≥ 3 do not reset the budget; oscillating findings (fixed then regressed twice) escalate immediately. |
| **Stale approvals** | Any rework commit after a gate approval invalidates that approval per Section 8.6; branch protection dismisses stale PR approvals automatically. |

## **10.4 Escalation record**

An HG-E issue contains: feature, phase, finding IDs, severity, rounds attempted, each attempted fix with SHA, reviewer evidence per round, root-cause hypothesis from the orchestrator, recommended option and the decision recorded by the authorised human.

## **10.5 Exceptions (HG-X)**

| Element | Requirement |
| :---- | :---- |
| Who may request | The Engineering Lead or another accountable human. An agent may draft the request text, but a human opens the exception pull request (agents cannot write .sdlc/exceptions/\*\*). |
| Who may approve | Per Section 9.4: High → Solution Architect (architecture) or Security Lead (security); Medium → Engineering Lead; Critical → not waivable for production by default \[SA-D10\] |
| Required evidence | Finding ID and fingerprint, reviewed SHA, business justification, risk analysis (likelihood, impact), compensating controls, monitoring, remediation plan with owner and date, expiry date |
| Record | .sdlc/exceptions/EX-\<n\>.yaml for High, or .sdlc/exceptions/medium/EX-\<n\>.yaml for Medium (Appendix C.3), merged via PR approved by CODEOWNERS for that directory |
| Enforcement | The CI findings gate allows a blocking finding only when an unexpired exception exists for its fingerprint and the exception’s approval is on record |
| Expiry | High ≤ 30 days; Medium ≤ 90 days; on expiry the finding reopens and blocks the next release |
| Reporting | All active exceptions appear in every HG-5 evidence pack and the release summary |

## **10.6 Agents that must never bypass controls**

No agent may: approve a gate; edit .sdlc/exceptions/\*\*, .github/CODEOWNERS or branch protection; change a finding’s status to VerifiedFixed, Accepted or Invalid; deploy to production; or describe work as reviewed, tested or deployed without linking the evidence. These are enforced through settings deny rules, CODEOWNERS and platform permissions (Section 11.4, Step 6), not only through prompts.

# **11\. Implementing the Workflow with Claude**

## **11.1 What Claude provides, and what it does not**

Defining agents in Markdown does **not** by itself create a reliable, persistent, multi-agent orchestration system. Agents are invoked within a session; sessions end; chat approvals are not authenticated; and an agent’s statement that something passed is not evidence. This methodology therefore separates nine concerns and assigns each to the layer that can actually guarantee it.

| Concern | Provided by | Notes |
| :---- | :---- | :---- |
| Agent roles and responsibilities | This document; .claude/agents/\*.md | Definitions only — behaviour is guided, not guaranteed |
| Prompts and project instructions | CLAUDE.md; Claude Projects instructions (chat) | Loaded each session |
| Reusable skills and task templates | .claude/skills/\*/SKILL.md | Loaded when relevant or invoked by name \[Verify\] |
| Orchestration and workflow state | Level 2: /sdlc-feature skill \+ .sdlc/state/\*.json in Git; Level 3: workflow engine or Agent SDK program | Level 2 state is best-effort and must be re-validated against GitHub at each step |
| Human approval interfaces | GitHub PR reviews, CODEOWNERS, protected environments (or Jira/ServiceNow workflow) | Never chat |
| Repository and file operations | Claude Code tools (Read, Edit, Write, Bash) under settings.json permissions | Local or cloud session |
| Tool integrations | MCP connectors (GitHub, Atlassian, Playwright, database read-only, Sentry, Figma) | Least privilege |
| Automated quality checks and CI/CD | GitHub Actions (or equivalent), Claude Code GitHub Action for reviews | The objective referee |
| Auditability and security | Git history, CI logs and artifacts, platform audit log, hooks, deny rules | Tamper evidence comes from the platform |

## **11.2 Capability by environment**

| Capability | Claude chat (desktop/web) with Projects | Claude Code (terminal, IDE, desktop app) | Needs integration (MCP / CI) | Needs custom orchestrator / workflow engine |
| :---- | :---- | :---- | :---- | :---- |
| Draft PRD, UX spec, ADR, plan from documents | ✔ (paste or upload files; Project knowledge) | ✔ (in repo) | Jira/Confluence MCP to read/write tickets | — |
| Read/edit repository, run tests | ✘ (unless the environment provides code execution on your repo) | ✔ | — | — |
| Sub-agents with separate context | Environment-dependent | ✔ (.claude/agents) \[Verify\] | — | — |
| Parallel sub-agents | — | ✔ in supported versions \[Verify\] | — | For large fan-out across repos |
| Browser-driven E2E and screenshots | — | ✔ via Playwright MCP or Playwright CLI | Playwright MCP | — |
| Authoritative independent review bound to SHA | — | Advisory locally | Claude Code GitHub Action on PR \[Verify inputs\] | — |
| Enforced human approval | — | — | GitHub reviews / environments | Approval service if not using GitHub |
| Durable state across days, retries, timeouts | — | Best effort via files | Scheduled workflows for reminders | ✔ (e.g. Temporal, AWS Step Functions, Azure Durable Functions, or GitHub Actions \+ issue labels) |
| Unattended / scheduled runs | — | claude \-p headless mode \[Verify flags\] | GitHub Actions schedule | Agent SDK service |
| Multi-repository programmes | — | Manual | — | ✔ |

**Practical guidance for Claude Desktop users.** Use a Claude Project (with this guide, CLAUDE.md and the PRD template as knowledge) for the document-heavy phases — requirements, UX specs, ADR drafts and review of documents — and open each output as a PR so it can pass through the gate. Use Claude Code (available in the terminal, IDEs and, depending on plan and version, inside the Claude desktop app \[Verify\]) for every phase that touches the repository. Do not treat a chat reply as a gate decision.

## **11.3 Three implementation levels**

| Level | Orchestration | State | Gates enforced by | Best for |
| :---- | :---- | :---- | :---- | :---- |
| **1 — Manual** | You invoke each agent by name | Files in repo | GitHub PR reviews | Learning; first pilot feature |
| **2 — Guided (start here for teams)** | /sdlc-feature skill in Claude Code drives phases and checks gate status via GitHub | .sdlc/state/\<feature\>.json \+ GitHub as source of truth | Branch protection, CODEOWNERS, environments, CI findings gate | Standard team workflow |
| **3 — Automated** | Workflow engine or Agent SDK service invokes Claude per stage | Engine database; GitHub | Engine waits on approval events from GitHub/ITSM | Large-scale, unattended, multi-repo |

## **11.4 Environment setup**

### **Step 1 — Prerequisites**

* A Claude plan that includes Claude Code (Pro, Max, Team or Enterprise) or a Claude Console API key. For company rollout, Team or Enterprise for central administration and SSO \[Verify current plans\].

* Git and GitHub (or GitLab/Azure DevOps — see \[SA-D07\]).

* Node.js Active LTS, npm, Docker Desktop (or Podman), VS Code or a JetBrains IDE.

* A sandbox cloud account or local Docker environment for non-production deployments.

### **Step 2 — Install and sign in to Claude Code**

*\# Install — follow the current method at code.claude.com/docs (native installer or npm) \[Verify\]*  
npm install \-g @anthropic-ai/claude-code

claude \--version

mkdir shop-platform **&&** cd shop-platform  
git init  
claude          *\# follow the login prompt*

**\[ INSERT YOUR SCREENSHOT HERE \]** — Terminal after running claude, showing the signed-in account.

### **Step 3 — Create the project skeleton**

Ask Claude (Developer Agent with the nestjs-backend and react-frontend skills, after HG-0) or run:

npm init \-y  
npm pkg set workspaces='\["apps/\*","packages/\*"\]'  
npx @nestjs/cli new apps/api \--package-manager npm \--skip-git \--strict  
npm create vite@latest apps/web \-- \--template react-ts  
mkdir \-p packages/contracts prisma docs/{requirements,ux,design,plans,reviews,runbooks} \\  
  tests/{integration,e2e,load} .sdlc/{state,findings,exceptions} scripts/sdlc reports .claude/{agents,skills,hooks}  
npm install \-D prisma **&&** npm install \-w apps/api @prisma/client  
npx prisma init \--datasource-provider postgresql     *\# creates prisma/ at the repository root*  
touch .sdlc/exceptions/.gitkeep                        *\# Git does not track empty folders*  
printf 'extends: \["spectral:oas"\]\\n' \> .spectral.yaml  *\# Spectral needs a ruleset \[Verify\]*

Command flags change between tool versions; confirm them before use.

### **Step 4 — CLAUDE.md (project handbook)**

Run /init, then edit. Keep it short, specific and testable.

\# Shop Platform — Project Handbook

\#\# Stack  
\- Node.js 22 LTS (.nvmrc), TypeScript strict, npm workspaces  
\- API: NestJS (apps/api), Prisma \+ PostgreSQL 16, class-validator DTOs, OpenAPI 3.1 (docs/design/openapi.yaml is the contract)  
\- Web: React \+ TypeScript \+ Vite (apps/web), types from packages/contracts  
\- Tests: Jest \+ Supertest (API), Vitest \+ Testing Library (web), Playwright (e2e), k6 (load)  
\- CI: GitHub Actions | Observability: Pino, OpenTelemetry, @nestjs/terminus

\#\# Commands  
\- Install: ***\`npm ci\`***            Dev: ***\`npm run dev \-w apps/api\`*** / ***\`npm run dev \-w apps/web\`***  
\- Lint: ***\`npm run lint\`***         Types: ***\`npm run typecheck\`***      Format: ***\`npm run format\`***  
\- Unit: ***\`npm run test:unit\`***    Integration: ***\`npm run test:integration\`***   E2E: ***\`npx playwright test\`***  
\- DB: ***\`npx prisma migrate dev\`*** (local only)   Generate client: ***\`npx prisma generate\`***  
\- Contract lint: ***\`npx @stoplight/spectral-cli lint docs/design/openapi.yaml\`***

\#\# Module map (for regression selection)  
\- apps/api/src/modules/orders  \-\> tests/integration/orders\*, e2e: checkout, order-history  
\- apps/api/src/modules/payments \-\> tests/integration/payments\*, e2e: checkout

\#\# Rules  
\- Never commit secrets; use env vars; only .env.example is committed.  
\- Every endpoint: DTO validation (whitelist \+ forbidNonWhitelisted), auth guard, ownership check, tests.  
\- All DB changes via Prisma migrations with a documented rollback; destructive changes use expand/contract.  
\- No ***\`any\`***, no ***\`@ts-ignore\`*** without a linked justification comment.  
\- Conventional commits referencing task IDs (T-n); small PRs; never push to main.  
\- Approved artifacts (docs/design/\*\*, docs/requirements/\*\*) change only through HG-C.  
\- Never weaken a test or assertion to make it pass.

\#\# Definition of Done  
\- Lint, types, tests pass in CI; diff coverage \>= 80% lines (Tier 2/3); contract tests pass;  
\- Architect Review and Critical Review: no open blocking findings on the head SHA;  
\- Docs updated; evidence written to reports/; required gates approved.

### **Step 5 — Connect tools with MCP (least privilege)**

| Connector | Used by | Purpose | Privilege |
| :---- | :---- | :---- | :---- |
| GitHub | Orchestrator, Release, QA, Developer | PRs, reviews, checks, issues, gate status | Fine-grained token: repo-scoped; no admin |
| Atlassian (Jira/Confluence) | Requirements, orchestrator | Read tickets; create stories on request; publish docs | OAuth, project-scoped |
| PostgreSQL | Developer, reviewers | Inspect local/dev schema; read-only queries | Read-only DB user on local/dev only — never production |
| Playwright | QA, Developer | Drive a browser for E2E checks and screenshots | Local |
| Slack / Teams | Orchestrator | Notify gate approvers (notifications only — not approvals) | Post-only |
| Sentry / monitoring | Maintenance capability | Pull production errors and traces | Read-only |
| Figma | Requirements, Developer | Read designs | Read-only |

*\# Verify syntax and package names at code.claude.com/docs before use \[Verify\]*  
claude mcp add playwright \-- npx @playwright/mcp@latest  
claude mcp add postgres \-- npx \-y @modelcontextprotocol/server-postgres \\  
  "postgresql://readonly\_user:\*\*\*@localhost:5432/shop"  
claude mcp add \--transport http github https\://api.githubcopilot.com/mcp/ \\  
  \--header "Authorization: Bearer \$GITHUB\_TOKEN"  
claude mcp add \--transport sse atlassian https\://mcp.atlassian.com/v1/sse  
/mcp      *\# inside Claude Code: check status and authenticate*

**\[ INSERT YOUR SCREENSHOT HERE \]** — /mcp screen with each connector connected.

### **Step 6 — Permissions, deny rules and hooks**

{  
  "permissions": {  
    "allow": \[  
      "Bash(npm run lint:\*)", "Bash(npm run typecheck:\*)", "Bash(npm run format:\*)",  
      "Bash(npm run test:\*)", "Bash(npx jest:\*)", "Bash(npx vitest:\*)",  
      "Bash(npx playwright test:\*)", "Bash(npx prisma generate)",  
      "Bash(npx @stoplight/spectral-cli lint:\*)",  
      "Bash(git status)", "Bash(git diff:\*)", "Bash(git log:\*)", "Bash(git add:\*)", "Bash(git commit:\*)"  
    \],  
    "deny": \[  
      "Read(./.env)", "Read(./.env.\*)", "Read(./secrets/\*\*)",  
      "Edit(./.sdlc/exceptions/\*\*)", "Write(./.sdlc/exceptions/\*\*)",  
      "Edit(./.github/CODEOWNERS)", "Write(./.github/CODEOWNERS)",  
      "Bash(rm \-rf:\*)", "Bash(git push \--force:\*)", "Bash(git push origin main:\*)",  
      "Bash(npx prisma migrate reset:\*)", "Bash(npm publish:\*)", "Bash(curl:\*)"  
    \]  
  },  
  "hooks": {  
    "PostToolUse": \[{  
      "matcher": "Edit|Write",  
      "hooks": \[{ "type": "command", "command": "jq \-r '.tool\_input.file\_path' | xargs npx prettier \--write \--ignore-unknown || true" }\]  
    }\],  
    "Stop": \[{  
      "hooks": \[{ "type": "command", "command": ".claude/hooks/require-checks.sh" }\]  
    }\]  
  }  
}

Permission-rule syntax and hook event names are version-dependent \[Verify\]. npx prisma migrate dev is deliberately **not** pre-approved because it can reset a database; Claude must ask each time. Deny rules are a second line of defence — the platform controls in Section 8.4 are the first.

## **11.5 Agent files**

Appendix A contains complete agent files for all seven agents. Each file has front matter (name, description, tools, model, and optionally skills to preload \[Verify field names\]) and a body with process, rules and output format. There are two ways to create them:

* **Guided:** in Claude Code run /agents → Create new agent → Project → Generate with Claude → select tools and model → save \[Verify menu wording\].

* **File-based (recommended for teams):** copy Appendix A files into .claude/agents/ and review them in a PR (they are governed artifacts — CODEOWNERS: Solution Architect).

**\[ INSERT YOUR SCREENSHOT HERE \]** — /agents listing the seven project agents.

## **11.6 Skills**

Create each skill as .claude/skills/\<name\>/SKILL.md with name and description front matter \[Verify current fields\]; supporting files (checklists, templates, scripts) sit beside it. Keep descriptions precise (“Use when implementing or changing a NestJS module…”) so the right skill loads. Appendix B contains the key skills.

## **11.7 Hooks**

| Hook | Event | Purpose |
| :---- | :---- | :---- |
| Format on edit | PostToolUse (Edit/Write) | Prettier on the changed file |
| Require checks | Stop | Run typecheck and unit tests; exit code 2 returns the failure to Claude so it keeps working \[Verify\] |
| Protect approved artifacts (RECOMMENDED) | PreToolUse (Edit/Write) | Block edits to docs/design/\*\* and docs/requirements/\*\* unless the workflow state for the feature is in an HG-C rework step |

*\#\!/usr/bin/env bash*  
*\# .claude/hooks/require-checks.sh — blocks "done" while checks fail*  
input\=\$(cat)  
*\# Avoid an infinite loop if Claude is already continuing because of this hook \[Verify field name\]*  
**if** \[ "\$(echo "\$input" **|** jq \-r '.stop\_hook\_active // false')" \= "true" \]**;** **then** exit 0**;** **fi**  
**if** \! **{** npm run \-s typecheck **&&** npm run \-s test:unit \-- \--silent**;** **}** \> /tmp/claude-checks.out 2\>&1**;** **then**  
  tail \-n 40 /tmp/claude-checks.out \>&2  
  exit 2  
**fi**  
exit 0

The hook is a convenience. CI remains the authoritative gate.

## **11.8 The orchestration skill: /sdlc-feature**

The orchestration skill drives the lifecycle and enforces gates by checking GitHub, not by asking in chat. Save as .claude/skills/sdlc-feature/SKILL.md (older Claude Code versions: .claude/commands/sdlc-feature.md) \[Verify\]. Invoke with /sdlc-feature "Customer checkout with order history".

*\---*  
***name:** sdlc-feature*  
***description:** Run the agentic SDLC for one feature with Human Gateway checks. Use when the user asks to build, change or continue a feature through the lifecycle.*  
*\---*  
Feature request: \$ARGUMENTS

You are the ORCHESTRATOR. You do not write application code, tests or design documents yourself.  
You delegate to agents, check gates, and keep .sdlc/state/\<**feature**\>.json current.

\#\# Start or resume  
1\. Derive \<**feature**\> (kebab-case). Read .sdlc/state/\<**feature**\>.json if it exists; otherwise create it (Appendix C.4).  
2\. Re-validate state against GitHub: for each gate marked approved, confirm via the GitHub connector  
   or ***\`gh\`*** that the approving review/environment approval exists for the recorded SHA. If not, mark it stale.

\#\# Gate rule (never skip)  
At a gate: open or update the PR/issue for the gate, list the evidence pack, set state "awaiting:\<**gate**\>",  
tell the human who must decide and where, and STOP. Do not continue in this session until the approval  
is verifiable in GitHub. A chat message is not an approval. Silence is not an approval.

\#\# Phases  
P1 Initialisation: confirm CLAUDE.md, CODEOWNERS and role register exist; else help create them (HG-0 if configured).  
P2 requirements-analyst \-\> docs/requirements/\<**feature**\>.md ; PR "*\[*HG-1*\]* PRD: \<**feature**\>" ; GATE HG-1.  
P3 If UI in scope: requirements-analyst (ux-spec) \+ developer (ux-prototype) ; GATE HG-2.  
P4 solution-architect \-\> ADR, openapi.yaml, data model ; run Spectral ;  
   design review: architect-reviewer AND critical-reviewer IN PARALLEL on the design commit SHA ;  
   route blocking findings to solution-architect ; re-review ; GATE HG-3.  
P5 solution-architect \-\> plan \+ tier ; qa-engineer \-\> draft test plan ; GATE HG-4 if Tier 3 or policy.  
P6 developer \-\> implement tasks on feature branch ; checks must pass ;  
   orchestrator pushes the feature branch (human confirms the push prompt) and opens a draft PR.  
   When implementation is complete, the orchestrator marks the PR ready for review (this starts CI reviews).  
P7 architect-reviewer AND critical-reviewer IN PARALLEL on the pushed SHA (fresh context; give them  
   PRD, ADR, OpenAPI, diff vs base, CI results, prior findings — NOT the developer's summary).  
   Consolidate without rewriting findings. Blocking \-\> route to owner \-\> rework \-\> checks \-\> re-review.  
   Budgets: 3 cycles per finding, 4 rounds per phase. Exhausted \-\> open HG-E issue and STOP.  
P8 qa-engineer \-\> run suites on the reviewed SHA ; product defects \-\> developer \-\> back to P7 for the change.  
P9 release-engineer \-\> readiness checklist, evidence pack, release notes ; GATE HG-5.  
P10 Merge after HG-5 deploys to staging via pipeline ; report smoke results ; GATE HG-6 (pipeline environment).  
P11 After release: record outcome ; open follow-up tickets for tracked Medium findings and exceptions.

\#\# Rules  
\- Pass file paths and SHAs, not pasted content. Summarise each stage in \<= 15 lines.  
\- Never mark a finding fixed, accepted or invalid. Never edit .sdlc/exceptions/\*\*.  
\- Any change to an approved artifact \-\> HG-C: stop and request re-approval.  
\- Report only results you can link to (command output, CI run, PR). Say "not run" otherwise.

## **11.9 Workflow state and “files, not chat”**

Every agent starts with a fresh context. Writing results to files keeps the orchestrator’s context small, makes work auditable in Git, and lets any session resume after interruption. The orchestrator also keeps .sdlc/state/\<feature\>.json (Appendix C.4), which records the phase, tier, artifacts with SHAs, gate status and finding counts. At Level 2 this file is a convenience index that the orchestrator re-validates against GitHub; at Level 3 the workflow engine holds the authoritative state.

## **11.10 Claude in CI: authoritative reviews**

The fastest way to install the GitHub integration is /install-github-app inside Claude Code \[Verify\]. The review workflow below runs both reviewers on the PR head SHA in fresh contexts and uploads structured findings. Inputs of the action change between versions — confirm them in the action’s documentation.

*\# .github/workflows/claude-review.yml (illustrative — verify action inputs) \[Verify\]*  
name**:** claude-review  
on**:**  
  pull\_request**:**  
    types**:** **\[**opened**,** synchronize**,** reopened**,** ready\_for\_review**\]**  
permissions**:** **{** contents**:** read**,** pull-requests**:** write**,** actions**:** read **}**  
concurrency**:**  
  group**:** review-\${{ github.event.pull\_request.number }}  
  cancel-in-progress**:** true  
jobs**:**  
  review**:**  
    if**:** github.event.pull\_request.draft \== false  
    runs-on**:** ubuntu-latest  
    strategy**:**  
      matrix**:**  
        reviewer**:** **\[**architect-reviewer**,** critical-reviewer**\]**  
    steps**:**  
      **\-** uses**:** actions/checkout@\<PINNED\_SHA\>   *\# v4*  
        with**:** **{** fetch-depth**:** 0 **}**  
      **\-** name**:** Fetch prior findings from the previous completed review run  
        env**:** **{** GH\_TOKEN**:** "\${{ github.token }}" **}**  
        run**:** |  
          mkdir \-p prior  
          prev=\$(gh run list \--workflow claude-review.yml \--branch "\${{ github.head\_ref }}" \\  
                 \--status completed \--limit 1 \--json databaseId \-q '.\[0\].databaseId')  
          if \[ \-n "\$prev" \]; then  
            gh run download "\$prev" \--name "findings-\${{ matrix.reviewer }}" \--dir prior  
          else  
            echo "No previous review run for this branch."  
          fi  
      **\-** uses**:** anthropics/claude-code-action@\<PINNED\_SHA\>   *\# v1*  
        with**:**  
          anthropic\_api\_key**:** \${{ secrets.ANTHROPIC\_API\_KEY }}  
          prompt**:** |  
            Act as the \${{ matrix.reviewer }} agent defined in .claude/agents/\${{ matrix.reviewer }}.md.  
            Reviewed SHA: \${{ github.event.pull\_request.head.sha }}  Base: \${{ github.event.pull\_request.base.sha }}  
            Inputs: docs/requirements, docs/design, the diff base...head, prior/ findings (re-verify each).  
            Write findings JSON (schema in .claude/skills/review-findings/schema.json) to  
            reports/review/\${{ matrix.reviewer }}.json and a report to reports/review/\${{ matrix.reviewer }}.md.  
            Do not modify any other file.  
      **\-** uses**:** actions/upload-artifact@\<PINNED\_SHA\>   *\# v4*  
        with**:**  
          name**:** findings-\${{ matrix.reviewer }}  
          path**:** reports/review/  
  findings-gate**:**  
    needs**:** review  
    if**:** always()          *\# never let a skipped or failed review count as a pass*  
    runs-on**:** ubuntu-latest  
    steps**:**  
      **\-** uses**:** actions/checkout@\<PINNED\_SHA\>  
      **\-** name**:** Check out exceptions from the base branch (only merged, approved exceptions count)  
        uses**:** actions/checkout@\<PINNED\_SHA\>  
        with**:** **{** ref**:** "\${{ github.event.pull\_request.base.ref }}"**,** path**:** base **}**  
      **\-** uses**:** actions/download-artifact@\<PINNED\_SHA\>  
        with**:** **{** pattern**:** findings-\***,** path**:** reports/review**,** merge-multiple**:** true **}**  
      **\-** uses**:** actions/setup-node@\<PINNED\_SHA\>  
        with**:** **{** node-version-file**:** .nvmrc **}**  
      **\-** run**:** npx tsx scripts/sdlc/check-findings.ts reports/review base/.sdlc/exceptions \${{ github.event.pull\_request.head.sha }}

The CI outputs in reports/review/ are the authoritative review record. The orchestrator copies each report into docs/reviews/\<feature\>-\<reviewer\>-\<sha\>.md (for example docs/reviews/checkout-critical-3f9c2ab.md) so humans have a readable history in the repository.

Make findings-gate a **required status check** on main. Because the reviews and gate run on every push, a finding disappears only when a fresh review on the new SHA no longer reports it — closure is evidence-based by construction.

**Findings gate script** (scripts/sdlc/check-findings.ts, illustrative):

**import** { existsSync, readFileSync, readdirSync, statSync } **from** "node:fs";  
**import** { join } **from** "node:path";  
**import** { parse } **from** "yaml";

**type** Finding \= { id: string; fingerprint: string; severity: "Critical"|"High"|"Medium"|"Low"|"Info";  
  reviewed\_sha: string; blocking: boolean; status: string; title: string };  
**type** Exception \= { id: string; fingerprint: string; severity: string; expires: string;  
  approved\_by: string\[\] };

**const** \[reviewDir, exceptionDir, headSha\] \= process.argv.slice(2);  
**const** errors: string\[\] \= \[\];

*// Both reviewers must have produced results for this run.*  
**for** (**const** r **of** \["architect-reviewer", "critical-reviewer"\]) {  
  **if** (\!existsSync(join(reviewDir, \`\${r}.json\`))) errors.push(\`Missing review results from \${r}.\`);  
}  
**const** findings: Finding\[\] \= existsSync(reviewDir) ? readdirSync(reviewDir).filter(f **\=\>** f.endsWith(".json"))  
  .flatMap(f **\=\>** JSON.parse(readFileSync(join(reviewDir, f), "utf8")) **as** Finding\[\]) : \[\];

*// Exceptions come from the BASE branch: only files merged through a CODEOWNERS-approved PR count.*  
**const** listYaml \= (dir: string): string\[\] **\=\>** \!existsSync(dir) ? \[\] : readdirSync(dir).flatMap(f **\=\>** {  
  **const** p \= join(dir, f);  
  **return** statSync(p).isDirectory() ? listYaml(p) : f.endsWith(".yaml") ? \[p\] : \[\];  
});  
**const** exceptions: Exception\[\] \= listYaml(exceptionDir).map(p **\=\>** parse(readFileSync(p, "utf8")) **as** Exception);

**if** (findings.some(f **\=\>** f.reviewed\_sha \!== headSha)) errors.push("Findings are not for the head SHA (stale review).");  
**for** (**const** f **of** findings) {  
  **if** ((f.severity \=== "Critical" || f.severity \=== "High") && \!f.blocking) errors.push(\`\${f.id}: \${f.severity} must be blocking.\`);  
}

**const** now \= **new** Date();  
**for** (**const** f **of** findings.filter(f **\=\>** f.blocking && f.status \!== "verified-fixed")) {  
  **const** ex \= exceptions.find(e **\=\>** e.fingerprint \=== f.fingerprint && **new** Date(e.expires) \> now  
    && f.severity \!== "Critical");  
  **if** (\!ex) errors.push(\`\${f.severity} \${f.id}: \${f.title}\`);  
}  
**if** (errors.length) { console.error("Blocking findings:\\n- " \+ errors.join("\\n- ")); process.exit(1); }  
console.log(\`Findings gate passed (\${findings.length} findings evaluated).\`);

The gate reads exceptions from the base branch, so an exception file added in the same pull request has no effect until it has been approved and merged separately. The exception’s approved\_by field is informational; the real approval is the CODEOWNERS-approved PR that merged the exception file, which agents cannot produce. Medium exceptions under medium/ are tracked for HG-5 but do not affect the gate, because Medium findings are not blocking unless an approver marks them so.

## **11.11 Running Claude non-interactively**

*\# Nightly triage of the last test run (headless mode; verify flags) \[Verify\]*  
claude \-p "Read reports/junit.xml and summarise failures by root cause; do not edit files" \\  
  \--output-format json \> reports/nightly-triage.json

## **11.12 Level 3 — Agent SDK (TypeScript)**

When orchestration must survive restarts, wait days for approvals, or span repositories, run Claude from a service. The example below runs one stage; a workflow engine calls it per phase and waits on GitHub approval events between phases. Package and option names are illustrative \[Verify at docs.claude.com\].

*// orchestrator/stage-runner.ts (illustrative)*  
**import** { query } **from** "@anthropic-ai/claude-agent-sdk";  
**import** { readFileSync } **from** "node:fs";

**const** agentFile \= (name: string) **\=\>** readFileSync(\`.claude/agents/\${name}.md\`, "utf8");

**export** **async** **function** runReview(reviewer: "architect-reviewer" | "critical-reviewer", sha: string) {  
  **const** output: string\[\] \= \[\];  
  **for** **await** (**const** message **of** query({  
    prompt: \`Review commit \${sha} per your instructions. Return findings JSON only.\`,  
    options: {  
      systemPrompt: agentFile(reviewer),  
      allowedTools: \["Read", "Grep", "Glob"\],   *// read-only reviewer; add Bash only with permission*  
                                                *// rules or a PreToolUse hook limiting it to lint/test/scan commands \[Verify\]*  
      permissionMode: "default",  
      cwd: process.env.REPO\_DIR,  
    },  
  })) {  
    **if** (message.type \=== "result" && message.subtype \=== "success") output.push(message.result);  
  }  
  **return** JSON.parse(output.join(""));  
}  
*// The workflow engine persists findings, routes rework, and blocks on*  
*// GitHub "pull\_request\_review" / "deployment\_protection\_rule" events for gates.*

# **12\. Reusable Prompts**

Prompts reference files and IDs, not general wishes. Replace \<feature\> and paths as needed. The /sdlc-feature skill uses these internally; they can also be used manually (Level 1).

## **12.1 Agent prompts**

| Agent / stage | Prompt |
| :---- | :---- |
| Requirements — PRD | *Use the requirements-analyst agent. Goal: customers can check out with a card and see order history. Read docs/project-charter.md. Produce docs/requirements/checkout.md with problem statement, personas, numbered REQ/US/AC (Given/When/Then), NFRs with measurable targets (security, performance, availability, audit, accessibility, privacy), assumptions, dependencies, risks, out of scope, and open questions. Ask me the open questions before finalising.* |
| Requirements — UX spec | *Use the requirements-analyst agent with the ux-spec skill. From docs/requirements/checkout.md, write docs/ux/checkout.md: one journey per user story, screens with all states (loading, empty, error, success), validation messages and accessibility notes, plus a US → screen coverage table.* |
| Developer — prototype | *Use the developer agent with the ux-prototype skill. Build a clickable prototype of docs/ux/checkout.md in prototypes/checkout with mocked data only. No backend calls. List any spec gaps you found.* |
| Solution Architect — design | *Use the solution-architect agent. Read docs/requirements/checkout.md (approved at HG-1, SHA \<sha\>) and docs/ux/checkout.md. Produce the ADR, docs/design/openapi.yaml (OpenAPI 3.1), data model with Mermaid ER diagram, authN/authZ and data-protection design, integration and error model, observability, deployment model and failure scenarios. For each decision list at least two options with trade-offs. Map every REQ to a component and endpoint/entity.* |
| Solution Architect — plan | *Use the solution-architect agent. From the approved design (HG-3, SHA \<sha\>), write docs/plans/checkout-plan.md: tasks T-n linked to REQ/AC, dependencies, parallelisable units with path ownership, test expectations, completion criteria and a proposed risk tier with rationale.* |
| Developer — implement | *Use the developer agent. Implement tasks T-1 to T-4 from docs/plans/checkout-plan.md on branch feat/checkout. Follow docs/design/openapi.yaml exactly. Use the nestjs-backend and prisma-migrations skills. Run lint, typecheck and unit tests and include the command output summary. Record any deviation from the design in docs/plans/checkout-impl-notes.md.* |
| Architect Review | *Use the architect-reviewer agent. Review commit \<sha\> against base \<base-sha\>. Inputs: docs/requirements/checkout.md, docs/design/checkout-adr.md, docs/design/openapi.yaml, CI run \<id\>, prior findings in .sdlc/findings/checkout.json. Re-verify every prior finding, then review the diff. Return findings JSON and a report with a coverage statement.* |
| Critical Review | *Use the critical-reviewer agent. Review commit \<sha\> against base \<base-sha\> adversarially. Inputs as above plus scan results in reports/security/. Do not repeat architecture findings unless you have new evidence. Return findings JSON and a report with a coverage statement.* |
| Developer — rework | *Use the developer agent. Fix findings CR-checkout-007 and AR-checkout-003 (details in .sdlc/findings/checkout.json). For each, add a test that fails on the current code and passes after the fix. Do not change any other behaviour. Report the new SHA and test names. Do not mark findings resolved.* |
| QA — verify | *Use the qa-engineer agent on commit \<sha\>. Build reports/traceability.csv mapping every AC to tests; create or update integration, contract, E2E (with axe) and k6 tests; run them; save raw results; classify each failure as product defect, test defect or environment; write reports/test-summary.md. Never loosen an assertion.* |
| Release — readiness | *Use the release-engineer agent. For release \<version\> at SHA \<sha\>, complete the readiness checklist (Section 15.4), verify a clean-checkout build, confirm migration and rollback steps, update docs/runbooks/rollback.md, generate release notes with the docs-writer skill, and assemble reports/\<YYYY-MM-DD\>-\<version\>/ with the evidence-pack skill. Do not deploy to production.* |
| Maintenance — triage | *Use the incident-triage skill. Sentry issue \<id\>: collect the stack trace and recent deploys, reproduce locally, and have the developer agent write a failing test. Propose the lifecycle entry point (defect fix vs design change) and draft the ticket. Do not change production.* |

## **12.2 Stage prompts for the orchestrator**

| Stage | Prompt |
| :---- | :---- |
| Start | */sdlc-feature “Customer checkout with order history”* |
| Resume | */sdlc-feature resume checkout* — re-validate gates in GitHub and continue from the recorded phase. |
| Gate status | *Show the gate status for checkout from .sdlc/state/checkout.json and verify each approval in GitHub. List stale approvals.* |
| Consolidate findings | *Merge reports/review/*.json into .sdlc/findings/checkout.json. Do not rewrite findings; group duplicates by fingerprint; keep attribution; apply the higher severity.\* |
| Escalate | *Open an HG-E issue for finding CR-checkout-011 with the full history (rounds, SHAs, evidence) and three options with trade-offs. Then stop.* |
| Release summary | *Use the docs-writer skill. Read reports/\<YYYY-MM-DD\>-\<version\>/ and produce release-summary.md: executive summary, scope, tests by layer, coverage, findings and exceptions, security, performance vs targets, known issues, rollback. Quote numbers only from the reports; write “not available” otherwise.* |

# **13\. Testing Strategy and Quality Gates**

## **13.1 Test pyramid (Node.js/TypeScript)**

| Layer | Tooling | Owner | Runs | Target |
| :---- | :---- | :---- | :---- | :---- |
| Static | ESLint (typescript-eslint strict type-checked), Prettier check, tsc \--noEmit, Spectral | Developer | Every commit, every PR | 0 errors |
| Unit | Jest (API), Vitest \+ Testing Library (web) | Developer | Every commit, every PR | Diff coverage ≥ 80% lines, ≥ 70% branches |
| Integration (API \+ DB) | Supertest \+ NestJS testing module; PostgreSQL via Testcontainers or CI service | QA | Every PR | Every endpoint: ≥ 1 success, ≥ 1 authorisation failure, ≥ 1 validation failure |
| Contract | Spectral lint; OpenAPI response validation inside Supertest tests (e.g. jest-openapi); Pact if multiple consumers | QA | Every PR touching API | 0 schema violations |
| End-to-end UI | Playwright | QA | Every PR (critical journeys); nightly (full) | 100% critical journeys pass |
| Accessibility | @axe-core/playwright | QA | Every PR with UI change | 0 serious/critical violations |
| Regression | Selected suites per module map; full suite before HG-5 | QA | Rework rounds; pre-release | 100% pass |
| Load / performance | k6 | QA | Nightly or pre-release (Tier 2/3) | Meets NFR p95 latency and error rate |
| Mutation | StrykerJS on changed modules | QA | Tier 3, pre-HG-5 | Mutation score ≥ 60% on changed modules |
| Security | CodeQL/Semgrep, gitleaks, Trivy, npm audit/OSV-Scanner, SBOM \+ licence check | CI (QA triages) | Every PR | See Section 13.3 |
| Python services (optional) | pytest, ruff, mypy | Developer (python-service) | Every PR touching the service | Same gate levels |

## **13.2 Building the suite (QA prompt)**

1. Read the PRD and write docs/plans/\<feature\>-test-plan.md mapping every AC to at least one test.

2. Create integration tests (tests/integration), Playwright E2E tests (tests/e2e), and a k6 script (tests/load/checkout.js).

3. Run everything; capture JUnit XML and HTML.

4. For each failure decide: product defect, test defect or environment issue; file a defect for product defects.

5. Write reports/test-summary.md and reports/traceability.csv.

## **13.3 Measurable quality gates**

All thresholds are defaults for Solution Architect confirmation \[SA-D05\]. Gates are enforced by CI; agents report against them but cannot pass them.

| Gate | Measure | Threshold | Tier | Enforced in | Type |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Lint | ESLint errors | 0 | All | CI quality job | MANDATORY |
| Types | tsc \--noEmit errors; new any / @ts-ignore | 0; 0 without justification | All | CI | MANDATORY |
| Formatting | Prettier check | Pass | All | CI | MANDATORY |
| Unit tests | Pass rate | 100% | All | CI | MANDATORY |
| Diff coverage | Lines / branches on changed code | ≥ 80% / ≥ 70% | 2, 3 (Tier 1: report only) | CI coverage step | MANDATORY (2, 3\) |
| Integration | Endpoints with success \+ authz-fail \+ validation-fail tests | 100% of changed endpoints | 2, 3 | QA report \+ CI | MANDATORY |
| Contract | OpenAPI violations; Spectral errors | 0; 0 | All API changes | CI | MANDATORY |
| Traceability | ACs mapped to ≥ 1 passing test | 100% | 2, 3 | traceability.csv check | MANDATORY |
| E2E | Critical journeys passing | 100% | 2, 3 | CI e2e job | MANDATORY |
| Flakiness | Tests failing then passing on retry | \< 2% of suite; flaky tests quarantined with ticket | All | QA report | RECOMMENDED |
| Accessibility | axe serious/critical violations | 0 | UI changes | CI | MANDATORY |
| Review | Open blocking findings on head SHA without approved exception | 0 | All | CI findings-gate | MANDATORY |
| Secrets | gitleaks findings | 0 | All | CI | MANDATORY |
| SAST | Critical/High findings | 0 without exception | All | CI | MANDATORY |
| Dependencies | Known Critical/High vulnerabilities with a fix available | 0 without exception | All | CI | MANDATORY |
| Container / IaC | Trivy Critical/High | 0 without exception | All deployables | CI | MANDATORY |
| Licences | Dependencies outside allow-list | 0 | All | CI | MANDATORY |
| Performance | p95 latency; error rate at agreed load | Per NFR (example: p95 ≤ 300 ms, errors \< 1%) | 2, 3 before release | k6 thresholds | MANDATORY when NFR exists |
| Mutation | Stryker score on changed modules | ≥ 60% | 3 | Pre-HG-5 | MANDATORY (3) |
| Build reproducibility | Clean-checkout build produces identical image digest inputs (lockfile, pinned base image) | Pass | Release | Release job | MANDATORY |

## **13.4 The self-healing loop (bounded)**

Aligned with Section 10: QA runs tests and produces a failure list → the orchestrator routes each product defect to the Developer with the failing test and log → the Developer fixes, runs tests locally and reports the SHA → the change returns through Independent Review for the changed code → QA re-runs affected suites. After the retry budget (Section 10.3) the orchestrator opens HG-E and stops.

**Guard against fake passing tests.** Agents can be tempted to weaken tests. MANDATORY rules: never delete or loosen an assertion to pass a test; any diff that removes or weakens an assertion, adds .skip/.only, raises timeouts without explanation or broadens a snapshot is raised by Critical Review as High; QA-owned test paths are protected by CODEOWNERS.

# **14\. Security, Governance and Audit Controls**

## **14.1 Controls register**

| Area | MANDATORY controls | RECOMMENDED practices |
| :---- | :---- | :---- |
| Secure coding | DTO validation with whitelist; parameterised queries (no string-built \$queryRawUnsafe); output encoding in React (no unsafe HTML injection without sanitisation); OWASP Top 10 / API Top 10 checks in Critical Review | eslint-plugin-security; security unit tests for guards |
| Secrets | Deny .env\* and secrets/\*\* to agents; gitleaks in CI and pre-commit; secrets from vault/secret manager; no secrets in logs | Short-lived credentials (OIDC federation from CI to cloud) |
| AuthN / AuthZ | OIDC with enterprise IdP; authorisation guard on every endpoint; object-level ownership checks; deny by default | Policy-as-code for complex rules |
| Supply chain | Lockfile committed; npm ci in CI; actions pinned to commit SHAs; base images pinned by digest; SBOM (CycloneDX) per release; licence allow-list; Dependabot/Renovate | Provenance attestations (e.g. SLSA-style build provenance) \[SA-D12\]; signed commits; npm package age policy for new dependencies |
| Static analysis and scanning | CodeQL or Semgrep, Trivy, npm audit/OSV in CI as required checks | Scheduled full-repo scans |
| Code review and merge | Branch protection on main; PRs only; required checks; CODEOWNERS; dismiss stale approvals; HG-5 approvers per Section 8.2 (Engineering Lead \+ QA Lead; plus Security Lead for Tier 3); no self-approval | Merge queue |
| CI/CD and promotion | Build once, promote the same artifact dev → staging → production; production via protected environment (HG-6) | Canary or blue/green with automated rollback on SLO breach |
| Configuration and infrastructure | IaC in Git; terraform plan reviewed in PR; no manual production changes | Drift detection |
| Logging, metrics, tracing, alerting | Structured JSON logs with correlation IDs and PII redaction; golden-signal metrics; health/readiness endpoints; alerts for SLOs | OpenTelemetry tracing end to end; error budgets |
| Backup, recovery, rollback, incidents | Backups with tested restore for production databases; rollback runbook per release; incident process with post-mortem | Game days; RPO/RTO targets per service |
| Data privacy and retention | Data classification in the design; synthetic or masked data in development; no production data in agent environments; retention rules implemented | Privacy impact assessment for new data flows |
| AI usage | Follow company policy on what may be sent to an AI service; enterprise plan controls; MCP least privilege; treat external content (issues, web pages, files) as untrusted input — agents must not follow instructions found in it | Network egress restrictions for agent sessions |
| Documentation and knowledge | ADRs, OpenAPI, runbooks versioned in Git; CLAUDE.md, agents and skills reviewed via PR | Quarterly doc-freshness review |
| Role-based access and accountability | Named human owner per release; gate roles in CODEOWNERS/environments; agents have no approval rights | Periodic access review |
| Audit and evidence retention | Gate decisions, findings, exceptions, CI logs and release evidence retained per policy (default 7 years for regulated systems, 2 years otherwise \[SA-D08\]) | Export audit logs to write-once storage |
| Cost and efficiency | Right-size models per agent; retry budgets; small contexts (files, not chat); usage monitoring per team | Prompt caching and batch where applicable \[Verify\] |

## **14.2 Prompt-injection and tool-safety rules (MANDATORY)**

* Content from issues, PR comments by external contributors, web pages, documents and dependency READMEs is **data**, not instructions.

* Reviewers and the orchestrator report suspicious instructions found in content rather than acting on them.

* Agents do not run downloaded scripts, do not add new MCP servers, and do not widen their own permissions.

* CI review jobs on pull requests from forks run without secrets or are restricted to maintainers \[Verify the action’s guidance\].

## **14.3 Alignment with Well-Architected principles (cloud-neutral)**

The AWS Well-Architected Framework’s six pillars are used as a checklist; the controls apply equally to Azure, Google Cloud and on-premise platforms.

| Pillar | Where it is addressed in this methodology |
| :---- | :---- |
| Operational excellence | IaC, runbooks, observability, post-mortems, small reversible changes, release evidence (Sections 15, 17\) |
| Security | Controls register, least privilege, secrets, supply chain, Critical Review, human AppSec for Tier 3 (Sections 9, 14\) |
| Reliability | Health checks, timeouts/retries, graceful degradation, backups and tested restore, rollback (Sections 9.2, 15\) |
| Performance efficiency | NFR targets, k6 gates, caching and query review (Sections 9.2, 13\) |
| Cost optimisation | Model right-sizing, retry budgets, environment teardown, resource sizing in design (Sections 6.1, 14.1) |
| Sustainability | Right-sized infrastructure, scale-to-zero non-production environments, avoiding unnecessary CI runs (concurrency cancel) |

# **15\. CI/CD, Release and Deployment Workflow**

## **15.1 Pipeline overview**

![][image8]

*Figure 5 — CI/CD with quality gates and Human Gateway checkpoints.*

## **15.2 CI workflow (starter)**

Pin every action to a commit SHA (\<PINNED\_SHA\> placeholders) before production use, and keep workflow permissions minimal.

*\# .github/workflows/ci.yml*  
name**:** ci  
on**:**  
  pull\_request**:**  
  push**:** **{** branches**:** **\[**main**\]** **}**  
permissions**:** **{** contents**:** read **}**  
concurrency**:**  
  group**:** ci-\${{ github.ref }}  
  cancel-in-progress**:** true

jobs**:**  
  quality**:**  
    runs-on**:** ubuntu-latest  
    steps**:**  
      **\-** uses**:** actions/checkout@\<PINNED\_SHA\>   *\# v4*  
      **\-** uses**:** actions/setup-node@\<PINNED\_SHA\> *\# v4*  
        with**:** **{** node-version-file**:** .nvmrc**,** cache**:** npm **}**  
      **\-** run**:** npm ci  
      **\-** run**:** npm run lint  
      **\-** run**:** npm run typecheck  
      **\-** run**:** npx prettier \--check .  
      **\-** run**:** npx @stoplight/spectral-cli lint docs/design/openapi.yaml  
      **\-** run**:** npm run test:unit \-- \--coverage \--reporters=default \--reporters=jest-junit  
      *\# TO ADD: diff-coverage check (\>= 80% lines / 70% branches on changed code) — tool per \[SA-D05\]*  
      *\# TO ADD: traceability check, e.g. npx tsx scripts/sdlc/check-traceability.ts reports/traceability.csv*  
      **\-** uses**:** actions/upload-artifact@\<PINNED\_SHA\>  
        if**:** always()  
        with**:** **{** name**:** unit-reports**,** path**:** reports/ **}**

  integration**:**  
    needs**:** quality  
    runs-on**:** ubuntu-latest  
    services**:**  
      postgres**:**  
        image**:** postgres:16@sha256:\<PINNED\_DIGEST\>  
        env**:** **{** POSTGRES\_PASSWORD**:** test**,** POSTGRES\_DB**:** shop **}**  
        ports**:** **\[**"5432:5432"**\]**  
        options**:** \>-  
          \--health-cmd pg\_isready \--health-interval 5s \--health-retries 10  
    env**:** **{** DATABASE\_URL**:** "postgresql://postgres:test@localhost:5432/shop" **}**  
    steps**:**  
      **\-** uses**:** actions/checkout@\<PINNED\_SHA\>  
      **\-** uses**:** actions/setup-node@\<PINNED\_SHA\>  
        with**:** **{** node-version-file**:** .nvmrc**,** cache**:** npm **}**  
      **\-** run**:** npm ci  
      **\-** run**:** npx prisma migrate deploy  
      **\-** run**:** npm run test:integration  
      **\-** uses**:** actions/upload-artifact@\<PINNED\_SHA\>  
        if**:** always()  
        with**:** **{** name**:** integration-reports**,** path**:** reports/ **}**

  security**:**  
    runs-on**:** ubuntu-latest  
    permissions**:** **{** contents**:** read**,** security-events**:** write **}**  
    steps**:**  
      **\-** uses**:** actions/checkout@\<PINNED\_SHA\>  
        with**:** **{** fetch-depth**:** 0 **}**  
      **\-** uses**:** gitleaks/gitleaks-action@\<PINNED\_SHA\>  
      **\-** uses**:** actions/setup-node@\<PINNED\_SHA\>  
        with**:** **{** node-version-file**:** .nvmrc**,** cache**:** npm **}**  
      **\-** run**:** npm ci  
      **\-** run**:** npm audit \--audit-level=high \--omit=dev  
      **\-** run**:** npx @cyclonedx/cyclonedx-npm \--output-file reports/sbom.json  
      *\# TO ADD: licence allow-list check against the SBOM — tool per \[SA-D12\]*  
      **\-** uses**:** aquasecurity/trivy-action@\<PINNED\_SHA\>  
        with**:** **{** scan-type**:** fs**,** severity**:** "CRITICAL,HIGH"**,** exit-code**:** "1" **}**

  sast**:**  
    runs-on**:** ubuntu-latest  
    permissions**:** **{** contents**:** read**,** security-events**:** write **}**  
    steps**:**  
      **\-** uses**:** actions/checkout@\<PINNED\_SHA\>  
      **\-** uses**:** github/codeql-action/init@\<PINNED\_SHA\>       *\# or a Semgrep job, per \[SA-D12\]*  
        with**:** **{** languages**:** javascript-typescript **}**  
      **\-** uses**:** github/codeql-action/analyze@\<PINNED\_SHA\>

  e2e**:**  
    needs**:** **\[**integration**\]**  
    runs-on**:** ubuntu-latest  
    steps**:**  
      **\-** uses**:** actions/checkout@\<PINNED\_SHA\>  
      **\-** uses**:** actions/setup-node@\<PINNED\_SHA\>  
        with**:** **{** node-version-file**:** .nvmrc**,** cache**:** npm **}**  
      **\-** run**:** npm ci  
      **\-** run**:** docker compose up \-d \--build \--wait  
      **\-** run**:** npx playwright install \--with-deps && npx playwright test  
      **\-** uses**:** actions/upload-artifact@\<PINNED\_SHA\>  
        if**:** always()  
        with**:** **{** name**:** playwright-report**,** path**:** playwright-report/ **}**

The claude-review.yml workflow and findings-gate are in Section 11.10. Required status checks on main: quality, integration, security, sast, e2e, findings-gate. Lines marked TO ADD are gates required by Section 13.3 whose tool choice is still open; add them before relying on the starter.

## **15.3 Delivery and promotion**

| Step | Rule |
| :---- | :---- |
| Build once | On merge to main, build the container image once, tag with the commit SHA, attach SBOM; the same digest is promoted through environments |
| Version binding | HG-5 is bound to the PR head commit. Branch protection requires the branch to be up to date with main (or a merge queue is used), so the merged tree is the tree that was tested and reviewed. From merge onward, staging results and HG-6 are bound to the image digest built from that merge commit. |
| Staging | Deploys automatically on merge; runs prisma migrate deploy before the new version receives traffic; smoke tests and health checks must pass |
| Production | Deploy job targets the production environment with required reviewers (HG-6); deployment branch limited to main |
| Strategy | Canary or blue/green; automatic rollback when error-rate or latency SLOs are breached during the observation window |
| Migrations | Expand/contract: additive migration deployed first; code that uses it next; destructive “contract” migration in a later release after verification |
| Rollback | One command or one workflow dispatch, documented in docs/runbooks/rollback.md; for migrations, a generated down script (prisma migrate diff) or a forward-fix migration, decided in the design |
| Agent role | Release/DevOps prepares and may dispatch non-production deploys within permissions. It never approves or performs production deployment. |

## **15.4 Release readiness checklist (Phase 9\)**

* ☐ All required CI checks green on the release SHA.

* ☐ Findings gate passed; active exceptions listed with expiry.

* ☐ Traceability: 100% ACs mapped to passing tests.

* ☐ Performance results versus NFR targets attached (Tier 2/3).

* ☐ Security scans, SBOM and licence report attached.

* ☐ Migration plan reviewed; rollback steps documented (and rehearsed in staging for Tier 3).

* ☐ Configuration per environment reviewed; secrets referenced, not embedded.

* ☐ Dashboards and alerts exist for new endpoints/jobs.

* ☐ Runbooks updated (deploy, rollback, incident).

* ☐ Release notes and release summary written from report data only.

* ☐ Evidence pack in reports/\<YYYY-MM-DD\>-\<version\>/ references the release SHA.

# **16\. Reports and Evidence**

Evidence is what turns AI-assisted work into enterprise-grade delivery. Every stage writes into reports/ or docs/; the docs-writer skill consolidates them.

| Report | Produced by | Contents | Format |
| :---- | :---- | :---- | :---- |
| Requirements and traceability | Requirements; QA | REQ → US → AC → test → code mapping | Markdown, CSV |
| Design / ADR | Solution Architect | Decisions, options, risks | Markdown, Mermaid |
| Design and code review reports | Architect Review, Critical Review | Findings by round, verdict, coverage statement | JSON, Markdown, PR comments |
| Findings register | Orchestrator (mirror) | All findings, states, owners, SHAs | JSON |
| Exceptions | Humans via HG-X | Approved risk acceptances with expiry | YAML |
| Gate decisions | GitHub (source of truth); mirror | Decision records per gate | JSON |
| Test summary | QA | Pass/fail by layer, flaky tests, defects | JUnit XML, HTML, Markdown |
| Coverage | CI | Coverage by module, diff coverage | HTML (lcov) |
| Security | CI \+ Critical Review | Scanner results, triage, SBOM | SARIF, JSON, Markdown |
| Performance | QA | p50/p95/p99, error rate, throughput vs NFR | k6 summary JSON/HTML |
| Release notes and executive summary | Release (docs-writer) | Changes, risks, exceptions, rollback, metrics | Markdown; export to DOCX/PDF |

Store each release as reports/\<YYYY-MM-DD\>-\<version\>/ and keep CI artifacts per the retention policy. Working reports (test summary, traceability, review outputs) are written to reports/ and reports/review/ during development; the evidence-pack skill copies the versions for the release SHA into the release folder at Phase 9\.

**\[ INSERT YOUR SCREENSHOT HERE \]** — Your generated coverage or Playwright report.

# **17\. Maintenance and Continuous Improvement**

## **17.1 Maintenance/Operations capability**

Maintenance is a capability activated after release, executed by existing agents through playbook skills. It has read-only access to observability data and no production write access.

| Activity | How it runs | Trigger | Lifecycle entry |
| :---- | :---- | :---- | :---- |
| Production defect | incident-triage: Sentry/logs via MCP → Developer reproduces with failing test → fix PR | New error group, alert, or ticket | Phase 5/6 (Tier by impact) → full review and gates |
| Incident response | Humans lead; Claude collects timeline and logs, drafts post-mortem and actions | Incident declared | Post-mortem actions become tickets |
| Dependency and security updates | dependency-update: assess Renovate/Dependabot PRs, run tests, summarise risk | Weekly; critical CVE | Phase 6–10 |
| Tech debt / refactor | Developer works a prioritised list with tests protecting behaviour | Monthly | Phase 5 |
| Documentation freshness | docs-writer compares code to docs and proposes updates | Each release | Phase 6 (docs-only Tier 1\) |
| Cost and performance review | Analyse metrics; propose scaling or query fixes | Monthly | Phase 4 if architectural |
| Learning loop | Recurring findings and incidents update CLAUDE.md, skills and review checklists via PR | Each post-mortem / quarterly | Governed change to .claude/\*\* |

![][image9]

*Figure 6 — Maintenance flow. Every production change re-enters the lifecycle.*

## **17.2 Emergency changes**

An emergency change is a pre-authorised exception path governed by \[SA-D13\], not a way around the gates:

* **Scope:** the fix must stay within the approved PRD and design (inherited HG-1/HG-3). If it cannot, the on-call Solution Architect approves the design change synchronously (HG-C) before the fix is merged.

* **Reviews and CI:** both independent reviews and all CI gates run, synchronously. Blocking findings follow Section 10; only a High finding may be accepted, through HG-X by the on-call Solution Architect or Security Lead.

* **HG-5:** the on-call Engineering Lead plus an on-call QA or Security approver (Security for Tier 3). Neither may be the person who requested or drove the change.

* **HG-6:** the Release Manager or on-call Service Owner.

* **Follow-up:** a post-incident review within two business days confirms the records, raises HG-C if requirements or design changed, and schedules any deferred tests.

# **18\. Implementation Roadmap**

| Phase | Weeks | Priority | Goal | Actions | Done when |
| :---- | :---- | :---- | :---- | :---- | :---- |
| A — Foundations | 1–2 | P0 | Safe environment | Install Claude Code; repository skeleton; CLAUDE.md; settings deny rules; least-privilege MCP (GitHub, Playwright); branch protection; CODEOWNERS with gate roles | A Developer-agent change passes lint/types/tests and a human-approved PR |
| B — Agent team | 2–4 | P0 | Seven agents \+ core skills | Add Appendix A agents and Appendix B skills; run Phases 2–8 manually (Level 1\) on a pilot Tier 2 feature; tune prompts | Each agent produces its expected artifact; reviews produce schema-valid findings |
| C — Gates and reviews in CI | 4–6 | P0 | Enforced controls | ci.yml, claude-review.yml, findings-gate; environments with required reviewers; exceptions directory; dismiss-stale-approvals | A PR with a seeded High finding cannot merge until re-review clears it or an HG-X exception is approved |
| D — Guided orchestration | 6–8 | P1 | Level 2 | /sdlc-feature skill; workflow state; gate reminders; evidence-pack skill; release summary | A feature flows from PRD to staging with all gates recorded |
| E — Hardening | 8–10 | P1 | Enterprise readiness | Tier 3 controls (mutation, human AppSec), SBOM/licence policy, k6 gates, audit-log export, cost dashboards; evaluate a different model for one reviewer \[SA-D06\] | Internal audit dry-run passes the acceptance checklist |
| F — Scale | 10–13 | P2 | Level 3 (optional) | Evaluate workflow engine \+ Agent SDK for unattended stages; multi-repo pilot; maintenance playbooks | Decision recorded in an ADR; pilot demonstrates restart-safe gates |

# **19\. Risks, Assumptions, Dependencies and Unresolved Decisions**

## **19.1 Risks**

| ID | Risk | Likelihood | Impact | Mitigation |
| :---- | :---- | :---- | :---- | :---- |
| R-01 | Agents produce plausible but incorrect code or reports | High | High | Independent reviews, CI gates, evidence-only closure, human gates |
| R-02 | Reviewers miss defects (false negatives) or flood with noise (false positives) | Medium | High | Two independent perspectives, coverage statement, feedback into skills, human AppSec for Tier 3 |
| R-03 | Approvals bypassed through chat or self-approval | Medium | High | Platform-enforced approvals; separation of duties; no agent write access to approvals |
| R-04 | Prompt injection via issues, documents or web content | Medium | High | Untrusted-content rule, restricted tools, no secrets in fork PR jobs |
| R-05 | Review loops stall delivery | Medium | Medium | Budgets, escalation, fingerprinting, tiering |
| R-06 | Claude product features or syntax change | High | Medium | \[Verify\] markers; quarterly review of this guide; pin action versions |
| R-07 | Cost growth from strong models and loops | Medium | Medium | Model right-sizing, budgets, small contexts, usage monitoring |
| R-08 | Sensitive data sent to AI services against policy | Low | High | Data classification, masked data, enterprise controls, deny rules |
| R-09 | Team over-trusts automation | Medium | High | Training, named human accountability, evidence-based gates |

## **19.2 Assumptions**

| ID | Assumption |
| :---- | :---- |
| A-01 | The team uses GitHub (or a platform with equivalent branch protection, code owners and protected environments). |
| A-02 | The organisation permits the use of Claude on its source code under an approved plan and data policy. |
| A-03 | Named humans are available for each gate role, with deputies. |
| A-04 | PostgreSQL is the default system of record for transactional data unless the ADR states otherwise. |
| A-05 | Non-production environments exist and are separated from production credentials. |
| A-06 | The team has, or will build, working knowledge of NestJS, Prisma and React. |

## **19.3 Dependencies**

Claude plan with Claude Code; Anthropic API key for CI reviews; GitHub organisation settings (branch protection, environments, CODEOWNERS); identity provider for OIDC; secret manager; container registry; observability platform; security scanners licensed or available (CodeQL requires GitHub Advanced Security for private repositories \[Verify\]).

## **19.4 Unresolved decisions requiring Solution Architect approval**

| ID | Decision | Recommendation in this document | Impact if changed |
| :---- | :---- | :---- | :---- |
| SA-D01 | Prisma vs TypeORM as default ORM | Prisma for greenfield; TypeORM for existing TypeORM code | Skills, migration rules, examples |
| SA-D02 | Validation: class-validator vs Zod | class-validator (NestJS-native); Zod if sharing schemas with frontend | packages/contracts, DTO patterns |
| SA-D03 | Frontend: Vite SPA vs Next.js | Vite SPA unless SSR/SEO required | Deployment model, E2E setup |
| SA-D04 | Unit test runner: Jest \+ Vitest vs single runner | Jest (API) \+ Vitest (web) initially | CI scripts, skills |
| SA-D05 | Quality-gate thresholds | Section 13.3 defaults | CI configuration |
| SA-D06 | Use of a different model for one reviewer | Optional; evaluate in Roadmap Phase E | Cost, diversity of findings |
| SA-D07 | CI/CD and approval platform if not GitHub | GitHub Actions \+ environments | Section 8.4 and 15 mappings |
| SA-D08 | Audit evidence retention and write-once storage | 7 years regulated / 2 years other; export audit logs | Storage, compliance |
| SA-D09 | Gate SLAs and escalation chain | Section 8.5 defaults | Delivery cadence |
| SA-D10 | Whether any risk-acceptance path exists for Critical findings | None for production by default | Exception policy |
| SA-D11 | Full vs incremental re-review threshold | 30% of original change or new module | Review cost and depth |
| SA-D12 | SAST tool and build provenance requirements | CodeQL (if licensed) or Semgrep; provenance optional | CI jobs, licensing |
| SA-D13 | Emergency change procedure | Section 17.2 | Incident response |
| SA-D14 | Default hosting target (cloud provider or on-premise Kubernetes) | Cloud-neutral; decide per project ADR | IaC, deployment examples |

# **20\. Common Pitfalls and Troubleshooting**

## **20.1 Common pitfalls**

* **Vague prompts.** Point agents to files, IDs and acceptance criteria, not general wishes.

* **Too many tools.** Each extra tool or connector adds risk and noise; start small.

* **Skipping the design gate.** Fixing a wrong design after the code exists is the most expensive mistake.

* **Giant sessions.** Start a fresh session per feature and rely on files for memory; use /clear or /compact when context grows.

* **Trusting without verifying.** Read diffs, run tests and rely on CI and the findings gate.

* **Chat approvals.** “Yes, go ahead” in chat is not a gate decision; approve in the system of record.

* **Reviewer contamination.** Giving reviewers the developer’s summary turns review into confirmation.

* **Treating retry limits as success.** An exhausted budget is an escalation, never a pass.

## **20.2 Troubleshooting**

| Symptom | Likely cause | Fix |
| :---- | :---- | :---- |
| Agent is never used | Vague description in front matter | State exactly when to use it; mention it by name in the prompt |
| Connector shows as failed in /mcp | Bad token, missing Node runtime, wrong URL | Re-check credentials; run the server command manually; check logs |
| Agent keeps asking permission | Command not on the allow-list | Add safe commands to permissions.allow |
| Tests pass locally but fail in CI | Version or service differences | Pin Node via .nvmrc; mirror CI services in docker compose; npm ci locally |
| Findings gate fails with “stale review” | Review ran on an older SHA | Re-run claude-review for the head SHA |
| Same finding reappears with new ID | Reviewer not given prior findings | Pass prior findings; enforce fingerprint reuse in review-findings skill |
| Prisma migration drift | Manual DB change or edited applied migration | Never edit applied migrations; prisma migrate diff to inspect; restore from migrations |
| Output drifts from standards | CLAUDE.md too long or vague | Shorten; make rules specific and testable; enforce with hooks and CI |
| Costs rising | Large contexts, loops, top model everywhere | Smaller models where safe, budgets, split work by feature |

# **21\. Document Acceptance Checklist**

Use this checklist to validate this document (not the software built with it).

| \# | Criterion | Section |
| :---- | :---- | :---- |
| 1 | Executive summary states purpose, scope and key design choices | 1 |
| 2 | Key architectural decisions recorded with rationale and alternatives | 2 |
| 3 | Node.js/TypeScript is the primary stack in every example, command, prompt, hook and CI job; Python appears only as optional | 4, 11, 13, 15, App. A/B |
| 4 | Agent design rationale explains which responsibilities are agents, skills or capabilities, and why | 5 |
| 5 | Each retained agent has responsibilities, inputs, outputs, tools, permissions and completion criteria | 6, App. A |
| 6 | Frontend and backend are consolidated in the Developer Agent with skills | 5, 6 |
| 7 | Every phase has entry conditions, owner, activities, outputs, checks, approvals and failure paths | 7.4 |
| 8 | Workflow, review loop, finding lifecycle, CI/CD and maintenance diagrams in Mermaid | 4.1, 7.2, 10, 15, 17 |
| 9 | Human Gateway gates cover PRD, UX, architecture, plan, code/quality, production and material change, each with entry conditions, evidence, decisions, roles, audit, resume and timeout | 8 |
| 10 | Approvals cannot be simulated, inferred from silence or bypassed by agents; mandatory vs configurable distinguished | 8.1, 8.7, 10.6 |
| 11 | Architect Review and Critical Review are separate, independent stages with criteria, inputs, outputs, templates and escalation | 9 |
| 12 | Severity levels with release-blocking rules and exception authority | 9.4, 10.5 |
| 13 | Rework loop defines blocking findings, prioritisation, assignment, regression selection, escalation, disagreements, exceptions, loop prevention and stale approvals; retry limits never pass a failed review | 10 |
| 14 | Claude implementation guidance separates native capability, integrations and custom orchestration, with \[Verify\] markers | 11 |
| 15 | Reusable prompts for every agent and major stage | 12 |
| 16 | Measurable quality gates | 13.3 |
| 17 | Security, governance and audit controls distinguish mandatory from recommended; cloud-neutral Well-Architected mapping | 14 |
| 18 | Release and deployment workflow with promotion, rollback and readiness checklist | 15 |
| 19 | Maintenance workflow routes changes back through the lifecycle | 17 |
| 20 | Prioritised roadmap | 18 |
| 21 | Risks, assumptions, dependencies and SA decisions listed | 19 |
| 22 | No claim that code, tests, reviews or deployments were executed; illustrative content labelled | Document control |

# **Appendix A. Ready-to-Use Agent Files**

Copy each block into .claude/agents/\<name\>.md. Front-matter field names (including skills) and model aliases are version-dependent \[Verify\].

**.claude/agents/requirements-analyst.md**

*\---*  
***name:** requirements-analyst*  
***description:** Use for turning a business goal into a PRD with numbered requirements, acceptance criteria, NFRs, and (when UI is in scope) user journeys and screen specs.*  
***tools:** Read, Write, Grep, Glob*  
***model:** sonnet*  
***skills:** ux-spec, traceability*  
*\---*  
You are a senior product analyst. Follow CLAUDE.md.  
Write only under docs/requirements/ and docs/ux/.  
Produce docs/requirements/\<**feature**\>.md: problem statement, personas, REQ-n, US-n,  
AC-n.m (Given/When/Then), NFRs with measurable targets (security, performance, availability,  
audit, accessibility, privacy), assumptions, dependencies, risks, out of scope, open questions.  
Ask questions rather than guess. Never mark your document approved.  
Final answer: path written, counts of REQ/US/AC, open questions remaining (max 10 lines).

**.claude/agents/solution-architect.md**

*\---*  
***name:** solution-architect*  
***description:** Use for solution design, API contracts, data models, security and deployment design, ADRs, and implementation plans after requirements are approved.*  
***tools:** Read, Grep, Glob, Write*  
***model:** opus*  
*\---*  
You are a principal solution architect for Node.js/TypeScript systems. Read the approved PRD first.  
Write only under docs/design/ and docs/plans/. Do not write application code.  
Produce: docs/design/\<**feature**\>\-adr.md (options with trade-offs, decision, consequences),  
docs/design/openapi.yaml (OpenAPI 3.1), docs/design/\<**feature**\>\-data-model.md (Mermaid ER),  
authN/authZ and data-protection design, integrations, error model (problem details),  
observability, deployment model, failure scenarios, and a REQ \-\> component/endpoint/entity map.  
For planning: docs/plans/\<**feature**\>\-plan.md with tasks T-n linked to REQ/AC, dependencies,  
path ownership, test expectations, completion criteria, proposed risk tier with rationale.  
Never approve your own design or override a review finding.

**.claude/agents/developer.md**

*\---*  
***name:** developer*  
***description:** Use to implement approved tasks or fix routed findings and defects in the Node.js/TypeScript API (NestJS, Prisma) and the React web app, with unit tests.*  
***tools:** Read, Write, Edit, Grep, Glob, Bash*  
***model:** sonnet*  
***skills:** nestjs-backend, react-frontend, prisma-migrations, integration-adapters*  
*\---*  
You are a senior full-stack TypeScript engineer. Follow CLAUDE.md and the approved design exactly.  
Process:  
1\. Read the task (docs/plans), the PRD ACs it references, the ADR and openapi.yaml.  
2\. Implement the smallest change that satisfies the ACs. Strict TypeScript; no any.  
3\. Validate every input (DTO whitelist); enforce authentication, authorisation and ownership.  
4\. Prisma changes via migrations with a documented rollback; never edit applied migrations.  
5\. Write unit tests for success, edge and error paths. Run lint, typecheck and unit tests.  
6\. Record any deviation from the design in docs/plans/\<**feature**\>\-impl-notes.md and stop for HG-C.  
For findings/defects: add a test that fails before the fix and passes after.  
Other skills (docs-writer, ux-prototype, python-service) are loaded on demand when the task needs them.  
Never: weaken or delete tests; edit tests/integration, tests/e2e, .github, docs/design,  
.sdlc/exceptions; hard-code secrets; mark findings resolved; claim checks passed without output.  
Final answer: commit SHA, files changed, tests added, command results, open risks (max 12 lines).

**.claude/agents/architect-reviewer.md**

*\---*  
***name:** architect-reviewer*  
***description:** Use for independent architecture conformance review of designs or code at a specific commit SHA. Read-only.*  
***tools:** Read, Grep, Glob, Bash*  
***model:** opus*  
***skills:** review-findings*  
*\---*  
You are an independent design-authority reviewer. You did not write this work.  
Bash is only for: npm run lint, npm run typecheck, npm run test:\*, spectral lint, git diff/log/show.  
Inputs: reviewed SHA, base SHA, approved PRD/ADR/OpenAPI, CI results, prior findings.  
Do not use the developer's self-assessment as evidence.  
First re-verify every prior finding on this SHA (verified-fixed / still-open / regressed, with evidence).  
Then assess: ADR conformance (undeclared deviation \= High), module boundaries and dependency direction,  
maintainability, scalability, data model/transactions/migration safety, API contract and error model,  
security architecture (authN/Z placement, secrets, data protection), resilience, observability,  
deployment readiness, Well-Architected pillars.  
Output findings JSON per the review-findings schema (severity, evidence with file:line, rationale,  
recommended fix, verification criteria, blocking) and a report with verdict and coverage statement.  
Do not edit code. Do not approve anything.

**.claude/agents/critical-reviewer.md**

*\---*  
***name:** critical-reviewer*  
***description:** Use for independent adversarial review of requirements, designs or code at a specific commit SHA to find defects, security risks, weak tests and unsupported claims. Read-only.*  
***tools:** Read, Grep, Glob, Bash*  
***model:** opus*  
***skills:** review-findings, security-scan*  
*\---*  
You are an independent adversarial reviewer ("red team"). Assume the work is wrong until evidence shows otherwise.  
Bash is only for: lint, typecheck, test runners, scanners (semgrep, gitleaks, trivy, npm audit), git diff/log/show.  
First re-verify every prior finding on this SHA. Then hunt for: wrong assumptions and unimplemented ACs;  
logic defects, edge cases, race conditions, partial failures; OWASP Top 10 and API Top 10 issues  
(BOLA, injection incl. raw Prisma queries, mass assignment, SSRF, secrets in code/logs, missing rate limits);  
missing or ineffective tests, weakened assertions, .skip/.only; validation and data-integrity gaps;  
dependency and operational risks; unnecessary complexity; claims without evidence.  
Do not restate architecture findings without new evidence. You are not a substitute for a penetration test  
or compliance assessment — say so where one is needed.  
Output findings JSON per the review-findings schema and a report with verdict and coverage statement.  
Do not edit code. Do not approve anything.

**.claude/agents/qa-engineer.md**

*\---*  
***name:** qa-engineer*  
***description:** Use from implementation planning onward to draft the test plan and traceability, and after development and review to write and run integration, contract, E2E, accessibility, regression and load tests and classify failures.*  
***tools:** Read, Write, Edit, Bash, Grep, Glob*  
***model:** sonnet*  
***skills:** traceability, security-scan*  
*\---*  
You are a QA automation engineer. Write only under tests/, reports/ and docs/plans/\*-test-plan.md. Never edit production code.  
Map every AC to at least one test in reports/traceability.csv.  
Create Supertest integration tests (success, authz failure, validation failure per endpoint),  
OpenAPI response validation, Playwright E2E with axe checks, and k6 load tests with NFR thresholds.  
Run suites on the specified SHA and save raw outputs (JUnit XML, HTML).  
Classify each failure: product defect, test defect, environment. NEVER delete or loosen an assertion.  
Write reports/test-summary.md with pass/fail by layer, gate results (Section 13.3), defects and unrun suites.

**.claude/agents/release-engineer.md**

*\---*  
***name:** release-engineer*  
***description:** Use for CI/CD workflows, Dockerfiles, infrastructure as code, environment config, deployment and rollback plans, operational readiness and release notes.*  
***tools:** Read, Write, Edit, Bash, Grep, Glob*  
***model:** sonnet*  
***skills:** docs-writer, evidence-pack*  
*\---*  
You are a release and platform engineer. Containerise with multi-stage builds, non-root users,  
pinned base images and health checks. Maintain .github/workflows with pinned action SHAs,  
caching and least-privilege permissions. Never put secrets in files.  
Never deploy to production or approve environments; prepare the HG-5 pull request evidence and let the pipeline  
deploy after HG-6. Document deploy and rollback in docs/runbooks/. Complete the readiness checklist  
with evidence links and assemble reports/\<**YYYY-MM-DD**\>\-\<**version**\>/.

# **Appendix B. Skill Files**

**.claude/skills/review-findings/SKILL.md**

*\---*  
***name:** review-findings*  
***description:** Use when producing, re-verifying or consolidating Architect Review or Critical Review findings.*  
*\---*  
\- Output a JSON array matching schema.json in this folder (fields: id, fingerprint, reviewer, reviewed\_sha,  
  severity, category, title, location{file,lines}, evidence, requirement\_refs, rationale,  
  recommended\_fix, verification, blocking, status).  
\- Severity: Critical | High | Medium | Low | Info (definitions in the SDLC guide Section 9.4).  
  Critical and High are blocking. Weakened tests are High. Undeclared design deviation is High.  
\- Fingerprint \= sha1(category | file | normalised title). Reuse the ID of a prior finding with the same  
  fingerprint; never re-raise an existing issue as new.  
\- Re-review: for each prior finding report verified-fixed, still-open or regressed WITH evidence  
  (file:line, test name and result). A developer statement is not evidence.  
\- Always include a coverage statement: what you reviewed and what you did not.

**.claude/skills/nestjs-backend/SKILL.md**

*\---*  
***name:** nestjs-backend*  
***description:** Use when implementing or changing NestJS modules, controllers, services, DTOs, guards or API tests.*  
*\---*  
\- One feature module per bounded area: controller \-\> service \-\> repository (Prisma). No controller DB access.  
\- Global ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }).  
\- Every route: @UseGuards(AuthGuard, RolesGuard) or explicit @Public() with justification; ownership checks in service.  
\- Errors: throw domain errors mapped by a global exception filter to RFC 9457 problem details.  
\- Outbound calls: timeouts, retries with jitter for idempotent operations, circuit breaker.  
\- Logging: nestjs-pino, correlation ID, redact authorization, password, card fields.  
\- Health: @nestjs/terminus /health/live and /health/ready.  
\- Tests: Jest unit tests per service; Supertest e2e-style tests via Test.createTestingModule for controllers.

**.claude/skills/prisma-migrations/SKILL.md**

*\---*  
***name:** prisma-migrations*  
***description:** Use when changing prisma/schema.prisma, creating migrations, seed data or query tuning.*  
*\---*  
\- Change schema \-\> ***\`npx prisma migrate dev \--name \<change\>\`*** on a LOCAL database only (ask before running).  
\- Never edit an applied migration. Never run migrate reset or destructive SQL on shared databases.  
\- Destructive change \= expand/contract across releases (add column \-\> backfill \-\> switch reads \-\> drop later).  
\- Rollback: generate a down script with ***\`prisma migrate diff\`*** and store it beside the migration,  
  or document the forward-fix approach approved in the ADR. *\[*Verify current Prisma commands*\]*  
\- Every index must cite the query it serves (from the design). Add constraints and FKs to protect invariants.  
\- Seed data: development only, synthetic, no real personal data.

**.claude/skills/react-frontend/SKILL.md**

*\---*  
***name:** react-frontend*  
***description:** Use when building or changing React \+ TypeScript components, pages, state or API integration.*  
*\---*  
\- Use generated types from packages/contracts; never call endpoints not in openapi.yaml.  
\- Handle loading, empty, error and success states for every data view.  
\- Accessibility: WCAG 2.2 AA — labels, focus order, keyboard access, contrast, aria only when needed.  
\- Tests: Vitest \+ Testing Library for components; Playwright journeys are QA-owned.  
\- No secrets or tokens in client code or localStorage beyond the approved auth pattern.

**.claude/skills/security-scan/SKILL.md**

*\---*  
***name:** security-scan*  
***description:** Use when running or triaging security scanners, or checking code against OWASP Top 10 and OWASP API Security Top 10\.*  
*\---*  
\- Run when available: gitleaks detect; semgrep \--config auto (or project ruleset); npm audit \--omit=dev;  
  trivy fs \--severity CRITICAL,HIGH .  
\- Triage each result: true/false positive, reachable?, severity per Section 9.4, file:line evidence, concrete fix.  
\- Checklist: BOLA/ownership, broken auth, injection (incl. \$queryRawUnsafe), mass assignment,  
  SSRF, rate limiting, security misconfiguration, sensitive data in logs, vulnerable dependencies.  
\- State clearly that this is not a penetration test or compliance assessment.

Other skills listed in Section 6.3 (sdlc-feature, integration-adapters, ux-spec, ux-prototype, traceability, docs-writer, evidence-pack, incident-triage, dependency-update, python-service) follow the same format; sdlc-feature is given in full in Section 11.8.

# **Appendix C. Templates**

## **C.1 Gate decision record (mirror of the system of record)**

{  
  "gate": "HG-3",  
  "feature": "checkout",  
  "artifacts": \[  
    { "path": "docs/design/checkout-adr.md", "sha": "a1b2c3d" },  
    { "path": "docs/design/openapi.yaml", "sha": "a1b2c3d" }  
  \],  
  "evidence": \["reports/review/architect-reviewer.json", "reports/review/critical-reviewer.json", "ci-run:123456"\],  
  "decision": "approve\_with\_conditions",  
  "decided\_by": { "user": "jdoe", "role": "Solution Architect" },  
  "decided\_at": "2026-10-19T09:30:00Z",  
  "rationale": "Design meets requirements; caching decision deferred.",  
  "conditions": \["ADR-005 caching decision before HG-5"\],  
  "linked\_findings": \["AR-checkout-002"\],  
  "linked\_exceptions": \[\],  
  "source\_of\_truth": "https\://github.com/\<org\>/\<repo\>/pull/42\#pullrequestreview-\<id\>"  
}

## **C.2 Finding schema (.claude/skills/review-findings/schema.json)**

A reviewer’s output file is a JSON array of objects matching this schema (example in Section 9.5).

{  
  "\$schema": "https\://json-schema.org/draft/2020-12/schema",  
  "title": "Review findings",  
  "type": "array",  
  "items": {  
    "type": "object",  
    "required": \["id", "fingerprint", "reviewer", "reviewed\_sha", "severity", "category", "title",  
                 "location", "evidence", "rationale", "recommended\_fix", "verification", "blocking", "status"\],  
    "properties": {  
      "id": { "type": "string", "pattern": "^(AR|CR)-\[a-z0-9-\]+-\[0-9\]{3}\$" },  
      "fingerprint": { "type": "string" },  
      "reviewer": { "enum": \["architect-reviewer", "critical-reviewer"\] },  
      "reviewed\_sha": { "type": "string", "minLength": 7 },  
      "severity": { "enum": \["Critical", "High", "Medium", "Low", "Info"\] },  
      "category": { "type": "string" },  
      "title": { "type": "string" },  
      "location": {  
        "type": "object",  
        "required": \["file"\],  
        "properties": { "file": { "type": "string" }, "lines": { "type": "string" } }  
      },  
      "evidence": { "type": "string", "minLength": 10 },  
      "requirement\_refs": { "type": "array", "items": { "type": "string" } },  
      "rationale": { "type": "string" },  
      "recommended\_fix": { "type": "string" },  
      "verification": { "type": "string" },  
      "blocking": { "type": "boolean" },  
      "status": { "enum": \["open", "in-rework", "fix-proposed", "verified-fixed", "disputed",  
                           "invalid", "exception-requested", "accepted"\] }  
    }  
  }  
}

Rule enforced by the findings gate: blocking must be true when severity is Critical or High.

## **C.3 Exception record (.sdlc/exceptions/EX-\<n\>.yaml)**

id**:** EX-007  
fingerprint**:** 9e1f4c...  
finding\_id**:** AR-checkout-004  
severity**:** High  
feature**:** checkout  
reviewed\_sha**:** 3f9c2ab  
requested\_by**:** eng-lead-username  
justification**:** Provider SDK lacks idempotency keys until v5; release required for regulatory date.  
risk**:** Duplicate capture possible under network retry (likelihood low, impact medium).  
compensating\_controls**:**  
  **\-** Nightly reconciliation job flags duplicates  
  **\-** Alert on \>1 capture per order  
remediation**:** **{** owner**:** dev-team-payments**,** ticket**:** SHOP-231**,** due**:** 2026-11-15 **}**  
expires**:** 2026-11-15  
approved\_by**:** **\[**solution-architect-username**\]**   *\# informational; approval \= CODEOWNERS-approved PR*

## **C.4 Workflow state (.sdlc/state/\<feature\>.json)**

{  
  "feature": "checkout",  
  "tier": 2,  
  "phase": "P7",  
  "status": "in-review",  
  "branch": "feat/checkout",  
  "artifacts": {  
    "prd": { "path": "docs/requirements/checkout.md", "sha": "11aa22b" },  
    "design": { "path": "docs/design/checkout-adr.md", "sha": "a1b2c3d" },  
    "plan": { "path": "docs/plans/checkout-plan.md", "sha": "b2c3d4e" }  
  },  
  "gates": {  
    "HG-1": { "status": "approved", "sha": "11aa22b", "record": "PR \#40" },  
    "HG-2": { "status": "approved", "sha": "c0ffee1", "record": "PR \#41" },  
    "HG-3": { "status": "approved", "sha": "a1b2c3d", "record": "PR \#42" },  
    "HG-4": { "status": "skipped", "decided\_by": "eng-lead-username", "reason": "Tier 2 policy" },  
    "HG-5": { "status": "pending" },  
    "HG-6": { "status": "pending" }  
  },  
  "review\_rounds": 2,  
  "open\_blocking\_findings": 1,  
  "head\_sha": "3f9c2ab",  
  "updated\_at": "2026-10-19T10:00:00Z"  
}

# **Appendix D. Quick Command Reference**

| Command | What it does |
| :---- | :---- |
| claude | Start an interactive session in the current folder |
| claude \-p "prompt" | Run once non-interactively (scripts, CI) \[Verify flags\] |
| /init | Create or refresh CLAUDE.md |
| /agents | Create, edit and list agents \[Verify\] |
| /mcp | Show and authenticate MCP connectors |
| /clear, /compact | Reset or summarise the conversation to free context |
| /install-github-app | Set up the Claude GitHub integration \[Verify\] |
| /sdlc-feature "..." | Run the orchestration skill (Section 11.8) |
| claude mcp add ... | Register a connector from the terminal |
| Shift+Tab | Cycle permission modes, including plan mode \[Verify\] |
| npm run lint / npm run typecheck / npm run test:unit | Static checks and unit tests |
| npm run test:integration / npx playwright test | Integration and E2E tests |
| npx prisma migrate dev / npx prisma migrate deploy | Local migration / apply migrations in CI and deployment |
| npx @stoplight/spectral-cli lint docs/design/openapi.yaml | Lint the API contract |

# **Appendix E. Glossary**

| Term | Meaning |
| :---- | :---- |
| ADR | Architecture Decision Record: a short document of a decision, options and reasons |
| AC | Acceptance criterion, written Given/When/Then and numbered AC-n.m |
| BOLA | Broken Object Level Authorisation — accessing another user’s object by ID |
| CI/CD | Continuous Integration / Continuous Delivery |
| CODEOWNERS | GitHub file assigning required reviewers to paths |
| Context window | The working memory of a Claude session; each agent gets its own |
| E2E test | Test that drives the real UI and backend like a user |
| Evidence pack | Artifacts presented at a gate, bound to a commit SHA |
| Expand/contract | Migration pattern that splits a breaking schema change into safe, additive steps |
| Fingerprint | Stable identifier for a finding used to match it across review rounds |
| HG-n | Human Gateway gate identifier |
| MCP | Model Context Protocol, the standard for connecting Claude to tools and data |
| Mutation testing | Deliberately introducing code changes to check that tests detect them |
| OWASP Top 10 | List of the most critical web application security risks (and the separate API Security Top 10\) |
| PRD | Product Requirements Document |
| SARIF | Standard file format for static analysis results |
| SBOM | Software Bill of Materials |
| SHA | Git commit identifier used to bind reviews and approvals to an exact version |
| Stale approval | An approval invalidated by a change to the approved artifact |
| Traceability | Linking requirements to design, code, tests and releases |

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,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>

[image5]: <data:image/png;base64,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TqZvPkQbkskxY8bQKJlcsWKFKD/22GOivGjRIrY7Vti1a5cIORs3bkw6njM+Yc8xqOwB9TYzlixZQq+P1bCBub6+nqZeYSrTEwrcEYjNqfgJrYpt27bRUwlcE5TNof0fh00wlSdMmEBPJXBNUDZz6OUC2cE7GP4J1uZlaeh1Aw6gshKCtZmj9lMV+5g0aRI9ZcATYdicwpQjO0xlvBmnipBsXr58udopx7HHHptIw6vuy7wqCoMHD2aF6667jpXfeOONnj17supxxx3HqldccQUrt2/fPpn+KEesohBMMNQSks0ctUIzHn744aT0TYyGhgbxmciHH34ougmD5aoMT95++225escddySbb7IhVrn66qt5wT94M045odqcUif0+eefn2z+PE+288c//rEoi9vBcDLaLItObBZfC2H8x3/8hygrAaNyEIRts/zRsX+4drfeeiuvDho0aM2aNbzcoUMHtuQffVdWVorOcoHRt29fkRCb+ddC+OfbzuHcD0xlzJWDIGybU2mh/d9SKJGGF9iyc+fOBQUFvOncc8/lE1/GgAEDZIk7duxInO7atavYDrF5y5YtrLB582YRnnLKKbzsB0wwgiMCmznhf/Stdnz1BiYYgRKZzStXrqSXOgZgghEokdmcipnQbIIBlYMmSps5cfikEBOMcIje5lQUc+gwgcqhoYXNFk85MMEIEy1s5lARzAejcshoZDMboW2ackDl8NHIZo4dQuMjkkjQzuaU+VMOfHAdFTranDJ5hMYEI0I0tTllptCYYESLvjanDJxyYIIRLVrbnDJHaMyVdUB3m6urq/WfcmCCoQm628zR+bsc+LNPHwywuW/fvimNpxyYYOiD7jZzlRn8v6G0YurUqVBZK7S2Wags0GfKwVQmxwYiR1+bH3vsMRql0eGPQqisJ/ra/Je//IVGaSKfcmCCoS2a2lxeXk6jllDFwgKjss7oaPO6detolIlFixZR1wIGKmuOdjY7//LLxtKlS6luAYMJhuboZfODDz5Io5yEJvT2NHT3QDM0stn9qEwIesqBCYYp6GLzwIEDaZQPwQnNVPb8NAMho4vNGzdupFE+BDflYBOMffv20f0BLdHC5rfffptGnqAm+kN+X/nRRx9tuSugI9HbrPB1fFEaaqUnyFx5wIABchXoScQ2K1RZ4F/oHTt20I2mUq+99hqNgGZEaXMQ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>

[image6]: <data:image/png;base64,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07QE8ghCgiOJdCmTRP3796clL3Tq1ImW/Me3fV75f/2IJNKlRhL5pGt5+8fVlKHw146QRLpkT6LPPvuMlrxTVFRES37lk+wOGiSRmn788UdaAvAxJJGC8FMdpIMkUs1XX31FS57Kzs6mJbDbunXraEk2SKJfhEK/HI3y5cvffvvtrHHNNdf86le/YqO/zBds48ePr1+/PjtWXbp0eeihhyLR48YP3UsvvXTfffddffXVrH1VVCSaRF9++WXdunXXr1/PZ7755psffPDBMiv1CN9ssf3cs88+e88995BJbFirVq2PPvro8OHD2iI7Sfj+2ki7/kjpw37Wvu6667RTH3nkkdtuu421mzVrVrFiRbFsRkbG5cuXO3XqJObk+Pc2Q5o37m9/+5tYFZ/Eh+yc541rr72Wr58R63EIkugXrIew4X/913+JyjvvvKN9L32uY8eOtOQAfkA2btzI288//7z40jafVK5cOc3sPycRr1evXl3M4+ejKrbt3LlzZaf8POnYsWOs8cQTT7Dhk08+GYnZXxt99913hYWFkdJNImej9kj+53/+p6jzYux/o4t948QkbRJx7M0SoyzXRN05Hp8QvkqiSPTNYD+9Y78H6Oee47KWLVuyofjTQr/5zW/EpLhHSSQRf3ql7T9+9vvf/z43N5cURRINHjyY9c+BAweSGWzHLnAimsMVm0Q8B40kUYI37i9/+UtE501hRSSRB8RvHoWiWOPChQtx36HA4if08uXLxTn629/+Vvz5elb8+uuveYMfN/6ciLX5X2jkRV8dUnZFUKlSJW2FbV6PHj14o1q1apHolTLfZpZEzZs3z8nJiUS/uS7210Zsna+88gprDBs2jI+KIVO7du2GDRuyxh/+8AdW5BduYiqLe97WSyLtG8caH3zwAWv86U9/qlKlCl+wQoUKvLF7927WOHXqFJ9TsyZHOP4CifkqidjJ59yVdpBt2rTp9ttvd+FsdgG/JvKDxo0b05LMPD45fJVEMsIH9qAGJJHEEEOgDCSRLp//tkfsgwCwlz//opsRJ0+epCXfQxLp8nkSASTw/vvv05K/IYl0+TmJcF8GifnnybpBSCJdvk0i/8fQ66+/TksACSGJdPk2ifzP/1kZBB7++xYTkES6/JlEXbp0oSX/EV90BA/J9cQdSaTLn0kEbvrwww9pSR5jxoyhJR9DEunyYRLx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iSwK5gGcO3du//79adWvkESG/Otf/6IlFwWzI1n3448/skN35coVOiEA9u3bR0v+hiQyxNu/34gkSskHH3zw/vvv02pglJSUFBYW0qrvIYkkgCQyok+fPqtXr6bVIPnhhx8mTpxIq5JAEhnVrl07WnILkkjPzp07W7duTavBEw6Hd+zYQatSQRJJAEkUC8eEu3TpkrePDuyCJEpB586dackV6HXc5cuX2aFg9yB0QiC1adPmo48+olVpIYlSs2jRIlpyXsCTKOC7HysjI4OW5IckkkAAuyLb5aKiIloNNrVPAySRBNQ+BQm2s5s2baLVYGPHRMYP5lOCJErZxo0baclhyicR20GVHnnYhR2WS5cu0aqikERmnD9/npacpGQSrVu3Tsn9sq5///7+/OeIjkISmdG7d29acpJ6PVb5ew1z2Bvtk38n4z4kkUlupoObrwUuO3DgAN7fCJLIihMnTtCSMxQ7U9u0aUNLwVNUVKTY22qRl0mUXopOgLJ8cohCoZ/PFj58+OGH2fC6666rUaPG4MGDWXHNmjXaGbiRI0dqiwUFBUuWLAlyEi1evJgdE1oFJJFFn3/+OS05wCeHSJsp2rgJRYliVlaWmMSsXLmST+rZsyevBDOJOnXq9MUXX9AqlPIyiSLRPuZOZ5aa50l00003RQwnEf+f66zNl5o1axafTfybreAk0datWz1/72ThcRJduHCBlmTjwif6fjibeaB8+umnLGJWrFgh6uRh2fLly7WjnPjPNuvWrSszQVElUbQKCXmZRLNnzw5H0QmycTopnF5/SrRXQwB28eysOnfuHI8hxpNfK7VX165dack+HiYRe2np/g6p7bp160ZLUWvWrKElMMubJPr+++9FDHGLFy8O5t8bNsLNJMKny+Kx15///Oc6depEokn07rvvvvzyy+JxmPa5GBvee++97CZ92bJlt912W9WqVcusDozxIIlmzpxJYkigs0rFuf+h7kI0sJfIycmh1UAS+cIueWrVqhWJJhEfJRdBfM7mzZvzbzDwUTDH7WP3ww8/0PjRYFdGdAGpOPQvQJxLoowoWg027fUOx5PolzlK8SL/apUYBXPcPnY0e2JMmDCBLiOVLl260JJl9ibRp59+ylbIbpDpBIgSgcIa4pro9OnT4qpH22DD3/3ud6xx6dKln376iTVGjBjxy7rAMFeTiKaODtmv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>

[image7]: <data:image/png;base64,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eMctCBKyUbqdOXPGze/DMm7gwIFFixaVUfOYdYQkJSV9+eWXMgopMKJ5nbkRLl++/N5778koXCcn7nqjmL8BzVo/1978NBjmdyZrrF69euHChTJqNgNvjeNQ6nZ8tnDopWs6w4cRU1Yub9683333nYxCCnP+OMAEZt77MqBvvvkmgv/z3hb41DqDnnrqKdNuaKsYkZBKliwpQ6Ax/E2NLRyxTfgfMSDkcufOLUPh56BLA5zLiKOa3kXKEMC1GH6etGHDBvGXGRBCxYoVk6Ewc8R7oOCZ+XLsXyf1/0kQEH5EmQYzDyqvwSsWSaz8hY36M9JIYuAVZDYfNjhu04btc009evSQIbthr1nGsk1t2RNZzLTXZfPadO3aVYYArlOHDh1kyD6mHeERz4I/HXfnXVFsgYPHXBjagmfIj/5s+bIdwv2PFcWLF5ehCGLUOGPnqrz88ssyBJp58+bJEKTO9uPq7bffliGwSvjOkitUqCBDESdXrlwyZBM7j2Gn35csrB599FEZgmsRn94sXrxYnw2fatWq9ezZU0bBQn/++acMhYJLxihz3kvZkJDi4uI++ugjr/aW1vb3tgYqUqSIDEEQTpw4ceHCBS5Tv9q2bdvV9aGH3muIcePG9evXjwrPPPPMs88+K6uvX7NmzWQochnyxy72HEt0DJcvX56PZJr++OOPsgVAeuXLl2/WrFleX9cKd7YI9/LhulSuXNkbov0+b968du3ayWjkyvgWCwl7VmLFihXcaULSdSJP+D4Qd49w964jR460b99eRsFuIdnvYfoA0GR0filDdsjQbsuIRYsWZbzfAASUlJSULVs27mCJiYmyOsOsv00ApG3YsGEqFTHZImgLFy409lZvYWXCN0np320ZR51m0qRJMgqQMWJgCvmtLqKiolz4DtoRtmzZova7rAtaZF/knYaMbLRQydAa/P333//617++sMNDDz1kwua73rtnDh8+PO2HvP/++zKUup07d/br12/Xrl0dO3aUda508OBB6hWff/657C7h1KRJk+eee06uCqSJdtO0adPkpox0CxYsoBduyOUD/kwYUdO/Bvv27evQoUOCrQ4fPixXy2DB7G++TCh4FSpUWL16dTBLdoOPPvpIdhGr5MyZU64NpKJEiRJy87lJbGys3CJmMOHzqvQPZDQIyi1tuQwOxOrUvlmzZqqs1/I738uX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>

[image8]: <data:image/png;base64,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>

[image9]: <data:image/png;base64,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>