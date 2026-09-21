import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { downloadCsv } from "@/lib/format";
import { downloadPdf, type PdfDocSpec } from "@/lib/pdf";
import { useStorePdf } from "@/hooks/use-store-pdf";

type Props = {
  /** Optional spreadsheet export. */
  csv?: { filename: string; rows: () => Record<string, unknown>[] };
  /** PDF document, branding is filled in from store settings. */
  pdf: () => Omit<PdfDocSpec, "storeName" | "storeMeta">;
  pdfLabel?: string;
  disabled?: boolean;
  className?: string;
};

/** Consistent CSV + PDF export pair used across every module. */
export function ExportButtons({ csv, pdf, pdfLabel = "PDF", disabled, className }: Props) {
  const { storeName, storeMeta } = useStorePdf();

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      {csv && (
        <Button variant="outline" disabled={disabled} onClick={() => downloadCsv(csv.filename, csv.rows())}>
          <Download className="mr-2 h-4 w-4" />
          CSV
        </Button>
      )}
      <Button variant="outline" disabled={disabled} onClick={() => downloadPdf({ ...pdf(), storeName, storeMeta })}>
        <FileText className="mr-2 h-4 w-4" />
        {pdfLabel}
      </Button>
    </div>
  );
}
