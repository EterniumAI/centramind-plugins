---
name: centramind-artifact
description: Create, publish, or update externally shareable CentraMind artifacts with client-branded content, a canonical URL in CentraMind's artifact namespace (artifacts.eternium.ai), and verified recipient access. Use for interactive briefs, intake forms, prototypes, reports, and hosted deliverables intended for people outside the current task.
---

# Publish a CentraMind artifact

Keep the artifact's visual identity and copy aligned with the active CentraMind client or product brand. URL branding is separate: the public handoff must use CentraMind's artifact namespace (artifacts.eternium.ai) even when a provider hosts the origin.

## Confirm identity and audience

Before publishing:

1. Resolve the active CentraMind project and its canonical business or product name. Do not derive the hostname from an agent name, recipient name, or provider name.
2. Select an explicit audience from `private`, `named-recipients`, or `public-by-link`. A clear audience choice already present in the user's request counts as authorization; otherwise ask before changing access. Never silently make an artifact public.
3. Preserve the requested content brand. A CentraMind artifact URL does not authorize changing the artifact's design, name, or copy.

## Create the canonical hostname

Run `node scripts/canonical-hostname.mjs --business "<business>" --artifact "<artifact>"` from this skill directory. The result uses:

`<business>-<artifact>.artifacts.eternium.ai`

The helper normalizes the label to lowercase ASCII kebab case and enforces the DNS 63-character label limit. Reuse an existing artifact/site project instead of duplicating it to obtain a different URL.

If the proposed hostname is already assigned to a different artifact, rerun with `--collision --stable-id "<stable artifact identity>"`. Use a durable CentraMind artifact object ID when available; otherwise use the provider project ID. The helper appends the first eight hexadecimal characters of the SHA-256 digest of that identity, so every agent chooses the same collision suffix. It also applies this suffix when truncation is required. Never use a random suffix.

## Publish and verify

1. Keep provider URLs, including `*.chatgpt.site`, as internal origins only.
2. Configure the Eternium hostname and its origin mapping, DNS validation records, and TLS certificate.
3. Apply only the selected audience. For `named-recipients`, verify those recipients have access. For `public-by-link`, verify the artifact does not expose secrets or private member data.
4. Wait until DNS and SSL are active. Do not call publication complete while either is pending.
5. Open the canonical CentraMind artifact URL in a signed-out browser session. Confirm it reaches the expected artifact and does not show a provider login unless authentication was explicitly requested.

The final handoff must contain the canonical `https://…artifacts.eternium.ai` URL (CentraMind's artifact namespace). Never include or substitute a `chatgpt.site` URL in the final response. If verification is incomplete, report the exact pending layer and keep the provider origin private.
