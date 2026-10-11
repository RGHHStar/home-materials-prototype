# Feedback frontend

The homepage feedback introduction follows Learning and precedes the footer. It contains text and a button only, linking to the dedicated `#feedback` page. That page contains the form, English/French copy, the existing authentication dialog, and the verified-user state already maintained by auth.js. Its appearance is identical for signed-in and signed-out visitors. Opening the page does not itself require login; interacting with its form does. Browser back/forward and direct links are supported.

## Current limits

- This is a frontend preview only. No feedback API, database table, admin page or public feedback list has been created.
- Submitting valid text explicitly states that nothing was sent or saved. There is no success state or network request.
- Draft text exists only in the current page's memory. It survives a language switch but not a reload, and is cleared on sign-out.
- Feedback-specific login explains the requirement. Successful login returns to the originating field; Google redirects preserve the feedback context in sessionStorage. Normal header login remains unchanged.
- UI gating is not a security boundary. The future backend must enforce login and owner-only access independently.

## Future backend contract (not implemented)

Accept category (`suggestion`, `issue`, `correction`, `other`), section (`general`, `assessment`, `materials`, `design`, `learning`), message (10–2,000 characters), locale and an idempotency key. Authenticate the request, derive the user ID server-side, validate all fields, enforce rate limits and protect against duplicate writes. Do not trust a browser-supplied user ID, email or administrator flag. Keep credentials on the server. Only the owner should be authorized to read feedback. Remove the preview notice and display success only after a confirmed database write.

## Checks

Run `node work/test-feedback.cjs` with the local server on port 4173. Tests mock the login provider and perform no live email, OAuth or database operations. They check context-specific login, keyboard access, focus return, identical signed-in/out appearance, validation, draft preservation, sign-out clearing, EN/FR and feedback layout on mobile.

Existing French homepage intro text can overflow horizontally at 390px; this predates the feedback section and is intentionally outside this change. The feedback section itself fits the viewport.
