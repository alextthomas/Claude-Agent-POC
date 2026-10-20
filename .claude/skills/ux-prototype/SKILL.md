---
name: ux-prototype
description: Use when building a throwaway clickable prototype from an approved UX spec (Phase 3).
---

- Input: `docs/ux/<feature>.md`. Output: `prototypes/<feature>/` (Vite + React +
  TypeScript) or a Figma link when the team uses Figma.
- Mocked data only. No backend calls, no auth, no secrets, no imports from
  `apps/**` or `packages/**`.
- Implement every screen and state in the spec (loading, empty, error,
  success) with a way to switch between them.
- Prototypes are never shipped: nothing in `apps/**` may import from
  `prototypes/**`.
- Final answer: how to run it, a screen -> spec section map, and any spec gaps
  or contradictions found.
