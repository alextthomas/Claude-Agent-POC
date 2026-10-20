---
name: integration-adapters
description: Use when implementing outbound HTTP clients, third-party integrations, webhooks or queue consumers.
---

- One adapter per external system behind an interface owned by the calling
  module; services never call SDKs or HTTP directly.
- Every outbound call has an explicit timeout. Retry only idempotent
  operations, with exponential backoff and jitter and a bounded attempt count.
- Wrap each dependency in a circuit breaker; define the behaviour when it is
  open (fail fast with a problem-details error, or degrade as the ADR says).
- Non-idempotent calls (e.g. payments) send an idempotency key and persist it
  before the call so a retry cannot duplicate the effect.
- Queue consumers are idempotent (dedupe by message ID), acknowledge after
  commit, and route poison messages to a dead-letter queue after N attempts.
- Webhooks: verify signatures, reject replays (timestamp + nonce), respond fast
  and process asynchronously.
- Credentials come from env/secret manager; never log request bodies that
  contain PII, tokens or card data.
- Tests: unit tests with the adapter mocked at the interface; adapter tests
  against a stub server covering timeout, retry, breaker-open and error mapping.
