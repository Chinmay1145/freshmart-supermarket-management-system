import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/** Brand palette (RGB) used for exported documents. */
const BRAND: [number, number, number] = [16, 122, 74];
const BRAND_DARK: [number, number, number] = [11, 90, 55];
const INK: [number, number, number] = [31, 41, 55];
const MUTED: [number, number, number] = [107, 114, 128];
const LIGHT: [number, number, number] = [240, 247, 243];
const LINE: [number, number, number] = [226, 232, 240];

/** jsPDF core fonts have no rupee glyph, so amounts use the "Rs." prefix. */
export const pdfAmount = (value: number | string | null | undefined) =>
  `Rs. ${new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Number(value ?? 0),
  )}`;

export const pdfNumber = (value: number | string | null | undefined, digits = 2) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits }).format(Number(value ?? 0));

export const pdfDate = (value: string | Date | null | undefined) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export type PdfStat = { label: string; value: string; hint?: string };

export type PdfMeta = { label: string; value: string };

export type PdfTotal = { label: string; value: string; strong?: boolean };

export type PdfTable = {
  heading: string;
  subheading?: string;
  head: string[];
  rows: (string | number)[][];
  alignRight?: number[];
  columnWidths?: Record<number, number>;
  empty?: string;
};

export type PdfDocSpec = {
  filename: string;
  title: string;
  subtitle: string;
  /** Business name shown in the header band. */
  storeName?: string;
  /** Address / phone / GST lines printed under the business name. */
  storeMeta?: (string | null | undefined)[];
  /** Key-value details grid (invoice no, customer, payment terms...). */
  meta?: PdfMeta[];
  stats?: PdfStat[];
  tables?: PdfTable[];
  /** Right aligned totals block, last strong entry is highlighted. */
  totals?: PdfTotal[];
  notes?: (string | null | undefined)[];
  /** Small line centred above the footer, e.g. "Thank you for your business". */
  closingNote?: string;
};

const MARGIN = 40;
const BAND = 96;

export function buildPdf(spec: PdfDocSpec) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const contentW = pageW - MARGIN * 2;
  const store = spec.storeName?.trim() || "FreshMart ERP";
  const storeMeta = (spec.storeMeta ?? []).filter((l): l is string => !!l && !!l.trim());

  const generatedOn = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // ---- Header band -------------------------------------------------------
  const drawHeader = () => {
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, pageW, BAND, "F");
    doc.setFillColor(...BRAND_DARK);
    doc.rect(0, BAND - 4, pageW, 4, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(store, MARGIN, 36, { maxWidth: contentW * 0.55 });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    let my = 52;
    for (const line of storeMeta.slice(0, 3)) {
      doc.text(line, MARGIN, my, { maxWidth: contentW * 0.55 });
      my += 11;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(spec.title, pageW - MARGIN, 36, { align: "right", maxWidth: contentW * 0.42 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(spec.subtitle, pageW - MARGIN, 54, { align: "right", maxWidth: contentW * 0.42 });
    doc.setFontSize(8);
    doc.text(`Generated ${generatedOn}`, pageW - MARGIN, 70, { align: "right" });
  };

  drawHeader();
  let y = BAND + 28;

  const newPage = () => {
    doc.addPage();
    drawHeader();
    y = BAND + 28;
  };

  const ensure = (needed: number) => {
    if (y + needed > pageH - 60) newPage();
  };

  // ---- Details grid ------------------------------------------------------
  const meta = (spec.meta ?? []).filter((m) => m.value);
  if (meta.length) {
    const perRow = 3;
    const colW = contentW / perRow;
    const rows = Math.ceil(meta.length / perRow);
    ensure(rows * 32 + 14);
    const top = y;
    doc.setFillColor(...LIGHT);
    doc.setDrawColor(...LINE);
    doc.roundedRect(MARGIN, top - 14, contentW, rows * 32 + 14, 6, 6, "FD");
    meta.forEach((m, i) => {
      const x = MARGIN + 14 + (i % perRow) * colW;
      const ry = top + Math.floor(i / perRow) * 32;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...MUTED);
      doc.text(m.label.toUpperCase(), x, ry);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      doc.text(m.value, x, ry + 13, { maxWidth: colW - 24 });
    });
    y = top + rows * 32 + 16;
  }

  // ---- Summary cards -----------------------------------------------------
  const stats = spec.stats ?? [];
  if (stats.length) {
    const perRow = Math.min(stats.length, 4);
    const gap = 12;
    const cardW = (contentW - gap * (perRow - 1)) / perRow;
    const rows = Math.ceil(stats.length / perRow);
    ensure(rows * 74);
    const top0 = y;
    stats.forEach((s, i) => {
      const x = MARGIN + (i % perRow) * (cardW + gap);
      const top = top0 + Math.floor(i / perRow) * 74;
      doc.setFillColor(...LIGHT);
      doc.setDrawColor(219, 234, 226);
      doc.roundedRect(x, top, cardW, 62, 6, 6, "FD");
      doc.setFillColor(...BRAND);
      doc.rect(x, top + 10, 3, 42, "F");
      doc.setTextColor(...MUTED);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text(s.label.toUpperCase(), x + 12, top + 18, { maxWidth: cardW - 22 });
      doc.setTextColor(...INK);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(s.value, x + 12, top + 38, { maxWidth: cardW - 22 });
      if (s.hint) {
        doc.setTextColor(...MUTED);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.text(s.hint, x + 12, top + 52, { maxWidth: cardW - 22 });
      }
    });
    y = top0 + rows * 74 + 10;
  }

  // ---- Tables ------------------------------------------------------------
  for (const table of spec.tables ?? []) {
    ensure(110);
    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(table.heading, MARGIN, y);
    if (table.subheading) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      doc.text(table.subheading, pageW - MARGIN, y, { align: "right" });
    }
    doc.setDrawColor(...BRAND);
    doc.setLineWidth(1.2);
    doc.line(MARGIN, y + 5, MARGIN + 28, y + 5);
    doc.setLineWidth(0.5);
    y += 14;

    const body = table.rows.length
      ? table.rows
      : [[table.empty ?? "No records for this period.", ...Array(Math.max(table.head.length - 1, 0)).fill("")]];

    const columnStyles: Record<number, { halign?: "right"; cellWidth?: number }> = {};
    for (const i of table.alignRight ?? []) columnStyles[i] = { ...(columnStyles[i] ?? {}), halign: "right" };
    for (const [i, w] of Object.entries(table.columnWidths ?? {}))
      columnStyles[Number(i)] = { ...(columnStyles[Number(i)] ?? {}), cellWidth: w };

    autoTable(doc, {
      startY: y,
      head: [table.head],
      body: body as string[][],
      margin: { left: MARGIN, right: MARGIN, top: BAND + 28 },
      tableWidth: contentW,
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 5.5,
        textColor: INK,
        lineColor: LINE,
        lineWidth: 0.5,
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: { fillColor: BRAND, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles,
      didDrawPage: (data) => {
        // Repeat the branded header on pages the table spills onto.
        if (data.pageNumber > 1) drawHeader();
      },
    });
    y = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y) + 24;
  }

  // ---- Totals ------------------------------------------------------------
  const totals = spec.totals ?? [];
  if (totals.length) {
    const boxW = 240;
    const rowH = 18;
    const boxH = totals.length * rowH + 16;
    ensure(boxH + 10);
    const x = pageW - MARGIN - boxW;
    doc.setFillColor(252, 253, 252);
    doc.setDrawColor(...LINE);
    doc.roundedRect(x, y, boxW, boxH, 6, 6, "FD");
    let ty = y + 20;
    totals.forEach((t) => {
      if (t.strong) {
        doc.setFillColor(...LIGHT);
        doc.rect(x + 1, ty - 12, boxW - 2, rowH, "F");
      }
      doc.setFont("helvetica", t.strong ? "bold" : "normal");
      doc.setFontSize(t.strong ? 10.5 : 9);
      doc.setTextColor(...(t.strong ? INK : MUTED));
      doc.text(t.label, x + 12, ty);
      doc.setTextColor(...INK);
      doc.setFont("helvetica", t.strong ? "bold" : "normal");
      doc.text(t.value, x + boxW - 12, ty, { align: "right" });
      ty += rowH;
    });
    y += boxH + 18;
  }

  // ---- Notes -------------------------------------------------------------
  const notes = (spec.notes ?? []).filter((n): n is string => !!n && !!n.trim());
  if (notes.length) {
    ensure(24 + notes.length * 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text("Notes", MARGIN, y);
    y += 13;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    for (const note of notes) {
      const lines = doc.splitTextToSize(note, contentW) as string[];
      ensure(lines.length * 11);
      doc.text(lines, MARGIN, y);
      y += lines.length * 11 + 3;
    }
    y += 8;
  }

  if (spec.closingNote) {
    ensure(24);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(spec.closingNote, pageW / 2, y + 6, { align: "center" });
  }

  // ---- Footers -----------------------------------------------------------
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, pageH - 42, pageW - MARGIN, pageH - 42);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(`${store} — ${spec.title}`, MARGIN, pageH - 27);
    doc.text(`Page ${p} of ${pages}`, pageW - MARGIN, pageH - 27, { align: "right" });
  }

  return doc;
}

/** Saves the PDF straight to disk (used by the preview dialog's Download button). */
export function savePdf(spec: PdfDocSpec) {
  buildPdf(spec).save(spec.filename);
}

export const PDF_PREVIEW_EVENT = "freshmart:pdf-preview";

/**
 * Opens the PDF preview dialog so store details and layout can be checked
 * before saving. Falls back to a direct download if no preview host is mounted.
 */
export function downloadPdf(spec: PdfDocSpec) {
  if (typeof window === "undefined") return;
  const handled = !window.dispatchEvent(new CustomEvent(PDF_PREVIEW_EVENT, { detail: spec, cancelable: true }));
  if (!handled) savePdf(spec);
}
