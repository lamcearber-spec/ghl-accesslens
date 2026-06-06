import { describe, expect, it } from "vitest";
import type { InstallationStore, MarketplaceInstallation } from "@/lib/store/installations";
import { scanAccessLens } from "./scan";

const installation: MarketplaceInstallation = {
  id: "company-1",
  companyId: "company-1",
  userType: "Company",
  accessToken: "live-token",
  refreshToken: "refresh-token",
  expiresAt: "2026-06-06T11:00:00.000Z",
  scopes: ["users.readonly", "locations.readonly", "companies.readonly", "oauth.readonly"],
  createdAt: "2026-06-06T10:00:00.000Z",
  updatedAt: "2026-06-06T10:00:00.000Z"
};

describe("scanAccessLens", () => {
  it("returns a fixture-backed report when no installation is available", async () => {
    const scan = await scanAccessLens({}, { store: emptyStore() });

    expect(scan.mode).toBe("fixture");
    expect(scan.report.agencyName).toBe("Radom Force");
    expect(scan.matrixCsv).toContain("Email,Name,Role");
    expect(scan.findingsCsv).toContain("external-elevated");
  });

  it("uses a live installation and client factory when installationId is provided", async () => {
    const scan = await scanAccessLens(
      { installationId: "company-1" },
      {
        store: storeWith(installation),
        clientFactory: (token) => ({
          buildAccessLensSource: async () => ({
            agencyName: `Token ${token}`,
            agencyDomain: "agency.example",
            generatedAt: "2026-06-06T10:00:00.000Z",
            locations: [{ id: "loc-live", name: "Live Location", lifecycle: "active" }],
            users: [
              {
                id: "user-live",
                name: "Live Admin",
                email: "admin@agency.example",
                role: "admin",
                type: "agency",
                locationIds: ["loc-live"]
              }
            ]
          })
        })
      }
    );

    expect(scan.mode).toBe("live");
    expect(scan.report.agencyName).toBe("Token live-token");
    expect(scan.report.matrix[0].email).toBe("admin@agency.example");
  });
});

function emptyStore(): InstallationStore {
  return {
    get: async () => undefined,
    save: async () => undefined
  };
}

function storeWith(value: MarketplaceInstallation): InstallationStore {
  return {
    get: async (id) => (id === value.id ? value : undefined),
    save: async () => undefined
  };
}
