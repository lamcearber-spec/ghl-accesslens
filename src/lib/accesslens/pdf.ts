import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import type PDFKit from "pdfkit";
import type { AccessExposureReport, ExposureFinding } from "./types";

export async function renderAccessLensPdf(report: AccessExposureReport): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 42, size: "A4", bufferPages: true });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  title(doc, report);
  section(doc, "Summary");
  fact(doc, "Agency", report.agencyName);
  fact(doc, "Agency domain", report.agencyDomain);
  fact(doc, "Generated", report.generatedAt);
  fact(doc, "Evidence hash", report.contentHash);
  fact(doc, "Sub-accounts", String(report.totals.locations));
  fact(doc, "Users", String(report.totals.users));
  fact(doc, "Elevated users", String(report.totals.elevatedUsers));
  fact(doc, "Findings", String(report.totals.findings));

  section(doc, "Exposure findings");
  for (const finding of report.findings) {
    findingBlock(doc, finding);
  }

  section(doc, "Who-can-reach-what matrix");
  for (const row of report.matrix) {
    doc
      .fontSize(9)
      .fillColor("#171717")
      .text(`${row.email} · ${row.role}/${row.type} · ${row.accessCount} sub-account${row.accessCount === 1 ? "" : "s"}`, { continued: false });
    doc.fontSize(8).fillColor("#60646c").text(row.locationNames.join(", ") || "No readable sub-account access").moveDown(0.45);
  }

  doc.end();
  await new Promise<void>((resolve) => doc.on("end", resolve));
  return Buffer.concat(chunks);
}

function title(doc: PDFKit.PDFDocument, report: AccessExposureReport): void {
  doc.fontSize(10).fillColor("#0f766e").text("ACCESS EXPOSURE / SOD EVIDENCE PACK", { characterSpacing: 0.5 });
  doc.moveDown(0.4);
  doc.fontSize(28).fillColor("#171717").text("AccessLens", { lineGap: 2 });
  doc.fontSize(11).fillColor("#60646c").text(`${report.agencyName} · ${report.generatedAt}`);
  doc.moveDown(1.2);
}

function section(doc: PDFKit.PDFDocument, label: string): void {
  doc.moveDown(0.8);
  doc.fontSize(13).fillColor("#10201f").text(label);
  doc.moveTo(42, doc.y + 4).lineTo(553, doc.y + 4).strokeColor("#d8dee4").stroke();
  doc.moveDown(0.8);
}

function fact(doc: PDFKit.PDFDocument, label: string, value: string): void {
  doc.fontSize(8).fillColor("#60646c").text(label.toUpperCase());
  doc.fontSize(10).fillColor("#171717").text(value || "Not available").moveDown(0.45);
}

function findingBlock(doc: PDFKit.PDFDocument, finding: ExposureFinding): void {
  doc.fontSize(10).fillColor(finding.severity === "critical" ? "#b42318" : "#7a4b00").text(`${finding.severity.toUpperCase()} · ${finding.title}`);
  doc.fontSize(9).fillColor("#171717").text(finding.summary);
  doc.fontSize(8).fillColor("#60646c").text(`Users: ${finding.affectedUsers.join(", ") || "none"}`);
  doc.fontSize(8).fillColor("#60646c").text(`Sub-accounts: ${finding.affectedLocations.join(", ") || "none"}`).moveDown(0.7);
}
