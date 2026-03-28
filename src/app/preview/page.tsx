"use client";

import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DropZone } from "@/components/ui/DropZone";
import { FileListItem } from "@/components/ui/FileListItem";
import { StatusBar, StatusState } from "@/components/ui/StatusBar";
import { Eye, ZoomIn, ZoomOut } from "lucide-react";
import { PrimaryBtn } from "@/components/ui/PrimaryBtn";
import { isValidPDF } from "@/lib/pdf";

export default function PreviewPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any | null>(null);
  const [scale, setScale] = useState(1.5);
  const [status, setStatus] = useState<StatusState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const handleFilesAdded = async (newFiles: File[]) => {
    const selected = newFiles[0];
    if (!selected) return;

    setStatus({ type: "processing", msg: "Loading document for preview..." });
    setIsProcessing(true);
    setPdfDoc(null);

    try {
      const arrayBuffer = await selected.arrayBuffer();
      if (!isValidPDF(arrayBuffer)) {
        throw new Error("Invalid PDF file format.");
      }

      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const task = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const doc = await task.promise;

      setPdfDoc(doc);
      setFile(selected);
      setStatus(null);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "error", msg: err.message || "Failed to load PDF preview." });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!pdfDoc) return;

    const renderPages = async () => {
      setStatus({ type: "processing", msg: "Rendering pages..." });
      try {
        const renderPromises = [];
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale });
          const canvas = canvasRefs.current[i - 1];
          if (canvas) {
            const context = canvas.getContext("2d");
            if (context) {
              canvas.height = viewport.height;
              canvas.width = viewport.width;
              const renderContext = {
                canvasContext: context,
                viewport: viewport,
              };
              renderPromises.push(page.render(renderContext).promise);
            }
          }
        }
        await Promise.all(renderPromises);
        setStatus({ type: "success", msg: "All pages rendered." });
      } catch (err) {
        console.error(err);
        setStatus({ type: "error", msg: "Failed to render some pages." });
      }
    };

    renderPages();
  }, [pdfDoc, scale]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Eye className="text-accent-orange w-10 h-10" />
            PDF Preview
          </h1>
          <p className="text-lg text-muted">Instantly render all pages of your PDF as high-quality thumbnails.</p>
        </div>

        <div className="bg-surface relative rounded-[22px] p-6 md:p-8 border border-surface-border shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-orange to-accent-yellow rounded-t-[22px]" />

          {!file ? (
            <div className="flex justify-center">
              <DropZone onFilesAdded={handleFilesAdded} multiple={false} accept="application/pdf" className="max-w-2xl" />
            </div>
          ) : (
            <div className="space-y-6">
              <FileListItem file={file} onRemove={() => { setFile(null); setPdfDoc(null); setStatus(null); }} />

              <div className="flex items-center justify-between bg-surface2 rounded-xl p-4 border border-surface-border">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-foreground">
                    {pdfDoc?.numPages || 0} Pages
                  </span>
                  <div className="h-4 w-[1px] bg-surface-border" />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScale(s => Math.max(0.5, s - 0.25))}
                      className="p-2 bg-surface hover:bg-surface-border rounded-lg transition-colors text-muted hover:text-foreground"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
                    <button
                      onClick={() => setScale(s => Math.min(3, s + 0.25))}
                      className="p-2 bg-surface hover:bg-surface-border rounded-lg transition-colors text-muted hover:text-foreground"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <PrimaryBtn variant="secondary" size="sm" onClick={() => { setFile(null); setPdfDoc(null); setStatus(null); }}>
                  Close Preview
                </PrimaryBtn>
              </div>

              {status?.type === "processing" && <StatusBar status={status} />}

              {pdfDoc && (
                <div className="bg-[#1a1a24] rounded-xl p-6 border border-surface-border overflow-y-auto max-h-[70vh]">
                  <div className="flex flex-col items-center gap-8">
                    {Array.from({ length: pdfDoc.numPages }, (_, i) => (
                      <div key={i} className="relative group">
                        <span className="absolute -left-12 top-0 text-xs font-bold text-muted w-8 text-right pt-2 border-t-2 border-transparent group-hover:text-accent-orange transition-colors">
                          {i + 1}
                        </span>
                        <canvas
                          ref={(el) => { canvasRefs.current[i] = el; }}
                          className="bg-white shadow-lg rounded max-w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {status?.type === "processing" && !file && (
            <div className="mt-4">
              <StatusBar status={status} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}