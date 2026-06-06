import type { AccessLensSource, AccessLocation, AccessUser, AccessUserRole, AccessUserType } from "@/lib/accesslens/types";

export const HIGHLEVEL_API_BASE = "https://services.leadconnectorhq.com";
const HIGHLEVEL_API_VERSION = "2023-02-21";
const PAGE_LIMIT = 100;

type QueryValue = string | number | boolean | null | undefined;
type RawRecord = Record<string, unknown>;

export function buildGhlUrl(path: string, query: Record<string, QueryValue> = {}): URL {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, HIGHLEVEL_API_BASE);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

export class HighLevelClient {
  constructor(
    private readonly accessToken: string,
    private readonly fetcher: typeof fetch = fetch
  ) {}

  async buildAccessLensSource(companyId?: string): Promise<AccessLensSource> {
    const [company, locations] = await Promise.all([this.getCompany(companyId), this.listInstalledLocations(companyId)]);
    const usersByKey = new Map<string, AccessUser>();

    for (const location of locations) {
      for (const user of await this.searchUsers(location.id)) {
        const key = user.id || user.email;
        const existing = usersByKey.get(key);
        if (existing) {
          existing.locationIds = [...new Set([...existing.locationIds, ...user.locationIds])];
        } else {
          usersByKey.set(key, user);
        }
      }
    }

    return {
      agencyName: company.name ?? "HighLevel Agency",
      agencyDomain: company.domain ?? fallbackAgencyDomain([...usersByKey.values()]),
      generatedAt: new Date().toISOString(),
      locations,
      users: [...usersByKey.values()]
    };
  }

  async getCompany(companyId?: string): Promise<{ name?: string; domain?: string }> {
    if (!companyId) {
      return {};
    }

    const payload = await this.getJson(`/companies/${companyId}`);
    const raw = extractSingleRecord(payload, "company");
    return {
      name: asString(raw.name ?? raw.companyName),
      domain: domainFromUnknown(raw.domain ?? raw.website ?? raw.email)
    };
  }

  async listInstalledLocations(companyId?: string): Promise<AccessLocation[]> {
    const payload = await this.getJson("/oauth/installedLocations", { companyId, limit: PAGE_LIMIT });
    return extractRecords(payload, ["locations", "installedLocations"]).map(normalizeLocation);
  }

  async searchUsers(locationId: string): Promise<AccessUser[]> {
    const payload = await this.getJson("/users/search", { locationId, limit: PAGE_LIMIT });
    return extractRecords(payload, ["users"]).map((raw) => normalizeUser(raw, locationId));
  }

  private async getJson(path: string, query: Record<string, QueryValue> = {}): Promise<unknown> {
    const response = await this.fetcher(buildGhlUrl(path, query), {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.accessToken}`,
        Version: HIGHLEVEL_API_VERSION
      }
    });

    if (!response.ok) {
      throw new Error(`HighLevel request failed: ${response.status}`);
    }

    return response.json();
  }
}

export function normalizeLocation(raw: RawRecord): AccessLocation {
  return {
    id: requiredString(raw.locationId ?? raw.id ?? raw._id, "location id"),
    name: asString(raw.name ?? raw.businessName ?? raw.companyName) ?? "Unnamed sub-account",
    lifecycle: isOffboarded(raw) ? "offboarded" : "active"
  };
}

export function normalizeUser(raw: RawRecord, fallbackLocationId: string): AccessUser {
  return {
    id: requiredString(raw.id ?? raw._id ?? raw.userId ?? raw.email, "user id"),
    name: asString(raw.name ?? raw.fullName ?? joinName(raw.firstName, raw.lastName)) ?? "Unnamed user",
    email: requiredString(raw.email, "user email").toLowerCase(),
    role: normalizeRole(raw.role ?? raw.userRole ?? raw.type),
    type: normalizeType(raw.type ?? raw.userType),
    locationIds: normalizeLocationIds(raw.locationIds ?? raw.locations ?? raw.roles, fallbackLocationId),
    lastActiveAt: asString(raw.lastActiveAt ?? raw.lastLoginAt ?? raw.updatedAt)
  };
}

function normalizeLocationIds(value: unknown, fallbackLocationId: string): string[] {
  if (Array.isArray(value)) {
    const ids = value
      .flatMap((item) => {
        if (typeof item === "string") {
          return [item];
        }
        if (isRecord(item)) {
          return [asString(item.locationId ?? item.id)].filter((id): id is string => Boolean(id));
        }
        return [];
      })
      .filter(Boolean);
    return ids.length > 0 ? [...new Set(ids)] : [fallbackLocationId];
  }

  if (isRecord(value) && Array.isArray(value.locationIds)) {
    return normalizeLocationIds(value.locationIds, fallbackLocationId);
  }

  return [fallbackLocationId];
}

function normalizeRole(value: unknown): AccessUserRole {
  const role = asString(value)?.toLowerCase();
  return role?.includes("admin") ? "admin" : "user";
}

function normalizeType(value: unknown): AccessUserType {
  const type = asString(value)?.toLowerCase();
  return type?.includes("location") || type?.includes("sub") ? "location" : "agency";
}

function isOffboarded(raw: RawRecord): boolean {
  const text = [raw.lifecycle, raw.status, raw.stage, raw.tags].map((value) => JSON.stringify(value ?? "")).join(" ").toLowerCase();
  return text.includes("offboard");
}

function extractSingleRecord(payload: unknown, preferredKey: string): RawRecord {
  if (isRecord(payload) && isRecord(payload[preferredKey])) {
    return payload[preferredKey];
  }

  if (isRecord(payload)) {
    return payload;
  }

  return {};
}

function extractRecords(payload: unknown, keys: string[]): RawRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (!isRecord(payload)) {
    return [];
  }

  for (const key of keys) {
    const value = payload[key];
    if (Array.isArray(value)) {
      return value.filter(isRecord);
    }
  }

  return [];
}

function fallbackAgencyDomain(users: AccessUser[]): string {
  const firstElevated = users.find((user) => user.role === "admin") ?? users[0];
  return firstElevated ? firstElevated.email.split("@")[1] ?? "agency.example" : "agency.example";
}

function domainFromUnknown(value: unknown): string | undefined {
  const text = asString(value);
  if (!text) {
    return undefined;
  }

  if (text.includes("@")) {
    return text.split("@")[1]?.toLowerCase();
  }

  try {
    const url = new URL(text.startsWith("http") ? text : `https://${text}`);
    return url.hostname.toLowerCase();
  } catch {
    return text.toLowerCase();
  }
}

function requiredString(value: unknown, field: string): string {
  const text = asString(value);
  if (!text) {
    throw new Error(`HighLevel record is missing ${field}.`);
  }
  return text;
}

function joinName(first: unknown, last: unknown): string | undefined {
  return [asString(first), asString(last)].filter(Boolean).join(" ") || undefined;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim() !== "") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return undefined;
}

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
