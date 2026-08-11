# Resend confirmation email

## Correction first

The Cloud → Users view has no "resend confirmation" action. Per-user actions there are limited to viewing details and deleting. Workarounds available today:

- Add user → Send invitation to the same address (sends a fresh link).
- Delete the unconfirmed user, then have them sign up again.
- Ask them to hit "Forgot password?" — only works once confirmed, so not a fix for pending signups.

To make this self-serve, add a resend control to the sign-in page.

## What gets built

On `/auth`, after a signup that requires confirmation, the "check your email" panel gains a **Resend confirmation email** button:

- Sends a new confirmation link to the same address.
- Shows a success toast, then disables itself for 60 seconds with a countdown so people don't spam it.
- Surfaces the rate-limit message plainly if the backend refuses ("too many requests — try again in a minute").

Also add a small "Didn't get the confirmation email? Resend it" link under the sign-in form, shown when the entered email fails to sign in with an unconfirmed-account error. It reuses the same send + cooldown logic.

## Technical notes

- `supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: window.location.origin } })` in `src/routes/auth.tsx`; same redirect origin the existing `signUp` call uses, so the confirmed user lands back on the site.
- Cooldown held in local component state (`useState` + `useEffect` interval), no persistence needed.
- Errors surfaced via the existing `sonner` toast pattern; `over_email_send_rate_limit` (HTTP 429) gets a friendlier message than the raw error.
- Confirmation emails already route through the project's branded auth templates, so no template or email-infrastructure work is needed.

## Out of scope

- No changes to auth settings (email confirmation stays required).
- No admin-side resend tooling.
