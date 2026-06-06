import { describe, expect, it } from "vitest";
import { buildGhlUrl, normalizeLocation, normalizeUser } from "./client";

describe("HighLevel AccessLens client", () => {
  it("builds versioned HighLevel URLs without empty query values", () => {
    const url = buildGhlUrl("/users/search", { locationId: "loc-1", limit: 100, cursor: "" });

    expect(url.toString()).toBe("https://services.leadconnectorhq.com/users/search?locationId=loc-1&limit=100");
  });

  it("normalizes installed locations and users into the AccessLens source shape", () => {
    expect(normalizeLocation({ locationId: "loc-1", name: "Alpha Clinic" })).toEqual({
      id: "loc-1",
      name: "Alpha Clinic",
      lifecycle: "active"
    });
    expect(normalizeUser({ id: "user-1", name: "Ada Admin", email: "ada@agency.example", role: "admin", type: "agency" }, "loc-1")).toEqual({
      id: "user-1",
      name: "Ada Admin",
      email: "ada@agency.example",
      role: "admin",
      type: "agency",
      locationIds: ["loc-1"],
      lastActiveAt: undefined
    });
  });
});
