"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DropZone } from "@/components/ui/DropZone";
import { FileListItem } from "@/components/ui/FileListItem";
import { PrimaryBtn } from "@/components/ui/PrimaryBtn";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBar, StatusState } from "@/components/ui/StatusBar";
import { FileUp } from "lucide-react";
import { isValidPDF, downloadBlob } from "@/lib/pdf";

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<StatusState | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesAdded = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setStatus(null);
  };

  const handleRemove = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (files.length <= 1) setStatus(null);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const copy = [...prev];
      [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
      return copy;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setStatus({ type: "error", msg: "Please add at least 2 PDF files to merge." });
      return;
    }

    setIsProcessing(true);
    setStatus({ type: "processing", msg: "Merging PDFs..." });
    setProgress(10);

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        
        if (!isValidPDF(arrayBuffer)) {
          throw new Error(`File "${file.name}" is not a valid PDF file (missing %PDF header).`);
        }

        let pdf: PDFDocument;
        try {
          pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        } catch (err: any) {
          throw new Error(`Failed to read "${file.name}". It might be corrupted or heavily encrypted.`);
        }

        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
        
        setProgress(10 + Math.floor(((i + 1) / files.length) * 80));
      }

      setStatus({ type: "processing", msg: "Saving merged document..." });
      setProgress(95);

      const mergedPdfBytes = await mergedPdf.save();
      downloadBlob(mergedPdfBytes, "pdfcraft-merged.pdf");

      setStatus({ type: "success", msg: "PDFs merged successfully!" });
      setProgress(100);
    } catch (error: any) {
      console.error(error);
      setStatus({ type: "error", msg: error.message || "An unexpected error occurred while merging." });
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
            <FileUp className="text-accent-orange w-10 h-10" />
            Merge PDF
          </h1>
          <p className="text-lg text-muted">Combine multiple PDF files into one, in the exact order you want.</p>
        </div>

        <div className="bg-surface relative rounded-[22px] p-6 md:p-8 border border-surface-border shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-orange to-accent-yellow rounded-t-[22px]" />
          
          <DropZone onFilesAdded={handleFilesAdded} multiple={true} accept="application/pdf" />

          {files.length > 0 && (
            <div className="mt-8 space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Files to Merge</h3>
              <div className="space-y-2">
                {files.map((file, i) => (
                  <FileListItem
                    key={`${file.name}-${i}`}
                    file={file}
                    onRemove={() => handleRemove(i)}
                    onMoveUp={i > 0 ? () => handleMoveUp(i) : undefined}
                    onMoveDown={i < files.length - 1 ? () => handleMoveDown(i) : undefined}
                  />
                ))}
              </div>

              <div className="pt-6 flex flex-col gap-4 border-t border-surface-border">
                {status && <StatusBar status={status} />}
                {isProcessing && <ProgressBar progress={progress} />}
                
                <PrimaryBtn
                  onClick={handleMerge}
                  disabled={isProcessing || files.length < 2}
                  className="w-full sm:w-auto self-end mt-2"
                >
                  <FileUp className="w-5 h-5 mr-2" />
                  Merge PDFs
                </PrimaryBtn>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
