# AccessLens: User Access Evidence Packs for HighLevel

AccessLens is a read-only HighLevel Marketplace app for cross-sub-account user/admin access exposure reports.

## Marketplace Positioning

**Suggested app name:** AccessLens: User Access Audit

**Short description:** Export 90-day user/admin access exposure evidence packs for SOC2, DPA, and client security reviews.

**Search terms to work into the listing:** HighLevel user audit, GHL access audit, admin exposure, SOC2 evidence, DPA evidence, user permissions, access matrix, segregation of duties.

**Pricing:** GHL native billing. $49/mo entry, $99/mo Pro, optional one-time $149 audit pack.

## Read-Only Scopes

- `users.readonly`
- `locations.readonly`
- `companies.readonly`
- `oauth.readonly`

No write scopes are used.

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The dashboard uses fixture mode until HighLevel OAuth credentials are configured and an `installationId` is present.

## Environment

Copy `.env.example` to `.env.local` and fill:

- `GHL_CLIENT_ID`
- `GHL_CLIENT_SECRET`
- `GHL_REDIRECT_URI`
- `APP_BASE_URL`
- `INSTALLATION_SECRET`
- `DATABASE_URL`

If `DATABASE_URL` is set, AccessLens stores encrypted OAuth tokens in Neon/Postgres. Without it, development uses memory storage.

## HighLevel Setup

Create a public Marketplace app, target agency/company install, and configure the Custom Page URL to the deployed app root and the OAuth redirect URL to `/api/ghl/callback`.

The app reads:

- `GET /oauth/installedLocations`
- `GET /locations/:locationId`
- `GET /locations/search`
- `GET /users/search`
- `GET /companies/:companyId`

## Verification

```bash
pnpm test
pnpm typecheck
pnpm build
```
