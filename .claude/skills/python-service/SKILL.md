---
name: python-service
description: Use when changing an isolated Python service under services/ (optional; data science, ML or existing Python workloads).
---

- Python is only for isolated services (e.g. `services/ml-scoring/`) recorded
  in an ADR; never for the standard application path.
- The service sits behind its own OpenAPI contract in `docs/design/`; Node.js
  callers use it through an integration adapter.
- Own CI job: ruff (lint + format), mypy --strict, pytest with coverage. Same
  gate levels as the Node.js code (Section 13.3).
- Dependencies pinned in a lockfile (uv/poetry/pip-tools); no unpinned installs.
- Config and secrets from env; structured JSON logs with correlation IDs; health
  endpoint.
- Container: multi-stage, non-root, pinned base image by digest.
