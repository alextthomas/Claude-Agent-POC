---
name: nestjs-backend
description: Use when implementing or changing NestJS modules, controllers, services, DTOs, guards or API tests.
---

- One feature module per bounded area: controller -> service -> repository
  (Prisma). No controller DB access.
- Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`.
- Every route: `@UseGuards(AuthGuard, RolesGuard)` or explicit `@Public()` with
  justification; ownership checks in the service.
- Errors: throw domain errors mapped by a global exception filter to RFC 9457
  problem details.
- Outbound calls: timeouts, retries with jitter for idempotent operations,
  circuit breaker.
- Logging: nestjs-pino, correlation ID, redact authorization, password, card
  fields.
- Health: @nestjs/terminus `/health/live` and `/health/ready`.
- Tests: Jest unit tests per service; Supertest e2e-style tests via
  `Test.createTestingModule` for controllers.
