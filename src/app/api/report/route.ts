import { NextResponse } from "next/server";
import { scanAccessLens } from "@/lib/accesslens/scan";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scan = await scanAccessLens({
    installationId: url.searchParams.get("installationId") ?? undefined
  });

  return NextResponse.json(scan);
}
