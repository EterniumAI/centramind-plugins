---
name: centramind-setup
description: Connect this coding agent to CentraMind in one pass. Adds the CentraMind MCP server (https://api.eternium.ai/mcp), walks the user through sign-in, verifies the connection, installs skills from the CentraMind skill library and the workspace's own skills as local SKILL.md files, and runs a cheap smoke test billed to the workspace's credits. Use when the user asks to set up, install, connect, reconnect, or repair CentraMind, or hands you this file. Safe to run again; finished steps are skipped.
---

# Set up CentraMind

You are connecting this agent to the user's CentraMind workspace. When you finish, the agent has every CentraMind tool, the CentraMind skill library (every category, every agent type's skills), the workspace's own skills, and the workspace's models and workflows, all billed to the workspace's credits.

This is the long form of the CentraMind Product agent's `centramind-connect-coding-agent` skill. The two describe the same procedure; keep them in step.

Work through the steps in order. Every step checks before it acts, so a re-run (after a restart, or a week later) skips what is already done. Tell the user in one short line what each step found or did. Do not narrate commands.

## Ground rules

- **Never print a credential.** Do not run `claude mcp get`, `codex mcp get`, `cat` a client config file, print environment variables, or echo any header. Those can contain tokens. Use only the status commands below, and filter their output as shown. If a token ever appears in output anyway, do not repeat it: tell the user a credential was exposed in the terminal and that they can revoke it in CentraMind Settings > Connections.
- Never ask the user to paste a token, code, or callback URL into the chat. Sign-in happens in their browser.
- Never remove or replace an existing CentraMind connection without the user's yes.
- Nothing in this setup spends money except the one test image in step 6, and only after the user approves its exact price.

## 1. Detect the harness

Decide which agent you are running in:

- **Claude Code**: the environment variable `CLAUDECODE` is `1` (check with `test "$CLAUDECODE" = 1 && echo claude-code`), or the `claude` CLI is on `PATH` and you are Claude.
- **Codex**: you are Codex and the `codex` CLI is on `PATH`.

If you cannot tell, ask the user once which agent this is. Use that harness's commands everywhere below.

If this file was handed to you rather than installed, offer to save an exact copy so the user can re-run setup with one command after a restart: `~/.claude/skills/centramind-setup/SKILL.md` for Claude Code, `~/.agents/skills/centramind-setup/SKILL.md` for Codex. Name the path and ask first; save only on a yes. Skip the question when an identical file is already there.

## 2. Add the CentraMind server

Check first. Print only the name, URL, and status of CentraMind entries, never the rest of the line (some client versions append configuration after the URL):

- Claude Code: `claude mcp list 2>/dev/null | grep -i centramind | sed -nE 's#^(.+): (https?://[^ ]+).* - ([^-]+)$#\1 \2 \3#p'`
- Codex: `grep -A6 '^\[mcp_servers\.centramind\]' ~/.codex/config.toml 2>/dev/null | grep -E '^[[:space:]]*url[[:space:]]*='` (prints only the `url` line; Codex shows sign-in state through its tools, checked in step 3)

Then:

- **A line shows `https://api.eternium.ai/mcp`** (including a plugin entry such as `plugin:centramind:centramind`): the server is already added. Do not add a second one. Go to step 3.
- **A `centramind` entry points somewhere else**: tell the user what URL it points to and ask before changing it. With a yes, remove it (`claude mcp remove centramind -s user`, or `codex mcp remove centramind`) and add the new one.
- **No entry**: add it.
  - Claude Code: `claude mcp add --transport http --scope user centramind https://api.eternium.ai/mcp`
  - Codex: `codex mcp add centramind --url https://api.eternium.ai/mcp`

`--scope user` makes it available in every project. If the user wants it in this project only, drop that flag.

**An existing static credential.** An older CentraMind connection may carry a fixed `Authorization` header, which takes priority over sign-in. Count, without printing, whether one is configured:

- Claude Code: `claude mcp get centramind 2>/dev/null | grep -ci 'authorization'`
- Codex: `grep -A6 '^\[mcp_servers\.centramind\]' ~/.codex/config.toml 2>/dev/null | grep -ciE 'http_headers|bearer_token|authorization'`

Only the count is printed. If it is above zero and that connection already works (step 4 succeeds), leave it alone. If it fails, tell the user the connection uses a fixed credential and ask whether to replace it with sign-in. With a yes, remove the server and add it again with the command above.

## 3. Sign in

Skip this step when it is already signed in: in Claude Code the status from step 2 shows `✔ Connected`; in Codex, CentraMind tools such as `whoami` are already in your tool list.

Tell the user, before anything opens:

> A browser window will open to sign in to CentraMind. Pick the workspace whose credits this agent should use. On the consent screen, keep **core** checked and also check **peers** (your agent's mailbox), then approve.

Then start sign-in:

- Claude Code: `claude mcp login centramind` (opens the browser and waits for the sign-in to finish). If that command does not exist in the user's Claude Code version, or it fails, have the user type `/mcp`, choose `centramind`, then Authenticate. On a remote or headless machine, ask the user to run `claude mcp login centramind --no-browser` in their own terminal: it prints the sign-in URL and prompts for the redirect URL there, never in this chat.
- Codex: `codex mcp login centramind`. If Codex says the server does not support OAuth, update Codex first.

Wait for the command to finish. Do not read, copy, or display anything it stores.

**Restart if the tools are missing.** A server added during a session often only loads in a new one. If no CentraMind tools (such as `whoami`) are in your tool list after sign-in, tell the user:

> CentraMind is connected. Restart this agent so it loads the new tools, then run `/centramind-setup` (Codex: `$centramind-setup`) again. Setup picks up where it left off.

Stop here until they do.

## 4. Verify

Call `whoami`. Report back in one line: who the user is, the workspace, the project scope (or "all projects"), and the granted permissions. A successful `whoami` is the connection check.

- `peers` is missing: say the mailbox permission was not granted. Agent-to-agent mail will not work until they sign in again and check `peers`. Continue; nothing below needs it.
- The call is refused for permission: the grant lacks it. Sign in again (step 3) and review the consent screen. Never try to add permissions to an existing grant.

### Troubleshooting (as the CentraMind server documents it)

- **"Connected, tools fetch failed"**: the client reached CentraMind but could not read the tool catalog. This is almost always an outdated client. Ask the user to update (Claude Code: `claude update`; Codex: update through the way it was installed), restart, and run setup again. Do not remove and re-add the server.
- **"Needs authentication"**: run step 3.
- **503**: CentraMind is briefly unavailable. Wait a moment and retry with the same connection. Do not reconnect.
- **No CentraMind tools at all**: re-check step 2, then restart the agent.
- Report each of these separately and plainly. A successful initialize or ping alone does not prove tool access; only a working `whoami` does.

## 5. Install skills

CentraMind is a categorized skill library. Hosted agents launch with their category's skills; a connected coding agent can install any of them, plus the skills this workspace wrote for itself. If `list_skills` or `export_skill_bundle` is not in your tool list, say "This workspace's server does not serve skills yet" and skip to step 6.

1. Call `list_agents` and show the roster as one short list: each agent's name and what it does.
2. Call `list_skills` with `scope: "library"`. Show the `categories` it returns, and the agent types (from each skill's `native_for`), as one compact list with counts where you have them.
3. Ask once what to install. Offer: **everything**, one or more **categories**, or one or more **agent types** (for example "the video editor's skills"). Recommend everything for a first run. On a re-run, default to what is already installed.
4. Ask once where skills should live. Recommend **every project** (the home directory). The alternative is **this project only** (the current repository root).
5. Export each pick with `export_skill_bundle` and `scope: "library"`: no filter for everything, `category` for a category, `agent_type` for an agent type. Results come 100 skills per page: while the answer has a `next_offset`, call again with `offset` set to it. Then call `export_skill_bundle` once more with `scope: "workspace"` (no `agent`) for the workspace's own skills. Workspace files win over a library file with the same path.
6. Each result holds `files`, each with a `path`, a `harness`, and `content`. Keep only files for this harness: `claude_code` for Claude Code, `codex` for Codex.
7. Check each path before writing it. Accept only `.claude/skills/<slug>/SKILL.md` or `.agents/skills/<slug>/SKILL.md`, where `<slug>` is lowercase letters, digits, hyphens, and underscores and does not start with `centramind-` (those names belong to the CentraMind plugin and to this setup). Skip anything else and mention how many you skipped.
8. Resolve and guard each path before touching it:
   - The base is the chosen directory (home or project root). Resolve the base itself with `realpath` (it already exists), then build each target as `<resolved base>/.claude/skills/<slug>/SKILL.md` (Codex: `.agents/skills`). Because `<slug>` passed the check above, the target cannot leave the skills directory. Do not resolve a parent that does not exist yet; create missing directories only after the checks below pass.
   - Refuse, on purpose, any path component that is a symlink: the skills directory itself (`.claude/skills` or `.agents/skills`), a skill directory, or a `SKILL.md` (`test -L`). A symlink there could point the write anywhere, so setup never follows one; tell the user which path was skipped and why.
   - Setup keeps a record of what it wrote: `<base>/.claude/skills/.centramind-installed.json` (Claude Code) or `<base>/.agents/skills/.centramind-installed.json` (Codex), mapping each slug to the SHA-256 of the content it wrote (`shasum -a 256`). Create it on the first run. **After every write (a new file, an applied update, or a backup-and-replace), record the new file's hash** so the next run recognizes it as setup-written and unedited.
   Then, for each file:
   - **New**: write it, then record its hash.
   - **Identical content**: skip it.
   - **Different content, and the file's current hash matches the record** (setup wrote it and nobody edited it since): this is a library update. Collect it.
   - **Different content, and the file is not in the record or its hash does not match** (the user's own skill, or one they edited): do not overwrite. Collect it separately.
   After the pass, list each collected path by name in one message: "Updates available: <paths>. Your own or edited skills that differ: <paths>." Ask once whether to apply the updates. For the second list, offer to back each file up first (`SKILL.md.bak-<date>` next to it) and then replace it; the default is to leave those files alone. A re-run of setup is how changed skills get refreshed.
9. Write files with your file-writing tool, not with shell `echo` or heredocs, so the content is written exactly.
10. Report how many skills were installed, updated, and already current, by category, and where.

Skills also appear as MCP prompts while the server is connected (in Claude Code, as slash commands named after the server). The files keep them available to the agent's own skill loader.

## 6. Smoke test

The goal is one real result for the smallest possible spend. If `estimate`, `generate`, or `get_balance` is not in your tool list, this connection does not carry generation yet: say so in one line and skip to step 7.

1. Call `get_balance`. If the workspace has no credits, skip generation. Tell the user how to add credits (the answer includes a billing link) and go to step 7.
2. Call `list_models` with `type: "image"`. Choose the lowest-priced image model; prefer a featured one when prices tie.
3. Call `estimate` with that `model` and `params` for one square image. Read the exact USD price from the answer.
4. Ask the user, with the real number:

   > Make one test image for $X from your workspace credits? (yes / no)

   Wait for an answer. A no, or anything other than a clear yes, skips generation.
5. On yes, call `generate` with the same `model`, a short prompt (for example "a single paper boat on a calm lake at sunrise, soft light"), the same `params`, and `max_usd` set to the quoted price, so it can never cost more than you said.
6. If the answer has a `task_id`, call `get_run` with it every few seconds until it finishes, for at most about two minutes. Then show the image link. If it is still running, give the user the task id and say it will finish on its own.
7. **Video editor demo (when available).** If `video_open_url` is in your tool list, create a small demo draft with `video_create_draft`, then call `video_open_url` for it and show the link so the user can open the editor. Do not call `video_render`; rendering spends credits and is not part of setup. If those tools are not in your list, skip this quietly with one line: "Video editor tools are not on this connection yet."

## 7. Wrap up

Give the user a short summary:

- Connected as who, in which workspace, with which permissions.
- How many skills were installed (library and workspace), from which categories, and where.
- What the smoke test produced and what it cost (or that it was skipped, and why).
- Three things to try next, drawn from the installed skills or the roster (for example, "ask the video editor agent to cut your latest clip").
- For how to take on work, follow `centramind-operate`: find the existing task, check who owns it, and claim it or coordinate with the holder before working.

Then stop. Do not start other CentraMind work unless the user asks. Re-run `/centramind-setup` (Codex: `$centramind-setup`) any time to refresh skills or repair the connection.
