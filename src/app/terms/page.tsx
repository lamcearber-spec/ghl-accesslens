import { InfoPage } from "@/components/InfoPage";

export default function TermsPage() {
  return (
    <InfoPage eyebrow="AccessLens" title="Terms of Service">
      <p>
        AccessLens provides read-only user/admin access exposure evidence packs for operational and security review. It
        is not legal advice and does not certify SOC2, GDPR, DPA, or other regulatory compliance.
      </p>
      <p>
        Findings are based on available HighLevel user, location, company, installed-location, and best-effort activity
        records at the time a pack is generated. Users should review all evidence before relying on it in a client audit.
      </p>
      <p>
        AccessLens does not modify account data. Users remain responsible for reviewing access, removing stale users,
        responding to security requests, and validating exports against their systems of record.
      </p>
      <p>Support: support@konverter-pro.de.</p>
    </InfoPage>
  );
}
