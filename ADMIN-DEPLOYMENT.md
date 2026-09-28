# Admin deployment

The production administrator entry point is `/admin/`. Public assets are in `admin/` and protected APIs are in `functions/api/admin/`.

Cloudflare Pages production settings:
- Existing `FEEDBACK_DB` binding: `everdwell-feedback`.
- Encrypted `SUPABASE_SECRET_KEY`: server-only user directory access.
- `ADMIN_WRITES_ENABLED=true`: enable version-checked feedback status updates.
- Apply `migrations/0002_admin_state.sql` before enabling status updates.

Supabase allows the exact callback `https://home-materials-prototype.pages.dev/admin/`. Keep the original public-site URL configuration as well.

Administrator source is maintained in the sibling `Website administrator` folder. Run its `node publish-to-main.mjs` after changes, inspect the generated diff in this repository, commit and push. Never copy .env files or the local Node server to the public asset directory.

The mail-reply integration remains disabled. Changing a status does not send an email.
