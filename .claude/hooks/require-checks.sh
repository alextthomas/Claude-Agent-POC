#!/usr/bin/env bash
# .claude/hooks/require-checks.sh - blocks "done" while checks fail.
# Exit 2 returns the failure text to Claude so it keeps working.
input=$(cat)

# Avoid an infinite loop if Claude is already continuing because of this hook.
if [ "$(echo "$input" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).stop_hook_active===true))')" = "true" ]; then
  exit 0
fi

# Nothing to check until the workspace is scaffolded.
if [ ! -f package.json ]; then
  exit 0
fi

if ! { npm run -s typecheck && npm run -s test:unit -- --silent; } > /tmp/claude-checks.out 2>&1; then
  tail -n 40 /tmp/claude-checks.out >&2
  exit 2
fi

exit 0
