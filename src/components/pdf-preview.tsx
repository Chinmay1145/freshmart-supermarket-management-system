import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ExternalLink } from "lucide-react";
import { buildPdf, savePdf, PDF_PREVIEW_EVENT, type PdfDocSpec } from "@/lib/pdf";

/** Listens for PDF requests and shows a live preview before the file is saved. */
export function PdfPreviewHost() {
  const [spec, setSpec] = useState<PdfDocSpec | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const onPreview = (e: Event) => {
      e.preventDefault();
      const next = (e as CustomEvent<PdfDocSpec>).detail;
      const blob = buildPdf(next).output("blob");
      setSpec(next);
      setUrl(URL.createObjectURL(blob));
    };
    window.addEventListener(PDF_PREVIEW_EVENT, onPreview);
    return () => window.removeEventListener(PDF_PREVIEW_EVENT, onPreview);
  }, []);

  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  const close = () => { setSpec(null); setUrl(null); };

  return (
    <Dialog open={!!spec} onOpenChange={(o) => !o && close()}>
      <DialogContent className="flex h-[90vh] max-w-5xl flex-col gap-3">
        <DialogHeader>
          <DialogTitle>Preview: {spec?.title}</DialogTitle>
          <DialogDescription>Check the store details and layout, then download.</DialogDescription>
        </DialogHeader>
        {url && <iframe title="PDF preview" src={url} className="w-full flex-1 rounded-md border bg-muted" />}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={close}>Close</Button>
          {url && (
            <Button variant="outline" asChild>
              <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-4 w-4" />Open in new tab</a>
            </Button>
          )}
          <Button onClick={() => { if (spec) savePdf(spec); close(); }}>
            <Download className="mr-2 h-4 w-4" />Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
