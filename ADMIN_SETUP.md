# Portfolio Content Studio — GitHub-backed admin (no database)

The public portfolio remains static. An owner-only admin screen updates two JSON files in GitHub:
- `src/data/profile.json` (name, bio, education, experience, certificates)
- `src/data/projects.json` (project carousel)

Images upload to `public/certificates/`. Every Save creates a GitHub commit on `main`, which triggers a Vercel redeployment when Vercel Git integration is enabled.

## One-time setup

1. Deploy/connect `mcartv/cav-portfolio` in Vercel and note the stable **production** domain (for example `https://cav-portfolio.vercel.app`, but use your actual assigned address).
2. In GitHub, open **Settings → Developer settings → OAuth Apps → New OAuth App**.
3. Set **Homepage URL** to your exact production URL.
4. Set **Authorization callback URL** to `https://YOUR-PRODUCTION-DOMAIN/api/admin?action=callback`.
5. Note your GitHub OAuth App **Client ID**, and generate a **Client secret**. Do not commit or paste the secret into code or chat.
6. In **Vercel → Project → Settings → Environment Variables**, add these four variables, scoped to **Production**:
   - `GITHUB_OAUTH_CLIENT_ID` — OAuth App Client ID
   - `GITHUB_OAUTH_CLIENT_SECRET` — OAuth App Client secret
   - `ADMIN_SESSION_SECRET` — a fresh random string of **at least 32 characters** (for example generate privately with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`)
   - `ADMIN_SITE_URL` — the exact production origin, for example `https://YOUR-PRODUCTION-DOMAIN` (no trailing slash, no path)
7. Trigger a new **Production redeployment** so Vercel Functions receive the environment variables.
8. Visit `https://YOUR-PRODUCTION-DOMAIN/?admin=1`, choose **Sign in with GitHub**, and authorize with the `mcartv` GitHub account.

Only the GitHub account `mcartv` can sign in. The OAuth token is held in a short-lived AES-256-GCM-encrypted HttpOnly cookie; it is not exposed to the browser JavaScript. Saving is restricted to two content files and certificate uploads, uses revision SHA checks, and requires same-origin POSTs. Session expires after four hours.

**Important:** OAuth Apps may ask for the GitHub `public_repo` permission, which has broader public-repository access than just this project. For narrower GitHub permissions, a GitHub App installation-token setup would be a future upgrade. Do not authorize the OAuth App unless you understand its requested access.

## Using the editor

- **PROFILE:** name, headline, About text, contact URLs, focus, education, experience.
- **CERTIFICATES:** edit title, category, issuer, date; upload a JPG, PNG or WebP certificate image (under 1.9 MB), then click **Save Certificates**.
- **PROJECTS:** edit titles, summaries, technologies, GitHub links, cards.
- A file upload commits the image first; **Save Certificates** publishes its path in profile.json.
- To add a profile photo, upload `public/profile.jpg` in your repository and set `photoUrl` to `/profile.jpg`.

Do not upload private identifiers or sensitive personal details to a public portfolio repository.

## Local development

`npm run dev` serves the public portfolio, but **not** the Vercel serverless API. The admin login/save experience requires Vercel Functions (production or `vercel dev` with the correct local environment setup). An unconfigured editor shows setup instructions instead of allowing unsafe writes.

## Troubleshooting

- **503 Not configured:** verify all four variables exist in Vercel Production and redeploy.
- **401:** log in again with `mcartv`.
- **403:** check your `ADMIN_SITE_URL`, GitHub callback URL, and account.
- **409:** another GitHub commit changed that file; reload the editor before saving.
- **Images don't appear immediately:** Vercel needs to finish the GitHub-triggered redeployment.
- **Non-production preview deployment:** OAuth callback is pinned to the stable production URL; use the production admin URL to edit.
