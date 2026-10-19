# EverDwell advisor — Cloudflare port

Adapted from the teacher-provided `EverDwell_AI_Agent_Streamlit_GitHub_Repo` on 2026-10-18. The chat layout, English/French copy, page-context collection, material retrieval, assessment guidance and builder suggestions originate from that version. Streamlit transport and Python execution have been replaced with a same-origin Cloudflare Pages Function. Existing authentication, feedback, mail and admin files are unchanged.

## Current release

The user selected **catalogue guidance mode**. No API key is required. The UI explicitly labels this mode; answers are deterministic catalogue guidance, not free-form AI. Full questions should name the materials. It covers 62 options in 13 systems and four detailed insulation references, using the current site's data. Questions do not trigger external AI calls in this mode. There is no image processing or web search.

The chat stays in page memory and is lost on reload. Clear cancels pending UI requests and discards late responses. Requests contain the question, limited recent conversation, selected materials and summarized assessment scores, but not authentication tokens, email or individual questionnaire answers. Neither chat nor assessment is saved by the endpoint. Standard hosting request metadata is separate from chat storage.

## Files and checks

- `functions/_advisor/recognition.mjs` recognizes canonical material names, curated English/French/Chinese aliases, categories, intents and focus keywords before catalogue routing. Longest overlapping names win; material order is preserved while a sorted `answerKey` makes reversed comparisons equivalent for the future authored answer library. This is bounded keyword matching, not unrestricted language understanding or typo correction.
- Questions such as “窗户有什么差异” route to the windows category; “rock wool vs fiberglass” resolves the two canonical materials. An incomplete comparison asks for the other material. The current UI still answers in its English/French language setting.
- Material summaries no longer display price or numeric sustainability ratings. The existing description text and builder/assessment answer branches have not yet been rewritten into the requested original long-form answer library. Focus and pros/cons labels are ready for that library; they do not yet produce bespoke answers for each focus.
- Recognition regression checks: `node --test work/advisor.test.mjs work/recognition.test.mjs`, including all 62 single materials, 3,782 ordered pairs, six orders of a sample triple, French names and Chinese aliases.

- `agent-ui.css`, `agent-bridge.js`, advisor markup in `index.html`: UI and same-origin transport.
- `functions/api/advisor.js`: mode metadata and validated question endpoint.
- `functions/_advisor/`: canonical catalogue, bilingual reference guidance and optional AI adapter.
- After material edits, run `node work/export-advisor-catalog.cjs`; validate with `--check`.
- Run `node --test work/advisor.test.mjs` for offline functional, request validation and mocked AI/quota tests.
- Local preview: `node work/advisor-preview.mjs` (port 4173, no real feedback/mail/admin API).
- Windows shortcut: double-click `preview-local.cmd`, keep that window open, and visit `http://127.0.0.1:4173/`. Directly opening `index.html` cannot run the question endpoint. If a preview is already running, use its URL rather than starting another copy.
- UI checks: `node work/test-advisor.cjs` with preview running. `PLAYWRIGHT_MODULE` may specify the installed Playwright module path.

## Optional future live AI

Server-only `OPENAI_API_KEY` enables the existing Responses API adapter; optional `OPENAI_MODEL` defaults to the teacher's `gpt-4.1-mini`. Never put keys in source or browser code. No key is supplied by this release. See [OpenAI text generation documentation](https://developers.openai.com/api/docs/guides/text).

Paid calls require the existing `FEEDBACK_DB` binding and Cloudflare's connecting-IP header. An isolated `advisor_usage` table is created only when paid mode is enabled; it stores request IDs, salted visitor hashes and timestamps, never conversations or raw IP. Atomic reservations cap usage at 6 calls/minute and 30/day per visitor, and 300/day globally. Repeated request IDs are not charged twice. Entries older than two days are removed on subsequent paid requests. Limits are approximate abuse/cost protection, not a currency spending limit. Missing quota storage, provider errors or exhausted limits return clearly labeled catalogue fallback. No schema or data belonging to feedback/admin is modified.

Deploy through the existing GitHub main → Cloudflare Pages workflow. `_routes.json` already covers `/api/*`; no new deployment platform or dependency installation is required for the website.

The user clarified on 2026-10-18 that this chat handles design, code changes and checks only. This release is saved locally; this chat does not push to GitHub or deploy it. The publisher should verify the deployed `/api/advisor` GET returns JSON with `aiAvailable:false`, then ask an English/French material question in the site UI. A local build does not confirm production deployment.

Local validation on 2026-10-18: 8 automated backend tests passed; desktop/mobile EN/FR browser checks passed, including comparison, builder context, retries, clear while pending, keyboard closure and existing feedback/login UI. Wrangler 4.45.0 compiled the full Pages Functions worker successfully. No live AI, feedback submission or email sending was performed. The repository's original feedback/admin code is unchanged.
