import type { AccessExposureReport } from "./types";

export function toAccessMatrixCsv(report: AccessExposureReport): string {
  return [
    "Email,Name,Role,Type,Elevated,Sub-account count,Sub-accounts,Last active",
    ...report.matrix.map((row) =>
      csvRow([
        row.email,
        row.name,
        row.role,
        row.type,
        row.elevated ? "yes" : "no",
        String(row.accessCount),
        row.locationNames.join("; "),
        row.lastActiveLabel
      ])
    )
  ].join("\n");
}

export function toFindingsCsv(report: AccessExposureReport): string {
  return [
    "Rule,Severity,Title,Affected users,Affected sub-accounts,Summary",
    ...report.findings.map((finding) =>
      csvRow([
        finding.rule,
        finding.severity,
        finding.title,
        finding.affectedUsers.join("; "),
        finding.affectedLocations.join("; "),
        finding.summary
      ])
    )
  ].join("\n");
}

function csvRow(values: string[]): string {
  return values.map(csvCell).join(",");
}

function csvCell(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}
