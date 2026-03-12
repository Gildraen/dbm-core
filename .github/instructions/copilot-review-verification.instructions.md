---
applyTo: "**"
description: "Verification protocol for Copilot review suggestions"
---

# Copilot Review Verification Protocol

When acting on Copilot review comments, always verify claims against the current repository state before editing.

## Mandatory Verification Steps

- Check the actual local implementation first (source files in this repo).
- Validate type claims against current type definitions and interfaces.
- For dependency/API claims, verify installed package typings from `node_modules` for the current version.
- Confirm exports/import claims against `src/index.ts`, `package.json` exports/bin/scripts, and real file paths.
- Treat review comments as hypotheses, not facts.

## Decision Rules

- If Copilot is correct: implement the smallest safe fix.
- If Copilot is partially correct: implement only the valid part and avoid introducing regressions.
- If Copilot is incorrect: do not apply the suggestion; document why in the response.

## Validation After Changes

- Run `yarn lint:check` and `yarn build` after applying review-driven changes.
- If behavior changed, add or update focused tests when appropriate.

## Communication Requirements

- In responses, state what was verified and where.
- Explicitly note when a claim is version-dependent and what version/source was checked.
