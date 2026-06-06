import { scanAccessLens } from "@/lib/accesslens/scan";
import { renderAccessLensPdf } from "@/lib/accesslens/pdf";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scan = await scanAccessLens({
    installationId: url.searchParams.get("installationId") ?? undefined
  });
  const pdf = await renderAccessLensPdf(scan.report);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="accesslens-${scan.report.generatedAt.slice(0, 10)}.pdf"`
    }
  });
}
