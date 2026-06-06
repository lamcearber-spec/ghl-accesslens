import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("/api/report", () => {
  it("returns a fixture-backed AccessLens report with CSV exports", async () => {
    const response = await GET(new Request("https://accesslens.test/api/report"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.mode).toBe("fixture");
    expect(payload.report.agencyName).toBe("Radom Force");
    expect(payload.matrixCsv).toContain("Email,Name,Role");
    expect(payload.findingsCsv).toContain("external-elevated");
  });
});
