# Connect CentraMind

One server for every client: `https://api.eternium.ai/mcp`. Sign in with your
CentraMind account, choose a workspace, and your tool receives its tools. The
default permissions are `core` (read and write inside the chosen workspace) and
`peers` (your own agent's mailbox for agent-to-agent notes). Any member may
grant both; other permissions appear only when a client requests them.

## Claude Code

Marketplace install (plugin with skills):

```sh
claude plugin marketplace add EterniumAI/centramind-plugins
claude plugin install centramind@centramind
```

Then open `/mcp` (or run `claude mcp login centramind`) and sign in.

Standalone server, no plugin:

```sh
claude mcp add --transport http centramind https://api.eternium.ai/mcp
claude mcp login centramind
```

## Codex

Marketplace install (plugin with skills):

```sh
codex plugin marketplace add EterniumAI/centramind-plugins
codex plugin add centramind@centramind
```

Then sign in with the client's MCP sign-in action (or `codex mcp login centramind`).

Standalone server, no plugin:

```sh
codex mcp add centramind --url https://api.eternium.ai/mcp
codex mcp login centramind
```

## Claude (claude.ai, Claude Desktop, mobile)

Settings > Connectors > Add custom connector > paste
`https://api.eternium.ai/mcp` > sign in. Hosted Claude apps share one connector
list, so adding it once covers web, desktop and mobile.

## ChatGPT

Settings > Connectors > Advanced > turn on Developer mode > Create a connector
named CentraMind with `https://api.eternium.ai/mcp` (OAuth) > sign in. Enable the
connector in a chat before asking for CentraMind work.

## Meta Muse

Settings > Connectors > Add custom connector > paste
`https://api.eternium.ai/mcp` > sign in. Muse connects from Meta's cloud; the
server is public, nothing runs on your device.

## ZIP packages (offline or pinned installs)

The same plugins ship as ZIPs with this guide inside:
`centramind-claude.zip` (a Claude Code marketplace: unzip, then
`claude plugin marketplace add /path/to/extracted` and
`claude plugin install centramind@centramind`) and `centramind-codex.zip` (a
portable Codex plugin: unzip into `plugins/centramind` inside a new marketplace
directory whose `.agents/plugins/marketplace.json` lists it as a local source,
then `codex plugin marketplace add /path/to/that/directory` and
`codex plugin add centramind@<marketplace name>`). Installed or enabled does not
mean signed in: run the sign-in action afterwards. Do not add a second server
when the plugin already provides one.

## Verify

Ask the client to run `whoami`. It reports your identity, the workspace, the
project scope and the granted permissions. A successful `whoami` is the
connection check.

## Agent-to-agent mail (Dot)

Two agents talk only inside the same workspace and the same project. Each
registers its own Dot with `dev_peer_register`, finds the other with
`dev_peer_list`, sends with `dev_peer_send`, reads and acknowledges its own
mailbox with `dev_peer_inbox`, and checks a sent message with `dev_peer_receipt`.
Mail is pull-only: an agent sees new mail when it checks its inbox. Signing in
does not automatically enroll a Dot; registration is an explicit step your agent
asks you to approve.

## Troubleshooting

- "Connected, tools fetch failed" (Claude Code, Codex): the client could not read
  the tool catalog. Update the client and reconnect.
- "Needs authentication": run the sign-in action for the server.
- Permission refused: the tool exists but your grant lacks its permission. Sign
  in again and review the consent screen; never add permissions to an old grant.
- 503: CentraMind is briefly unavailable. Retry with the same credential; do not
  reconnect.
- A legacy bearer header can supersede OAuth; remove it through the client's
  supported controls before signing in. Never paste tokens into chat or the
  CentraMind web page.

Remove or revoke authorization in CentraMind Settings > Connections when you no
longer need it. Reconnecting requires consent in your client.
