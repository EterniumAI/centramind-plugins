---
name: centramind-close
description: Deliberately close a CentraMind-enabled Claude Code or Codex development session. Use only when the user says close, wrap up, logging off, done for now, end this thread, or otherwise explicitly ends the session. Checkpoint unfinished work, board concrete follow-ups, preserve durable lessons, and emit a safe idempotent closeout without auto-closing ambiguous tasks.
---

# Close a CentraMind session

Read [references/session-close.md](references/session-close.md) before acting. This is an explicit session boundary; never run it merely because a turn is ending.

## Guardrails

- Capture and propose only. Never delete, auto-close, or silently reprioritize ambiguous board work.
- Search for matching tasks before creating one. Use stable idempotency keys for retryable writes.
- Use evidence for shipped claims. A changed file without verification is not `SHIPPED`.
- Store bounded summaries and references only. Never send raw transcripts, prompts, diffs, terminal output, credentials, or secrets to CentraMind.

## Permissions

The dev tools (`dev_task_checkpoint`, `save_dev_knowledge`, `dev_session_close`) exist only on connections with the `dev` permission (owners/admins who requested it). On a `core`/`peers` connection: record lessons with `remember`, board follow-ups with `submit_request`, skip the session close call, and report `CLOSEOUT STATUS: PARTIAL (no dev permission)`. Never write a pending manifest for a permission you were not granted.

## Workflow

1. Identify the current instance, repo, project, branch, task, and any pending closeout manifests.
2. Read the CentraMind board, especially tasks held by this instance.
3. Inspect `git status`, recent commits, tests, deployment state, and live evidence relevant to shipped claims.
4. Classify every deliverable as `SHIPPED`, `IN_PROGRESS`, `BLOCKED`, `FOLLOW_UP`, `PARKED`, or `OUT_OF_SCOPE`.
5. For unfinished claimed tasks, call `dev_task_checkpoint` with truthful progress, branch, reason, and next step. Release the claim unless this exact session will resume immediately.
6. Search before boarding each concrete follow-up. Create only tasks with sufficient context, acceptance criteria, repo, branch when known, and a stable idempotency key.
7. Save repo-specific lessons with `save_dev_knowledge` and cross-project decisions or corrections with `remember`.
8. Record bottlenecks and proposed improvements without changing priorities automatically.
9. Call `dev_session_close` last with the bounded report and all task/lesson references.

If a CentraMind write fails, pass a redacted JSON payload to `scripts/record-pending-closeout.mjs`. Report the manifest path and `CLOSEOUT STATUS: PARTIAL`.

## Final response

Return only the useful handoff:

```text
SHIPPED: ...
BOARDED: ...
BLOCKED: ...
IMPROVEMENTS: ...
CLOSEOUT STATUS: COMPLETE | PARTIAL
```
