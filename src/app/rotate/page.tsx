"use client";

import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DropZone } from "@/components/ui/DropZone";
import { FileListItem } from "@/components/ui/FileListItem";
import { PrimaryBtn } from "@/components/ui/PrimaryBtn";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBar, StatusState } from "@/components/ui/StatusBar";
import { ControlGroup } from "@/components/ui/ControlGroup";
import { Select } from "@/components/ui/Select";
import { RotateCw } from "lucide-react";
import { isValidPDF, downloadBlob } from "@/lib/pdf";

type RotateMode = "all" | "even" | "odd";
type RotateAngle = "90" | "180" | "270";

export default function RotatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pageCount, setPageCount] = useState(0);
  
  const [mode, setMode] = useState<RotateMode>("all");
  const [angle, setAngle] = useState<RotateAngle>("90");
  
  const [status, setStatus] = useState<StatusState | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesAdded = async (newFiles: File[]) => {
    const selected = newFiles[0];
    if (!selected) return;

    setStatus({ type: "processing", msg: "Reading PDF..." });
    setIsProcessing(true);

    try {
      const arrayBuffer = await selected.arrayBuffer();
      if (!isValidPDF(arrayBuffer)) {
        throw new Error("Invalid PDF file format.");
      }

      const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      setPdfDoc(doc);
      setPageCount(doc.getPageCount());
      setFile(selected);
      setStatus(null);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "error", msg: err.message || "Failed to load PDF." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotate = async () => {
    if (!file || !pdfDoc) return;

    setIsProcessing(true);
    setStatus({ type: "processing", msg: "Rotating pages..." });
    setProgress(20);

    try {
      const pages = pdfDoc.getPages();
      const numAngle = parseInt(angle, 10);

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const isTarget = 
          mode === "all" || 
          (mode === "even" && i % 2 !== 0) || // index 0 is page 1 (odd)
          (mode === "odd" && i % 2 === 0);
          
        if (isTarget) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + numAngle));
        }

        if (i % 10 === 0) {
          setProgress(20 + Math.floor(((i + 1) / pages.length) * 60));
          await new Promise((resolve) => setTimeout(resolve, 10)); // Allow UI to update
        }
      }

      setStatus({ type: "processing", msg: "Saving optimized document..." });
      setProgress(85);

      const bytes = await pdfDoc.save();
      downloadBlob(bytes, `rotated-${file.name}`);

      setStatus({ type: "success", msg: "PDF rotated successfully!" });
      setProgress(100);
    } catch (error: any) {
      console.error(error);
      setStatus({ type: "error", msg: error.message || "An unexpected error occurred during rotation." });
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <RotateCw className="text-accent-orange w-10 h-10" />
            Rotate PDF
          </h1>
          <p className="text-lg text-muted">Rotate specific pages or the entire document instantly.</p>
        </div>

        <div className="bg-surface relative rounded-[22px] p-6 md:p-8 border border-surface-border shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-orange to-accent-yellow rounded-t-[22px]" />
          
          {!file ? (
            <div className="flex justify-center">
              <DropZone onFilesAdded={handleFilesAdded} multiple={false} accept="application/pdf" className="max-w-2xl" />
            </div>
          ) : (
            <div className="space-y-8">
              <FileListItem file={file} onRemove={() => { setFile(null); setPdfDoc(null); setStatus(null); }} />

              <div className="bg-surface2/50 border border-surface-border rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-surface-border">
                  <span className="text-sm font-medium text-foreground">Document info</span>
                  <span className="text-sm font-bold text-accent-orange">{pageCount} Pages</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ControlGroup label="Pages to Rotate" description="Select which pages should be affected.">
                    <Select value={mode} onChange={(e) => setMode(e.target.value as RotateMode)} disabled={isProcessing}>
                      <option value="all">All Pages</option>
                      <option value="even">Even Pages Only (2, 4, 6...)</option>
                      <option value="odd">Odd Pages Only (1, 3, 5...)</option>
                    </Select>
                  </ControlGroup>

                  <ControlGroup label="Rotation Angle" description="Degrees to rotate clockwise.">
                    <Select value={angle} onChange={(e) => setAngle(e.target.value as RotateAngle)} disabled={isProcessing}>
                      <option value="90">90° (Clockwise)</option>
                      <option value="180">180° (Upside Down)</option>
                      <option value="270">270° (Counter-clockwise)</option>
                    </Select>
                  </ControlGroup>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-4">
                {status && <StatusBar status={status} />}
                {isProcessing && <ProgressBar progress={progress} />}
                
                <div className="flex justify-end gap-3 mt-2">
                  <PrimaryBtn
                    variant="secondary"
                    onClick={() => { setFile(null); setPdfDoc(null); setStatus(null); }}
                    disabled={isProcessing}
                  >
                    Cancel
                  </PrimaryBtn>
                  <PrimaryBtn
                    onClick={handleRotate}
                    disabled={isProcessing}
                  >
                    <RotateCw className="w-5 h-5 mr-2" />
                    Rotate PDF
                  </PrimaryBtn>
                </div>
              </div>
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
