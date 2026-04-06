# Supabase Sign-Up Confirmation Email

This repo stores the PantryClip sign-up confirmation email as a dashboard-ready HTML template:

- HTML template: [`docs/supabase/signup-confirmation-email.html`](./signup-confirmation-email.html)

## Recommended Supabase Settings

- Subject line: `Confirm your PantryClip account`
- Preheader text:
  `Confirm your email to start saving short-form recipe videos as clean, searchable cooking notes in PantryClip.`

## Supabase Template Variables Used

- `{{ .Email }}` shows the recipient email for reassurance
- `{{ .ConfirmationURL }}` powers the primary button and fallback link

The template intentionally relies on `{{ .ConfirmationURL }}` so it remains compatible with the existing PantryClip sign-up flow.

## How To Apply It

1. Open Supabase Dashboard.
2. Go to `Authentication` -> `Email Templates`.
3. Select the sign-up confirmation template.
4. Set the subject line above.
5. Paste the HTML from [`docs/supabase/signup-confirmation-email.html`](./signup-confirmation-email.html).
6. Save and send a test email.

## Verification Checklist

- The email explains why it was sent.
- The `Confirm Email` button is prominent on mobile and desktop.
- The fallback URL is visible and usable.
- Clicking the CTA still follows Supabase's confirmation link behavior.
- The email feels branded and trustworthy instead of generic.
