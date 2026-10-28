# EverDwell advisor — Cloudflare Workers AI

The main website uses a same-origin Pages Function at `/api/advisor`. Configured requests call Cloudflare Workers AI; unavailable AI returns clearly labelled catalogue guidance. No OpenAI API key or paid-provider fallback is used. Existing authentication, feedback, mail and admin code is unchanged.

## Production configuration

In the existing Pages project's production settings, preserve all existing variables and bindings and add:

- Workers AI binding: `AI`.
- Secret: `ADVISOR_RATE_SALT`, at least 32 random characters (a hashing salt, not a provider credential).
- Text variable: `AI_FREE_TIER_CONFIRMED=true`, only after verifying Workers Free.
- Keep the existing D1 binding `FEEDBACK_DB`.

Settings take effect on the next deployment through GitHub main → Cloudflare Pages. GET `/api/advisor` reports readiness; only a POST result with `mode: "ai"` confirms inference. Each UI answer identifies its actual source.

The fixed model is `@cf/meta/llama-3.1-8b-instruct-fp8`. Workers Free includes 10,000 Neurons/day, reset at 00:00 UTC, and rejects further calls after that allowance. Never upgrade or enable paid fallback without new user authorization. If the account plan changes, disable `AI_FREE_TIER_CONFIRMED` and review protection first: the flag records verification and does not query the plan per request. Workers Free was confirmed in the account dashboard on 2026-10-18.

Official sources: [model](https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct-fp8/), [pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/#workers-ai), [errors](https://developers.cloudflare.com/workers-ai/platform/errors/).

## Privacy and usage

Chat stays in page memory; reload or Clear discards it. AI receives the question, at most two recent user messages (previous AI answers are excluded), known selected materials, coarse assessment categories and bounded catalogue references. Account email, authentication tokens and individual questionnaire answers are not collected for this request. Common email/credential patterns in typed messages are redacted; this is not a general personal-data detector, so the UI asks users not to include personal details. The endpoint does not log or store conversations.

Prompts are capped at 12,000 UTF-8 bytes, history messages at 400 characters, questions at 1,500 characters and output at 192 tokens. Instructions request EN/FR grounded qualitative comparisons, no prices, numeric sustainability ratings or rankings, and no claimed browsing, image analysis or inspection. A narrow output check rejects obvious price/rating violations; it does not guarantee factual correctness.

Isolated D1 tables `advisor_cf_usage` and `advisor_cf_state` store only salted visitor hashes, request IDs, timestamps and cooldown time. Existing feedback tables are untouched. Atomic reservations cap AI calls at 6/minute and 30/rolling 24 hours per visitor, and 100/UTC day across the site. These abuse caps are not estimates of Neuron consumption. Rows older than two days are removed on subsequent AI requests.

Daily quota error 3036 triggers cooldown until UTC midnight; temporary capacity/rate failures trigger 30 seconds. Missing trusted client IP/storage, invalid output, errors and timeouts return catalogue guidance. The next eligible question tries AI again. There are no automatic inference retries. Network retries reuse a request ID. The 20-second response timeout cannot cancel a provider invocation already in flight; its reservation remains consumed.

## Files and checks

- `agent-bridge.js`: UI, context, transport and answer provenance.
- `functions/api/advisor.js`: request validation and readiness.
- `functions/_advisor/workers-ai.mjs`: bounded prompts, AI binding, limits and fallback.
- `functions/_advisor/core.mjs`: catalogue guidance.
- `functions/_advisor/recognition.mjs`: aliases and intent recognition for 62 materials in 13 systems; bounded keyword matching.

Run `node --test work/advisor.test.mjs work/recognition.test.mjs work/workers-ai.test.mjs` and `node work/export-advisor-catalog.cjs --check`. All 25 tests passed on 2026-10-19, covering 3,782 ordered material pairs, EN/FR follow-up prompts, binding prerequisites, successful mocked inference, storage failure, duplicate IDs, limits, cooldown/recovery, timeout and fallback. Provider tests use mocks; production requires separate live verification.

Local catalogue preview: `node work/advisor-preview.mjs` on port 4173. `work/test-advisor.cjs` checks that preview's UI. Advisor verification must not submit real feedback or send emails.

The user authorized this publishing assistant to configure free AI, upload to GitHub and verify the live website. Save releases with normal commits; preserve previous versions and avoid force pushes.

## Short answers and source grounding — 2026-10-19

Default answers target 65–90 words in one paragraph of 4–7 short sentences, with a 100-word validation limit and 192-token generation cap. Catalogue fallback is also shortened. Output-token capacity is half of the original; total Neuron use is not reduced by that exact ratio because inputs also count.

Website material records remain the main evidence. Relevant window questions can additionally use one reviewed US Department of Energy excerpt from `functions/_advisor/supplements.mjs`, with a separate external-source link. This is a curated reference, not live web search. No search API or paid service is added.

Each factual sentence is instructed to cite a supplied reference ID. Missing or unknown source IDs cause catalogue fallback. Source names and external URLs are constructed by the server, not generated by the model. Unsupported questions can return a brief insufficient-evidence answer. Valid IDs do not prove that every claim follows from its source: this is a grounding safeguard, not a guarantee against hallucinations. Source snapshots must be reviewed when changed or extended.

## Conversation repair — 2026-10-27

Previously, two old user questions were concatenated before the current question for retrieval, and sent as competing user turns. A reproduced windows → low-VOC paint query still returned mostly window facts. `conversation.mjs` now resolves explicit new subjects from the current question alone; only anaphoric follow-ups inherit canonical material/category names from recent user questions. Old questions and assistant claims are not sent to the model. Retrieval is restricted to the resolved subjects, and the single model user message clearly identifies the current question. Catalogue fallback uses the same follow-up subjects. Unknown new questions do not inherit stale subjects.

32 tests pass, including 156 cross-category switches, same-category changes, multi-step EN/FR/Chinese follow-ups, comparisons with a previous material, unrelated topics, source isolation, fallback, existing quotas and failure recovery. Run `node --test work/advisor.test.mjs work/recognition.test.mjs work/workers-ai.test.mjs work/conversation.test.mjs`.
