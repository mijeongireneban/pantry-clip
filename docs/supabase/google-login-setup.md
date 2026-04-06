# Google Login Setup

This project uses Supabase Auth for Google login.

## 1. Create Google OAuth credentials

In Google Cloud Console:

1. Create or select a project.
2. Open the Google Auth Platform or `APIs & Services` -> `Credentials`.
3. Create an OAuth client ID with application type `Web application`.
4. Add authorized JavaScript origins:
   - `https://pantry-clip.vercel.app`
   - `http://localhost:3000`
5. Add the authorized redirect URI shown on the Supabase Google provider page.
   - It usually looks like:
     `https://<your-project-ref>.supabase.co/auth/v1/callback`
6. Copy the Client ID and Client Secret.

## 2. Configure Google in Supabase

In Supabase Dashboard:

1. Go to `Authentication` -> `Providers` -> `Google`.
2. Turn on `Enable Sign in with Google`.
3. Paste the Google Client ID.
4. Paste the Google Client Secret.
5. Keep `Skip nonce checks` off.
6. Keep `Allow users without an email` off.
7. Save.

## 3. Configure Supabase URL settings

In Supabase Dashboard:

1. Go to `Authentication` -> `URL Configuration`.
2. Set the site URL to your primary app URL:
   - Production: `https://pantry-clip.vercel.app`
3. Add redirect URLs for the app callback route:
   - `https://pantry-clip.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback`

## 4. Notes

- The Google OAuth redirect URI and the app callback route are different:
  - Google OAuth redirect URI:
    `https://<your-project-ref>.supabase.co/auth/v1/callback`
  - App callback route:
    `/auth/callback`
- The app callback route exchanges the Supabase auth code for a session and then returns the user to the app.
