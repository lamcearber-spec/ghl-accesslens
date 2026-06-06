import { ArrowDownToLine, FileText, KeyRound, ShieldCheck, TriangleAlert, UsersRound } from "lucide-react";
import { toAccessMatrixCsv, toFindingsCsv } from "@/lib/accesslens/export";
import type { AccessExposureReport, ExposureSeverity } from "@/lib/accesslens/types";

type AccessLensDashboardProps = {
  report: AccessExposureReport;
  mode: "fixture" | "live";
  pdfUrl?: string;
};

export function AccessLensDashboard({ report, mode, pdfUrl = "/api/report/pdf" }: AccessLensDashboardProps) {
  return (
    <main className="shell">
      <section className="topbar" aria-label="AccessLens summary">
        <div>
          <p className="eyebrow">90-day access audit</p>
          <h1>AccessLens</h1>
          <p className="subcopy">
            Read-only user/admin exposure packs for SOC2, DPA, and client security reviews across HighLevel sub-accounts.
          </p>
        </div>
        <div className="mode-pill" title={mode === "fixture" ? "Demo audit is active until the app is installed." : "Live agency audit"}>
          <ShieldCheck size={16} aria-hidden="true" />
          {mode === "fixture" ? "Fixture audit" : "Live audit"}
        </div>
      </section>

      <div className="action-row" aria-label="Primary evidence downloads">
        <a className="csv-link primary-download" href={pdfUrl} download>
          <FileText size={15} aria-hidden="true" />
          Download PDF
        </a>
      </div>

      <section className="metrics" aria-label="Access exposure totals">
        <Metric label="Sub-accounts" value={String(report.totals.locations)} tone="neutral" />
        <Metric label="Elevated users" value={String(report.totals.elevatedUsers)} tone="risk" />
        <Metric label="Findings" value={String(report.totals.findings)} tone={report.totals.findings > 0 ? "risk" : "neutral"} />
      </section>

      <section className="notice" aria-label="Read-only guarantee">
        <ShieldCheck size={18} aria-hidden="true" />
        <span>Read-only by design. AccessLens aggregates users, roles, and sub-account access; it never edits users or changes permissions.</span>
      </section>

      <section className="table-grid evidence-grid" aria-label="Audit details">
        <div className="table-panel">
          <div className="table-head">
            <h2>
              <TriangleAlert size={18} aria-hidden="true" />
              Exposure findings
            </h2>
            <a className="csv-link" href={csvHref(toFindingsCsv(report))} download="accesslens-findings.csv">
              <ArrowDownToLine size={15} aria-hidden="true" />
              Download findings
            </a>
          </div>
          <div className="finding-list">
            {report.findings.map((finding) => (
              <article key={finding.id} className={`finding finding-${finding.severity}`}>
                <span className={`badge badge-${badgeTone(finding.severity)}`}>{finding.severity}</span>
                <h3>{finding.title}</h3>
                <p>{finding.summary}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="table-panel">
          <div className="table-head">
            <h2>
              <KeyRound size={18} aria-hidden="true" />
              Evidence hash
            </h2>
          </div>
          <p className="hash-text">{report.contentHash}</p>
          <p className="panel-copy">
            Pack generated for {report.agencyName} on {report.generatedAt}. Last-active is best-effort where HighLevel audit data is available.
          </p>
        </div>
      </section>

      <section className="table-panel transcript-panel">
        <div className="table-head">
          <h2>
            <UsersRound size={18} aria-hidden="true" />
            Who-can-reach-what matrix
          </h2>
          <a className="csv-link" href={csvHref(toAccessMatrixCsv(report))} download="accesslens-matrix.csv">
            <ArrowDownToLine size={15} aria-hidden="true" />
            Download matrix
          </a>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Type</th>
                <th>Sub-accounts</th>
                <th>Last active</th>
              </tr>
            </thead>
            <tbody>
              {report.matrix.map((row) => (
                <tr key={row.userId}>
                  <td>
                    <strong>{row.name}</strong>
                    <span className="cell-subtext">{row.email}</span>
                  </td>
                  <td>{row.role}</td>
                  <td>{row.type}</td>
                  <td>{row.locationNames.join(", ")}</td>
                  <td>{row.lastActiveLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "risk" | "neutral" }) {
  return (
    <div className={`metric metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function badgeTone(severity: ExposureSeverity): "missing" | "review" {
  return severity === "critical" ? "missing" : "review";
}

function csvHref(csv: string): string {
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
}
