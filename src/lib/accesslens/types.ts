export type AccessUserRole = "admin" | "user";
export type AccessUserType = "agency" | "location";
export type AccessLocationLifecycle = "active" | "offboarded";
export type ExposureSeverity = "critical" | "warning" | "info";
export type ExposureRule = "admin-on-many-accounts" | "external-elevated" | "too-many-admins" | "offboarding-drift";

export type AccessLocation = {
  id: string;
  name: string;
  lifecycle: AccessLocationLifecycle;
};

export type AccessUser = {
  id: string;
  name: string;
  email: string;
  role: AccessUserRole;
  type: AccessUserType;
  locationIds: string[];
  lastActiveAt?: string;
};

export type AccessLensSource = {
  agencyName: string;
  agencyDomain: string;
  generatedAt: string;
  locations: AccessLocation[];
  users: AccessUser[];
};

export type AccessMatrixRow = {
  userId: string;
  name: string;
  email: string;
  emailDomain: string;
  role: AccessUserRole;
  type: AccessUserType;
  elevated: boolean;
  locationIds: string[];
  locationNames: string[];
  accessCount: number;
  lastActiveLabel: string;
};

export type ExposureFinding = {
  id: string;
  rule: ExposureRule;
  severity: ExposureSeverity;
  title: string;
  summary: string;
  affectedUsers: string[];
  affectedLocations: string[];
};

export type AccessExposureReport = {
  agencyName: string;
  agencyDomain: string;
  generatedAt: string;
  contentHash: string;
  totals: {
    locations: number;
    users: number;
    elevatedUsers: number;
    findings: number;
  };
  matrix: AccessMatrixRow[];
  findings: ExposureFinding[];
};

export type AccessLensOptions = {
  adminLocationThreshold?: number;
  adminCountThreshold?: number;
};
