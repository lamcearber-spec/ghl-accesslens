import { describe, expect, it } from "vitest";
import { demoAccessReport } from "./fixtures";
import { toAccessMatrixCsv, toFindingsCsv } from "./export";

describe("AccessLens exports", () => {
  it("exports the access matrix and findings as reviewer-readable CSV", () => {
    const matrixCsv = toAccessMatrixCsv(demoAccessReport);
    const findingsCsv = toFindingsCsv(demoAccessReport);

    expect(matrixCsv).toContain("Email,Name,Role,Type,Elevated,Sub-account count,Sub-accounts,Last active");
    expect(matrixCsv).toContain('"ops@external.example","Outside Consultant","admin","agency","yes","2","Alpha Clinic; Client Leaving","Best-effort unavailable"');
    expect(findingsCsv).toContain("Rule,Severity,Title,Affected users,Affected sub-accounts,Summary");
    expect(findingsCsv).toContain('"external-elevated","critical","External elevated users"');
  });
});
