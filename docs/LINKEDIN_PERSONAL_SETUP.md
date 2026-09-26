# Easton Augustine: direct LinkedIn posting

Destination: https://www.linkedin.com/in/easton-augustine-7a45aa102/

The scheduled job publisher can add this personal profile alongside the #Web3
and CVin.Bio Buffer Pages. It stays disabled until OAuth authorization is saved
and `LINKEDIN_PERSONAL_ENABLED=true` is set. A public profile URL does not grant
posting rights; LinkedIn supplies the member ID through OAuth.

## Create the developer app

In https://www.linkedin.com/developers/apps, create an app for this publishing
integration and complete LinkedIn's company Page association/verification as
requested. The app administrator must do this in LinkedIn's UI.

Enable these products:

- **Share on LinkedIn** (`w_member_social`).
- **Sign In with LinkedIn using OpenID Connect** (`openid`, `profile`).

In **Auth**, register this exact redirect URI:

```text
https://hashtagweb3.com/contact
```

The existing `/contact` page is only the browser's landing page. It does not redeem
the authorization code or store tokens. The local CLI completes the exchange,
so this setup does not require a new public callback endpoint or site deployment.

Create a local, gitignored `.env.linkedin-personal.local` file:

```dotenv
LINKEDIN_PERSONAL_CLIENT_ID=your_app_client_id
LINKEDIN_PERSONAL_CLIENT_SECRET=your_app_client_secret
LINKEDIN_PERSONAL_REDIRECT_URI=https://hashtagweb3.com/contact
```

## Authorize Easton's profile

```bash
npx tsx scripts/social/authorize-linkedin-personal.ts start
```

Send the generated authorization URL to Easton. He must open it while signed
into his own LinkedIn account and approve the requested permissions. After the
redirect, he can provide the callback URL privately to the app administrator.
The callback URL contains a short-lived authorization code: do not put it in
chat, repository files, or public issue reports.

Within 30 minutes of starting:

```bash
npx tsx scripts/social/authorize-linkedin-personal.ts finish
```

Paste the callback URL at the local prompt. The CLI validates the redirect,
state and expiry, exchanges the code, and obtains the authenticated member ID.
It checks the returned name against Easton Augustine to catch accidentally
authorizing the operator's profile. Name matching is not independent identity
verification; Easton must confirm he authorized the intended profile.

Credentials are saved with owner-only permissions under the gitignored
`credentials/linkedin-personal/` directory. Tokens and app secrets are never
printed by the CLI.

## Enable the scheduled publisher

```bash
npx tsx scripts/social/authorize-linkedin-personal.ts install-github
```

This checks the token's member ID, sets three GitHub Actions secrets, and enables
the personal destination only after the secrets are saved:

- `LINKEDIN_PERSONAL_ACCESS_TOKEN`
- `LINKEDIN_PERSONAL_MEMBER_ID`
- `LINKEDIN_PERSONAL_TOKEN_EXPIRES_AT`
- Repository variable `LINKEDIN_PERSONAL_ENABLED=true`

It does not post immediately or trigger a deployment. Before each post, the
publisher confirms the token still belongs to the configured member. It uses
`POST /rest/posts`, explicit article title/description and the existing job OG
image, and records the returned post URN separately from the Buffer receipts.
A failure on this profile does not prevent submissions to the two Pages.

## Renewal and disabling

The expiry is taken from LinkedIn's token response. Ordinary self-service apps
do not have guaranteed programmatic refresh-token access. Repeat start, finish
and install-github before expiry or after consent is revoked. Do not assume
the token remains valid indefinitely.

Set `LINKEDIN_PERSONAL_ENABLED=false` to stop this destination. The current REST
API version is `202609`; the workflow accepts a `LINKEDIN_API_VERSION` repository
variable when a later supported version is needed.

References:
- https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow
- https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
- https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
- https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
