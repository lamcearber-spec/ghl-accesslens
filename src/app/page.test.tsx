import { describe, expect, it, vi } from "vitest";
import Home from "./page";
import { scanAccessLens } from "@/lib/accesslens/scan";

vi.mock("@/lib/accesslens/scan", () => ({
  scanAccessLens: vi.fn(async () => ({
    mode: "fixture",
    report: {
      agencyName: "Test Agency",
      agencyDomain: "agency.example",
      generatedAt: "2026-06-06T10:00:00.000Z",
      contentHash: "a".repeat(64),
      totals: { locations: 1, users: 1, elevatedUsers: 1, findings: 0 },
      matrix: [],
      findings: []
    },
    matrixCsv: "",
    findingsCsv: ""
  }))
}));

describe("Home", () => {
  it("passes marketplace redirect params into the AccessLens scan", async () => {
    await Home({
      searchParams: Promise.resolve({
        installationId: "company-1"
      })
    });

    expect(scanAccessLens).toHaveBeenCalledWith({
      installationId: "company-1"
    });
  });
});
