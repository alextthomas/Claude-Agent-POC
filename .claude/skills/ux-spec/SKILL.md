---
name: ux-spec
description: Use when writing user journeys and screen specifications for a feature with UI in scope (Phase 3).
---

- Input: the approved PRD `docs/requirements/<feature>.md`. Output:
  `docs/ux/<feature>.md`.
- One journey per user story (US-n): entry point, steps, exit, error branches.
- One section per screen: purpose, data shown (field -> source in the PRD),
  actions, and every state: loading, empty, error, success (and partial /
  permission-denied where relevant).
- Validation messages: exact text per field and rule, linked to the AC that
  requires it.
- Accessibility notes per screen (WCAG 2.2 AA): labels, focus order, keyboard
  path, error announcement, contrast concerns.
- End with a coverage table: US -> journey -> screens -> ACs. 100% of UI-facing
  stories must be covered; list any AC not reachable from a screen as a gap.
- Do not invent business rules or make design decisions; list them as open
  questions.
