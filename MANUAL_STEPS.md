# Manual steps — Inventory Tracking v2

These steps generally **cannot be done programmatically** by the build agent — they need the maker portal, admin center, or another UI. Do them in the browser; everything else the agent automates.

> You are using the **GitHub Copilot harness** (single-agent, interactive). Steps marked *(Standard harness can automate)* would be automated by the full harness but are manual here.

> **Agents:** the agent's identity, instructions, and model are built **as code** and published by the kit. The agent steps below are the one-time UI/consent last mile — see **`AGENT_BUILD.md`** for the full build + finish walkthrough (Dataverse MCP tool, test prompts, publish, embed).

## 1. Enable Power Apps code apps on the target environment

- **Why manual:** Admin-gated feature with no public API. The first `pac code push` returns 403 until it is on (and it takes a few minutes to propagate).
- **Where:** Power Platform admin center (admin.powerplatform.microsoft.com) → Environments → <env> → Settings → Product → Features
- **Steps:**
  1. Open the target environment's Settings → Product → Features.
  1. Turn ON 'Power Apps code apps'.
  1. Save, then wait a few minutes for it to propagate before pushing.

## 2. Ensure Power Apps Premium licensing for end users

- **Why manual:** Licensing is assigned in the admin center, not by code. Code apps on Dataverse require Power Apps Premium for the people who run them.
- **Where:** Microsoft 365 admin center → Users → Licenses (or Billing → Licenses; or environment/security-group rules)
- **Steps:**
  1. Confirm each user who will run the app has Power Apps Premium (per-user or per-app).
  1. Assign licenses (or an environment/group rule) as needed.

## 3. Create and consent to connector connections

- **Why manual:** OAuth consent is interactive. A solution can carry connection references, but the actual connection + user/admin consent must be created in the UI.
- **Where:** make.powerapps.com → Connections → New connection (some connectors also prompt on first app play)
- **Steps:**
  1. Create a connection for each connector the app/flows use (e.g., Office 365 Outlook, Dataverse, Teams).
  1. Complete the OAuth consent prompt.
  1. Map each connection reference in the solution to its connection.

## 4. Confirm the code app is a component of the solution _(Standard harness can automate)_

- **Why manual:** `pac code push --solutionName` does not reliably register the app as a solution component (there is no canvasapps record until it is known to a solution).
- **Where:** make.powerapps.com → Solutions → <solution> → Add existing → App
- **Steps:**
  1. Run `scripts/add-app-to-solution.ps1` first (it adds it via AddSolutionComponent).
  1. If it is still missing, in the portal open the solution → Add existing → App → select the code app.
  1. Re-run `scripts/audit-solution.ps1` to confirm the app appears (component type 300).

## 5. Allow Microsoft Teams to frame the app (Content Security Policy)

- **Why manual:** The App CSP frame-ancestors defaults to 'self' https://*.powerapps.com and there is no CLI to edit it. Without this the Teams tab renders blank.
- **Where:** PPAC → Environments → <env> → Settings → Product → Privacy + Security → Content security policy → App tab
- **Steps:**
  1. Add https://teams.microsoft.com and https://*.teams.microsoft.com to frame-ancestors.
  1. Save. (SSO inside the tab uses the app's own Entra sign-in; add webApplicationInfo later for silent SSO.)

## 6. Add the Dataverse MCP tool to the agent (one-time consent)

- **Why manual:** Grounding the agent on live Dataverse data rides on a Power Platform connector, so the connection needs interactive OAuth consent. The agent's identity + instructions are built as code; only this connection is manual. The Dataverse MCP server is on by default for the Copilot Studio client, so it's ~2 clicks + one sign-in.
- **Where:** copilotstudio.microsoft.com → <agent> → Tools → + Add tool → Model Context Protocol → Dataverse MCP Server
- **Steps:**
  1. Open the agent in Copilot Studio and go to the Tools section.
  1. Select + Add tool → Model Context Protocol → Dataverse MCP Server.
  1. If prompted, create/authorize the Dataverse connection (one-time sign-in consent).
  1. Select Add to agent. (Optional: … → Edit next to the tool to scope which tables/tools are exposed.)
  1. Test in the agent's chat pane, e.g. 'describe the <table>' / 'what needs attention right now?'.
  1. See AGENT_BUILD.md for the full walkthrough + grounded test prompts.

## 7. Publish the Copilot Studio agent and enable its channels _(Standard harness can automate)_

- **Why manual:** Publishing and enabling channels (Teams, Microsoft 365 Copilot) is a Copilot Studio UI flow. In the GitHub Copilot harness there is no background publish; drive it interactively.
- **Where:** copilotstudio.microsoft.com → <agent> → Publish; then Channels / Settings
- **Steps:**
  1. Open the agent in Copilot Studio and click Publish. (If built as code, the kit already published it — re-publish after any change.)
  1. Enable the channel(s) you need — Microsoft Teams and/or Microsoft 365 Copilot.
  1. To embed the agent in the code app, enable a Custom website channel, copy its embed URL, set the app's VITE_AGENT_EMBED_URL build variable, and redeploy (see AGENT_BUILD.md).
  1. Submit for admin approval if prompted.

## 8. Register an Entra app for server-side Graph (if the agent/flows call Graph app-only)

- **Why manual:** App registration, admin consent, and client secrets are Entra/Azure UI actions. Secrets must be created in the UI and kept server-side (in a flow or Key Vault), never in the client app.
- **Where:** entra.microsoft.com (or portal.azure.com) → App registrations
- **Steps:**
  1. New registration → note the Application (client) ID and Directory (tenant) ID.
  1. API permissions → add the required Microsoft Graph Application permissions → Grant admin consent.
  1. Certificates & secrets → new client secret → store it server-side (flow/Key Vault).

## 9. Share the app and assign Dataverse security roles

- **Why manual:** Sharing the app and assigning security roles that grant table access is a maker/admin UI action.
- **Where:** make.powerapps.com → Apps → Share; Dataverse security roles
- **Steps:**
  1. Share the app with the users/groups who will run it.
  1. Assign the security role that grants access to the app's Dataverse tables.

## 10. Submit to the Solution Hub / Solution City

- **Why manual:** The catalog submission is a web form (no API in this kit).
- **Where:** The Solution Hub / Solution City submission form
- **Steps:**
  1. Open the submission form and use 'Fetch & Fill' from the published GitHub repo if available.
  1. Paste the fields from `solution-hub.json` / `SOLUTION_HUB.md` (title, industry, content types, technical areas, contributors, narrative).

---

The agent records any additional non-automatable step it encounters in `solution-model.json` under `manualSteps`; regenerate this guide with `npm run reimagine -- manual-guide --workspace <workspace>`.
