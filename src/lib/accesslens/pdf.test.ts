import { describe, expect, it } from "vitest";
import { demoAccessReport } from "./fixtures";
import { renderAccessLensPdf } from "./pdf";

describe("AccessLens PDF", () => {
  it("renders a real PDF evidence pack", async () => {
    const pdf = await renderAccessLensPdf(demoAccessReport);

    expect(pdf.subarray(0, 4).toString("ascii")).toBe("%PDF");
    expect(pdf.length).toBeGreaterThan(1500);
  });
});
