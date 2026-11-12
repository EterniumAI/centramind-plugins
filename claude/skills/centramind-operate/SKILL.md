---
name: centramind-operate
description: Operate authorized development work through CentraMind's shared MCP board, project knowledge, durable memory, handoffs, and agent lifecycle. Use when the user explicitly mentions CentraMind or asks Claude Code to orient, resume, coordinate, claim, checkpoint, delegate, or record knowledge for work in a repository connected to a CentraMind workspace. Do not trigger for unrelated repositories or ordinary questions that do not need shared CentraMind state.
---

# Operate with CentraMind

Read [references/agent-contract.md](references/agent-contract.md) before meaningful work. Treat it as the shared contract; repository instructions are adapters and may add local rules but may not weaken it.

## Orient

1. Identify the current repository, branch, project, instance, and user request.
2. Read the nearest `CLAUDE.md` or `AGENTS.md` and the relevant project context.
3. Call `whoami` first: it reports your workspace, project scope and granted permissions. With the `dev` permission, call `dev_session_start` and read the inbox, active handoffs, relevant project knowledge, and the dev board. With a `core`-only connection, use `get_overview`, `list_tasks`, `recall` and `submit_request`; do not claim board writes you cannot make. Before starting work on a `core`-only connection, search `list_tasks` for the existing task and create one with `create_task` only if none exists; check its assignee, and if you cannot record that you are working it, tell the user rather than presenting the work as tracked.
4. Inspect `git status`, current branch, upstream comparison, and recent history before concluding work is missing.
5. For UI work, inspect the live surface before reasoning only from source.

If CentraMind tools are unavailable, or a tool you need is not in your tool list, report that boundary once (name the missing permission). You may continue read-only local investigation, but do not start building tracked work, and never present it as tracked. Never claim a board, memory, or session write happened when it did not.

## Work from the board

Before you start any work, including investigating, editing, or launching another agent:

1. Find the existing task. Call `dev_session_start`, then search with `dev_task_list` (and `dev_board_read` when it is available). Create a task with `dev_task_create` only when none exists. Never file a duplicate.
2. Check who owns it. Look at the claim holder, the assigned session, and any linked branch, pull request, or session.
3. Claim it with `dev_task_claim`. If another session holds it, coordinate with that session through `dev_peer_send` and the `task_id`. Never work around or take over another session's claim.
4. Before you build, record your status. Use `dev_task_update` to post a progress note, and add the branch and pull request as soon as each one exists.
5. Keep the task current until the work is done. Post progress and blockers with `dev_task_update`, use `dev_task_checkpoint` if you stop early, and finish with `dev_task_complete`, including commits, pull requests, and how you verified the work.
6. If a claim or status tool is refused or missing, tell the user what is blocked and stop. Do not work around it, and do not present untracked work as tracked.

Why: the board is how everyone working in this workspace, people and agents alike, knows what is happening. Work that is not on it gets duplicated or lost.

- Write a task that stands alone for a cold session: context, acceptance criteria, repository, and branch when known.
- Make changes only inside the repository and systems the user placed in scope.
- Checkpoint unfinished claimed work with concrete progress, branch, reason, and next step. Do not abandon a claim silently.
- Never auto-close, delete, or silently reprioritize ambiguous work.

## Preserve useful knowledge

- Use project development knowledge for repo-specific architecture, commands, traps, and verified behavior.
- Use durable memory for cross-project decisions, corrections, preferences, and stable facts.
- Keep both concise, use stable identifiers, search for an existing entry first, and redact secrets.
- Store summaries and references, never raw transcripts, prompts, diffs, or terminal output.

## Verify before reporting

For code, data, money, deployment, or user-visible behavior, verify the relevant end-to-end path. Report completion with a compact evidence trail such as a test, commit, deployment, observed result, or an explicit statement of what remains unverified.

Do not run the close protocol at the end of an ordinary turn. Use `/centramind-close` only when the user deliberately ends the development session.
