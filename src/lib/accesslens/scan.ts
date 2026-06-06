import { HighLevelClient } from "@/lib/ghl/client";
import { toAccessMatrixCsv, toFindingsCsv } from "./export";
import { demoAccessReport } from "./fixtures";
import { buildAccessExposureReport } from "./model";
import type { AccessExposureReport, AccessLensSource } from "./types";
import { getInstallationStore, type InstallationStore } from "@/lib/store/installations";

export type AccessLensScanParams = {
  installationId?: string;
};

export type AccessLensScan = {
  mode: "fixture" | "live";
  report: AccessExposureReport;
  matrixCsv: string;
  findingsCsv: string;
};

type AccessLensClient = {
  buildAccessLensSource(companyId?: string): Promise<AccessLensSource>;
};

type ScanDependencies = {
  store?: InstallationStore;
  clientFactory?: (accessToken: string) => AccessLensClient;
};

export async function scanAccessLens(params: AccessLensScanParams = {}, deps: ScanDependencies = {}): Promise<AccessLensScan> {
  const store = deps.store ?? getInstallationStore();
  const installation = params.installationId ? await store.get(params.installationId) : undefined;

  if (!installation) {
    return buildScan("fixture", demoAccessReport);
  }

  const clientFactory = deps.clientFactory ?? ((accessToken: string) => new HighLevelClient(accessToken));
  const source = await clientFactory(installation.accessToken).buildAccessLensSource(installation.companyId);
  return buildScan("live", buildAccessExposureReport(source));
}

function buildScan(mode: AccessLensScan["mode"], report: AccessExposureReport): AccessLensScan {
  return {
    mode,
    report,
    matrixCsv: toAccessMatrixCsv(report),
    findingsCsv: toFindingsCsv(report)
  };
}
