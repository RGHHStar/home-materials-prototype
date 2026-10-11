# EverDwell authentication setup

## Current state

The website has a bilingual, responsive sign-in dialog and Supabase integration code.
Email authentication is configured in the Canada (Central) Supabase project
`bmyvzfxzrppajuntwfxg`; the owner confirmed real email delivery and local OTP sign-in.
The owner subsequently requested a sender change; successful delivery from that new
sender has not been independently verified.

On 2026-09-08, Google OAuth client `EverDwell Website Login` was created with public ID
`911217218382-3kf23m8io61s8ukvpkfft8avr6tb96og.apps.googleusercontent.com`.
Its authorized origin is `https://home-materials-prototype.pages.dev` and callback is
`https://bmyvzfxzrppajuntwfxg.supabase.co/auth/v1/callback`. The secret was transferred
directly to Supabase, never stored in this repository. The public Auth settings confirm
both email and Google enabled. Commit `5a69446` enables the frontend Google button and
was pushed to origin/main. Fresh production verification was blocked by a recurring
Fortinet certificate error; an older cached page still showed Google unavailable.
Local Google sign-in reached Google's account chooser; user consent, successful callback,
and persistence after Google sign-in are still awaiting end-to-end verification.

The Google project remains External / Testing. Publishing is disabled until required
branding fields (including homepage and privacy policy) are completed. Google documents
an exception for basic identity-only scopes; do not claim production branding approval
or guaranteed school-account access. Do not describe UI tests as live authentication tests.

The earlier localhost:8765 Google experiment is separate from this implementation.
It does not create website accounts. Its Google application was named
`EverDwell Login Test`; a production integration should use its own Google OAuth client.

## Service setup required

1. Sign in to Supabase using the site owner's account. Create a Free project in the
   specific **Canada (Central)** region if Canadian primary-data location is wanted.
   Do not enable paid plans without the owner's approval. Region selection does not
   imply every downstream email/logging service operates only in Canada.
2. Set Authentication > URL Configuration > Site URL to
   `https://home-materials-prototype.pages.dev/`. Allow that exact redirect URL and,
   for local tests, `http://localhost:4180/`. Avoid wildcard production redirects.
3. Enable the email provider. Configure **six-digit** email OTPs, **600-second**
   expiry, and an appropriate sending rate. The app uses `type: 'email'` verification.
   The Magic Link email template must include `{{ .Token }}` as a code, not only a
   confirmation link. The default Supabase mail service is restricted and cannot
   serve general customers.
4. Connect a real SMTP sender, such as Resend, after verifying an owner-controlled
   sending domain. The free `pages.dev` site address is not such a domain. Configure
   the provider's DNS authentication records and mail limits. Store SMTP credentials
   **only in Supabase settings**, never in this repository. Test with an owner-approved
   real recipient; sending acceptance is not proof of inbox delivery.
5. For Google, configure a production Web OAuth client with the exact callback URL
   supplied by Supabase (normally `https://PROJECT_REF.supabase.co/auth/v1/callback`).
   Use only `openid`, `email`, and `profile`. Configure the consent screen for the
   intended audience. Enter the client secret only in Supabase's Google provider settings.
   School administrators may still block this client even if a personal Gmail works.
6. Copy only the Supabase project URL and **publishable** key (`sb_publishable_...`)
   into `auth-config.js`. Set each provider flag true only after that provider is
   configured and ready for live testing. Never paste a secret/service-role key,
   Google client secret, SMTP password, or app password into browser code or GitHub.

## Behaviour

- First successful email verification creates/signs into an account; no password.
- Sending never silently falls back to a fake code or a local-only user.
- Google uses Supabase PKCE redirects in the same browser tab. A prior site route is
  restored after successful callback. Errors are surfaced without exposing raw tokens.
- Header/account display is populated after `getUser()` validates the current session.
- Standard Supabase browser sessions persist across reloads; sign-out clears this device's
  session. Shared-device messaging is included. This is not a server-side access-control
  implementation: all existing website content remains public.
- Assessments and plans are **not** saved to user accounts yet. Before adding user data,
  create tables with row-level security and test that users cannot read each other's rows.
- The SDK version is pinned to `@supabase/supabase-js@2.57.4`, loaded on demand from jsDelivr.

## Verification before release

- UI tests: `node work/test-auth.cjs` with the local site preview on port 4180.
  The test launches a visible Chrome window. Its provider doubles are for UI/control-flow
  checks only. Screenshots are in `work/auth-*.png`.
- Real email: send to an approved inbox, confirm receipt, reject wrong/expired code,
  accept valid code, reload and confirm session, then sign out.
- Real Google: accept and cancel authorization; confirm callback and account; reload;
  sign out; separately try an approved school account and document actual admin errors.
- Verify production email delivery, Google redirect URL, sign-out, EN/FR, and mobile
  rendering after deployment. Do not publish test credentials or test-provider doubles.

## Official references

- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/auth/sessions/pkce-flow
