# Admin deployment

Full administrators: frankguan20110115@gmail.com, qix220@g.harvard.edu, and everdwellsupport@gmail.com. Each is bound to its verified Supabase user ID. Mailbox administrator access does not configure outgoing mail.

The production administrator entry point is `/admin/`. Public assets are in `admin/` and protected APIs are in `functions/api/admin/`.

Cloudflare Pages production settings:
- Existing `FEEDBACK_DB` binding: `everdwell-feedback`.
- Encrypted `SUPABASE_SECRET_KEY`: server-only user directory access.
- `ADMIN_WRITES_ENABLED=true`: enable version-checked feedback status updates.
- Apply `migrations/0002_admin_state.sql` before enabling status updates.

Supabase allows the exact callback `https://home-materials-prototype.pages.dev/admin/`. Keep the original public-site URL configuration as well.

Administrator source is maintained in the sibling `Website administrator` folder. Run its `node publish-to-main.mjs` after changes, inspect the generated diff in this repository, commit and push. Never copy .env files or the local Node server to the public asset directory.

Mail integration uses Gmail SMTP over TLS on port 465, with `GMAIL_APP_PASSWORD` stored as a Cloudflare Production Secret. Sender is fixed to everdwellsupport@gmail.com. Apply `migrations/0003_feedback_mail.sql` before deployment.

New feedback queues a single English/French acknowledgement containing a do-not-reply notice. It never marks feedback handled. Manual replies preserve the entered text and mark feedback handled only when Gmail accepts the message. Acceptance is not delivery confirmation. Records live in D1, not browser storage. Explicit retries are allowed only for pending/failed jobs (at most three attempts); uncertain outcomes must be checked in Gmail Sent before any further action. Older feedback is not bulk-emailed. Manually changing a status does not send an email.
