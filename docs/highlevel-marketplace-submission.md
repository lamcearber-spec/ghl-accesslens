# AccessLens HighLevel Marketplace Submission

## URLs

- Production app URL: `https://ghl-accesslens.vercel.app/`
- OAuth callback URL: `https://ghl-accesslens.vercel.app/api/ghl/callback`
- Privacy URL: `https://ghl-accesslens.vercel.app/privacy`
- Terms URL: `https://ghl-accesslens.vercel.app/terms`
- Support URL: `https://ghl-accesslens.vercel.app/support`

## App Identity

- App name: `AccessLens: User Access Audit`
- HighLevel app ID: `6a2415931d5fcbfac6df50ba`
- Submitted version/status: `1.0.0` / `review`
- Short name: `AccessLens`
- Category: Compliance
- Target user: Agency
- Short description: `Export 90-day user/admin access exposure evidence packs for SOC2, DPA, and client security reviews.`

## Long Description

AccessLens helps HighLevel agencies answer recurring security-review questions: who can access which client sub-account, which users have admin rights across many accounts, where external domains still have elevated access, and which offboarded clients still have users attached.

The app is read-only. It builds a portfolio-wide who-can-reach-what matrix, flags admin-on-many-accounts exposure, external elevated users, sub-accounts with too many admins, and offboarding drift, then exports CSV and a PDF Access Exposure / Segregation-of-Duties Evidence Pack.

Use it for 90-day user access reviews, SOC2 support evidence, client DPA requests, and agency offboarding checks. AccessLens does not create, edit, delete, or modify users, roles, permissions, or sub-account records.

## Search Keywords

`HighLevel user audit`, `GHL access audit`, `admin exposure`, `SOC2 evidence`, `DPA evidence`, `user permissions`, `access matrix`, `segregation of duties`, `security review`, `offboarding audit`

## Scope Justification

- `users.readonly`: read users, roles, and account type for access matrix rows.
- `locations.readonly`: read installed sub-accounts and names for the access matrix.
- `companies.readonly`: read agency/company identity for report header and agency-domain comparison.
- `oauth.readonly`: enumerate installed locations for agency-level portfolio reports.

No write scopes are requested.

## Reviewer Test Notes

The root dashboard renders fixture data before installation, so reviewers can inspect the core report immediately. After OAuth install, the app stores encrypted tokens and reads user/location/company data on demand. PDF and CSV exports are available from the dashboard and from `/api/report` and `/api/report/pdf`.
