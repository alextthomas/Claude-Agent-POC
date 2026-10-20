---
name: prisma-migrations
description: Use when changing prisma/schema.prisma, creating migrations, seed data or query tuning.
---

- Change schema -> `npx prisma migrate dev --name <change>` on a LOCAL database
  only (ask before running).
- Never edit an applied migration. Never run `migrate reset` or destructive SQL
  on shared databases.
- Destructive change = expand/contract across releases (add column -> backfill
  -> switch reads -> drop later).
- Rollback: generate a down script with `prisma migrate diff` and store it
  beside the migration, or document the forward-fix approach approved in the ADR.
- Every index must cite the query it serves (from the design). Add constraints
  and FKs to protect invariants.
- Seed data: development only, synthetic, no real personal data.
