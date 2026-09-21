import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/** Brand palette (RGB) used for exported documents. */
const BRAND: [number, number, number] = [16, 122, 74];
const INK: [number, number, number] = [31, 41, 55];
const MUTED: [number, number, number] = [107, 114, 128];
const LIGHT: [number, number, number] = [240, 247, 243];

/** jsPDF core fonts have no rupee glyph, so amounts use the "Rs." prefix. */
export const pdfAmount = (value: number | string | null | undefined) =>
  `Rs. ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Number(value ?? 0),
  )}`;

export const pdfNumber = (value: number | string | null | undefined, digits = 2) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(Number(value ?? 0));

export type PdfStat = { label: string; value: string; hint?: string };

export type PdfTable = {
  heading: string;
  head: string[];
  rows: (string | number)[][];
  alignRight?: number[];
  empty?: string;
};

export type PdfDocSpec = {
  filename: string;
  title: string;
  subtitle: string;
  storeName?: string;
  stats?: PdfStat[];
  tables?: PdfTable[];
};

export function buildPdf(spec: PdfDocSpec) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const store = spec.storeName?.trim() || "FreshMart ERP";

  // ---- Header band -------------------------------------------------------
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, pageW, 78, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text(store, margin, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(spec.title, margin, 54);
  doc.setFontSize(9);
  doc.text(spec.subtitle, pageW - margin, 54, { align: "right" });
  doc.text(
    new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    pageW - margin,
    34,
    { align: "right" },
  );

  let y = 108;

  // ---- Summary cards -----------------------------------------------------
  const stats = spec.stats ?? [];
  if (stats.length) {
    const perRow = Math.min(stats.length, 4);
    const gap = 12;
    const cardW = (pageW - margin * 2 - gap * (perRow - 1)) / perRow;
    stats.forEach((s, i) => {
      const row = Math.floor(i / perRow);
      const col = i % perRow;
      const x = margin + col * (cardW + gap);
      const top = y + row * 74;
      doc.setFillColor(...LIGHT);
      doc.setDrawColor(219, 234, 226);
      doc.roundedRect(x, top, cardW, 62, 6, 6, "FD");
      doc.setTextColor(...MUTED);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(s.label.toUpperCase(), x + 10, top + 18);
      doc.setTextColor(...INK);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(s.value, x + 10, top + 38, { maxWidth: cardW - 20 });
      if (s.hint) {
        doc.setTextColor(...MUTED);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.text(s.hint, x + 10, top + 52, { maxWidth: cardW - 20 });
      }
    });
    y += Math.ceil(stats.length / perRow) * 74 + 8;
  }

  // ---- Tables ------------------------------------------------------------
  for (const table of spec.tables ?? []) {
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    if (y > doc.internal.pageSize.getHeight() - 120) {
      doc.addPage();
      y = 60;
    }
    doc.text(table.heading, margin, y);
    y += 8;

    const body = table.rows.length
      ? table.rows
      : [[table.empty ?? "No records for this period.", ...Array(Math.max(table.head.length - 1, 0)).fill("")]];

    autoTable(doc, {
      startY: y,
      head: [table.head],
      body: body as string[][],
      margin: { left: margin, right: margin },
      styles: { font: "helvetica", fontSize: 9, cellPadding: 6, textColor: INK, lineColor: [226, 232, 240], lineWidth: 0.5 },
      headStyles: { fillColor: BRAND, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: Object.fromEntries((table.alignRight ?? []).map((i) => [i, { halign: "right" as const }])),
    });
    y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 26;
  }

  // ---- Footers -----------------------------------------------------------
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    const h = doc.internal.pageSize.getHeight();
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, h - 42, pageW - margin, h - 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`${store} — ${spec.title}`, margin, h - 26);
    doc.text(`Page ${p} of ${pages}`, pageW - margin, h - 26, { align: "right" });
  }

  return doc;
}

export function downloadPdf(spec: PdfDocSpec) {
  buildPdf(spec).save(spec.filename);
}
