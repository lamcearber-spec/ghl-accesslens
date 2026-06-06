import { describe, expect, it } from "vitest";
import { buildAccessExposureReport } from "./model";
import type { AccessLensSource } from "./types";

const source: AccessLensSource = {
  agencyName: "Radom Force",
  agencyDomain: "radom.group",
  generatedAt: "2026-06-06T10:00:00.000Z",
  locations: [
    { id: "loc-1", name: "Alpha Clinic", lifecycle: "active" },
    { id: "loc-2", name: "Bravo Dental", lifecycle: "active" },
    { id: "loc-3", name: "Client Leaving", lifecycle: "offboarded" }
  ],
  users: [
    {
      id: "u-1",
      name: "Arber Lamce",
      email: "arber@radom.group",
      role: "admin",
      type: "agency",
      locationIds: ["loc-1", "loc-2", "loc-3"],
      lastActiveAt: "2026-06-01T09:00:00.000Z"
    },
    {
      id: "u-2",
      name: "Outside Consultant",
      email: "ops@external.example",
      role: "admin",
      type: "agency",
      locationIds: ["loc-1", "loc-3"]
    },
    {
      id: "u-3",
      name: "Client Manager",
      email: "manager@client.example",
      role: "user",
      type: "location",
      locationIds: ["loc-1"]
    }
  ]
};

describe("buildAccessExposureReport", () => {
  it("builds a who-can-reach-what matrix with the four access exposure rules", () => {
    const report = buildAccessExposureReport(source, {
      adminLocationThreshold: 3,
      adminCountThreshold: 1
    });

    expect(report.totals).toEqual({
      locations: 3,
      users: 3,
      elevatedUsers: 2,
      findings: 4
    });
    expect(report.matrix).toEqual([
      expect.objectContaining({
        email: "arber@radom.group",
        accessCount: 3,
        elevated: true,
        locationNames: ["Alpha Clinic", "Bravo Dental", "Client Leaving"],
        lastActiveLabel: "2026-06-01"
      }),
      expect.objectContaining({
        email: "ops@external.example",
        emailDomain: "external.example",
        elevated: true,
        lastActiveLabel: "Best-effort unavailable"
      }),
      expect.objectContaining({
        email: "manager@client.example",
        elevated: false,
        accessCount: 1
      })
    ]);

    expect(report.findings.map((finding) => finding.rule)).toEqual([
      "external-elevated",
      "offboarding-drift",
      "admin-on-many-accounts",
      "too-many-admins"
    ]);
    expect(report.findings.find((finding) => finding.rule === "external-elevated")).toEqual(
      expect.objectContaining({
        severity: "critical",
        affectedUsers: ["ops@external.example"],
        affectedLocations: ["Alpha Clinic", "Client Leaving"]
      })
    );
    expect(report.findings.find((finding) => finding.rule === "offboarding-drift")).toEqual(
      expect.objectContaining({
        affectedLocations: ["Client Leaving"],
        affectedUsers: ["arber@radom.group", "ops@external.example"]
      })
    );
  });

  it("creates a stable evidence hash independent of source ordering", () => {
    const first = buildAccessExposureReport(source);
    const reordered = buildAccessExposureReport({
      ...source,
      locations: [...source.locations].reverse(),
      users: [...source.users].reverse()
    });

    expect(first.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(reordered.contentHash).toBe(first.contentHash);
  });
}
);
