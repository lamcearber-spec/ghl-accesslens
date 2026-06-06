import { InfoPage } from "@/components/InfoPage";

export default function PrivacyPage() {
  return (
    <InfoPage eyebrow="AccessLens" title="Privacy Policy">
      <p>
        AccessLens is a read-only evidence app for HighLevel user, role, agency, and sub-account access records. The app
        requests only read scopes needed to produce access exposure and segregation-of-duties evidence packs.
      </p>
      <p>
        AccessLens stores OAuth access and refresh tokens so installed accounts can generate reports. In production,
        stored tokens are encrypted before being persisted. The app does not sell customer data and does not use account
        or user data for advertising.
      </p>
      <p>
        Evidence packs may include user names, emails, roles, account type, sub-account names, best-effort activity
        timestamps, exposure findings, and generated content hashes. AccessLens does not create, edit, delete, or change
        users, roles, permissions, or sub-accounts.
      </p>
      <p>Support and deletion requests: support@konverter-pro.de.</p>
    </InfoPage>
  );
}
