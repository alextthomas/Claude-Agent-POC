---
name: react-frontend
description: Use when building or changing React + TypeScript components, pages, state or API integration.
---

- Use generated types from `packages/contracts`; never call endpoints not in
  `openapi.yaml`.
- Handle loading, empty, error and success states for every data view.
- Accessibility: WCAG 2.2 AA — labels, focus order, keyboard access, contrast,
  aria only when needed.
- Tests: Vitest + Testing Library for components; Playwright journeys are
  QA-owned.
- No secrets or tokens in client code or localStorage beyond the approved auth
  pattern.
