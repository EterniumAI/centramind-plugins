# CentraMind Session Close Protocol v1

## Required sequence

1. Identify the instance, repo, branch, project, and current task.
2. Read the current board, especially tasks held by this instance.
3. Inspect `git status`, recent commits, relevant tests, and deployment or live evidence when the work claims to be shipped.
4. Classify every deliverable as `SHIPPED`, `IN_PROGRESS`, `BLOCKED`, `FOLLOW_UP`, `PARKED`, or `OUT_OF_SCOPE`.
5. Checkpoint unfinished claimed tasks with a truthful progress note, branch, reason, and next step. Release the claim unless the same session immediately resumes it.
6. Search for matching open tasks. Create a new task only for a concrete actionable follow-up with acceptance criteria and a stable idempotency key.
7. Save project lessons with `save_dev_knowledge`. Save cross-project lessons with `remember`. Reuse stable paths or slugs.
8. Record bottlenecks and proposed improvements. Repeated friction becomes a proposed board task, not an automatic reprioritization.
9. Call `dev_session_close` last with the bounded report and all task/lesson references.

## Closeout event

```json
{
  "instance": "stable-session-name",
  "idempotency_key": "close-<session>-<date>-<counter>",
  "outcome": "complete | checkpointed | blocked | partial",
  "summary": "what shipped and what remains",
  "boarded_task_ids": [],
  "lesson_refs": [],
  "bottlenecks": [],
  "improvements": [],
  "pending_writes": []
}
```

The event is bounded and idempotent. It does not create, complete, delete, or reprioritize board tasks.

## Failure recovery

If any CentraMind write fails, create a redacted JSON manifest under `~/.config/centramind/closeouts/pending/` with the bundled script. Include the closeout ID, timestamp, instance, repo/branch, intended task operations, lesson references, and intended event payload. Never include credentials, raw transcripts, prompts, diffs, or terminal output.
