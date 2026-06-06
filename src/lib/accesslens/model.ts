import { createHash } from "node:crypto";
import type {
  AccessExposureReport,
  AccessLensOptions,
  AccessLensSource,
  AccessLocation,
  AccessMatrixRow,
  AccessUser,
  ExposureFinding,
  ExposureRule,
  ExposureSeverity
} from "./types";

const DEFAULT_ADMIN_LOCATION_THRESHOLD = 5;
const DEFAULT_ADMIN_COUNT_THRESHOLD = 3;

const SEVERITY_RANK: Record<ExposureSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2
};

const RULE_RANK: Record<ExposureRule, number> = {
  "external-elevated": 0,
  "offboarding-drift": 1,
  "admin-on-many-accounts": 2,
  "too-many-admins": 3
};

export function buildAccessExposureReport(source: AccessLensSource, options: AccessLensOptions = {}): AccessExposureReport {
  const adminLocationThreshold = options.adminLocationThreshold ?? DEFAULT_ADMIN_LOCATION_THRESHOLD;
  const adminCountThreshold = options.adminCountThreshold ?? DEFAULT_ADMIN_COUNT_THRESHOLD;
  const locations = sortBy(source.locations, (location) => location.name);
  const locationById = new Map(locations.map((location) => [location.id, location]));
  const users = sortUsers(source.users);
  const matrix = users.map((user) => matrixRow(user, locationById));
  const findings = sortFindings([
    ...externalElevatedFindings(matrix, source.agencyDomain),
    ...offboardingDriftFindings(matrix, locations),
    ...adminOnManyAccountsFindings(matrix, adminLocationThreshold),
    ...tooManyAdminsFindings(matrix, locations, adminCountThreshold)
  ]);

  const reportWithoutHash = {
    agencyName: source.agencyName,
    agencyDomain: normalizeDomain(source.agencyDomain),
    generatedAt: source.generatedAt,
    totals: {
      locations: locations.length,
      users: users.length,
      elevatedUsers: matrix.filter((row) => row.elevated).length,
      findings: findings.length
    },
    matrix,
    findings
  };

  return {
    ...reportWithoutHash,
    contentHash: hashReport(reportWithoutHash)
  };
}

function matrixRow(user: AccessUser, locationById: Map<string, AccessLocation>): AccessMatrixRow {
  const locations = user.locationIds.map((id) => locationById.get(id)).filter((location): location is AccessLocation => Boolean(location));

  return {
    userId: user.id,
    name: user.name,
    email: user.email.toLowerCase(),
    emailDomain: emailDomain(user.email),
    role: user.role,
    type: user.type,
    elevated: user.role === "admin",
    locationIds: locations.map((location) => location.id),
    locationNames: locations.map((location) => location.name),
    accessCount: locations.length,
    lastActiveLabel: user.lastActiveAt ? user.lastActiveAt.slice(0, 10) : "Best-effort unavailable"
  };
}

function externalElevatedFindings(matrix: AccessMatrixRow[], agencyDomain: string): ExposureFinding[] {
  const normalizedAgencyDomain = normalizeDomain(agencyDomain);
  const users = matrix.filter((row) => row.elevated && row.emailDomain !== normalizedAgencyDomain);

  if (users.length === 0) {
    return [];
  }

  return [
    {
      id: "external-elevated",
      rule: "external-elevated",
      severity: "critical",
      title: "External elevated users",
      summary: `${users.length} elevated user${plural(users.length)} ${users.length === 1 ? "uses" : "use"} a non-agency email domain.`,
      affectedUsers: users.map((row) => row.email),
      affectedLocations: uniqueSorted(users.flatMap((row) => row.locationNames))
    }
  ];
}

function offboardingDriftFindings(matrix: AccessMatrixRow[], locations: AccessLocation[]): ExposureFinding[] {
  const offboarded = locations.filter((location) => location.lifecycle === "offboarded");
  const users = matrix.filter((row) => row.locationIds.some((locationId) => offboarded.some((location) => location.id === locationId)));

  if (offboarded.length === 0 || users.length === 0) {
    return [];
  }

  return [
    {
      id: "offboarding-drift",
      rule: "offboarding-drift",
      severity: "critical",
      title: "Offboarding drift",
      summary: `${users.length} user${plural(users.length)} still have access to offboarded client sub-accounts.`,
      affectedUsers: users.map((row) => row.email),
      affectedLocations: offboarded.map((location) => location.name)
    }
  ];
}

function adminOnManyAccountsFindings(matrix: AccessMatrixRow[], threshold: number): ExposureFinding[] {
  const users = matrix.filter((row) => row.elevated && row.accessCount >= threshold);

  if (users.length === 0) {
    return [];
  }

  return [
    {
      id: "admin-on-many-accounts",
      rule: "admin-on-many-accounts",
      severity: "warning",
      title: "Admins on many sub-accounts",
      summary: `${users.length} admin user${plural(users.length)} ${users.length === 1 ? "meets" : "meet"} or exceed the ${threshold}-sub-account threshold.`,
      affectedUsers: users.map((row) => row.email),
      affectedLocations: uniqueSorted(users.flatMap((row) => row.locationNames))
    }
  ];
}

function tooManyAdminsFindings(matrix: AccessMatrixRow[], locations: AccessLocation[], threshold: number): ExposureFinding[] {
  const affectedLocations = locations.filter((location) => {
    const adminCount = matrix.filter((row) => row.elevated && row.locationIds.includes(location.id)).length;
    return adminCount > threshold;
  });

  if (affectedLocations.length === 0) {
    return [];
  }

  return [
    {
      id: "too-many-admins",
      rule: "too-many-admins",
      severity: "warning",
      title: "Sub-accounts with too many admins",
      summary: `${affectedLocations.length} sub-account${plural(affectedLocations.length)} exceed the admin-count threshold.`,
      affectedUsers: uniqueSorted(
        matrix.filter((row) => row.elevated && row.locationIds.some((id) => affectedLocations.some((location) => location.id === id))).map((row) => row.email)
      ),
      affectedLocations: affectedLocations.map((location) => location.name)
    }
  ];
}

function sortFindings(findings: ExposureFinding[]): ExposureFinding[] {
  return sortBy(findings, (finding) => `${SEVERITY_RANK[finding.severity]}-${RULE_RANK[finding.rule]}-${finding.id}`);
}

function sortBy<T>(items: T[], key: (item: T) => string): T[] {
  return [...items].sort((left, right) => key(left).localeCompare(key(right)));
}

function sortUsers(users: AccessUser[]): AccessUser[] {
  return [...users].sort((left, right) => {
    const elevatedDelta = Number(right.role === "admin") - Number(left.role === "admin");
    if (elevatedDelta !== 0) {
      return elevatedDelta;
    }

    const accessDelta = right.locationIds.length - left.locationIds.length;
    if (accessDelta !== 0) {
      return accessDelta;
    }

    return left.email.localeCompare(right.email);
  });
}

function emailDomain(email: string): string {
  return normalizeDomain(email.split("@")[1] ?? "");
}

function normalizeDomain(domain: string): string {
  return domain.trim().toLowerCase();
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function plural(count: number): string {
  return count === 1 ? "" : "s";
}

function hashReport(report: Omit<AccessExposureReport, "contentHash">): string {
  return createHash("sha256").update(JSON.stringify(report)).digest("hex");
}
