import { buildAccessExposureReport } from "./model";
import type { AccessLensSource } from "./types";

export const demoAccessSource: AccessLensSource = {
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

export const demoAccessReport = buildAccessExposureReport(demoAccessSource, {
  adminLocationThreshold: 3,
  adminCountThreshold: 1
});
