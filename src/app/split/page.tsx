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
import { ControlGroup } from "@/components/ui/ControlGroup";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { SplitSquareHorizontal } from "lucide-react";
import { isValidPDF, downloadBlob } from "@/lib/pdf";

type SplitMode = "ranges" | "half" | "all";

export default function SplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pageCount, setPageCount] = useState(0);
  
  const [mode, setMode] = useState<SplitMode>("ranges");
  const [rangeStr, setRangeStr] = useState("");
  
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

  const parseRanges = (str: string, maxPages: number): number[] => {
    const indices = new Set<number>();
    const parts = str.split(",").map((p) => p.trim()).filter(Boolean);

    for (const part of parts) {
      if (part.includes("-")) {
        const [startStr, endStr] = part.split("-");
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (isNaN(start) || isNaN(end) || start < 1 || end > maxPages || start > end) {
          throw new Error(`Invalid range: ${part}`);
        }
        for (let i = start; i <= end; i++) {
          indices.add(i - 1);
        }
      } else {
        const page = parseInt(part, 10);
        if (isNaN(page) || page < 1 || page > maxPages) {
          throw new Error(`Invalid page number: ${part}`);
        }
        indices.add(page - 1);
      }
    }
    return Array.from(indices).sort((a, b) => a - b);
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSplit = async () => {
    if (!file || !pdfDoc) return;

    setIsProcessing(true);
    setStatus({ type: "processing", msg: "Processing PDF..." });
    setProgress(10);

    try {
      if (mode === "ranges") {
        if (!rangeStr.trim()) throw new Error("Please enter a page range.");
        
        const indices = parseRanges(rangeStr, pageCount);
        if (indices.length === 0) throw new Error("No valid pages selected.");

        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(pdfDoc, indices);
        pages.forEach((p) => newPdf.addPage(p));
        
        setProgress(70);
        setStatus({ type: "processing", msg: "Saving file..." });
        
        const bytes = await newPdf.save();
        downloadBlob(bytes, `split-extracted-${file.name}`);
      } else if (mode === "half") {
        if (pageCount < 2) throw new Error("Document must have at least 2 pages to split in half.");
        
        const mid = Math.ceil(pageCount / 2);
        
        for (let part = 1; part <= 2; part++) {
          const newPdf = await PDFDocument.create();
          const pStart = part === 1 ? 0 : mid;
          const pEnd = part === 1 ? mid - 1 : pageCount - 1;
          
          const indices = [];
          for (let i = pStart; i <= pEnd; i++) indices.push(i);
          
          const pages = await newPdf.copyPages(pdfDoc, indices);
          pages.forEach((p) => newPdf.addPage(p));
          
          const bytes = await newPdf.save();
          downloadBlob(bytes, `split-part${part}-${file.name}`);
          
          // Small delay to ensure browser downloads both
          await delay(500);
          setProgress(10 + part * 40);
        }
      } else if (mode === "all") {
        for (let i = 0; i < pageCount; i++) {
          setStatus({ type: "processing", msg: `Extracting page ${i + 1} of ${pageCount}...` });
          
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(page);
          
          const bytes = await newPdf.save();
          downloadBlob(bytes, `page-${i + 1}-${file.name}`);
          
          await delay(300); // Prevent browser from blocking mass downloads
          setProgress(10 + Math.floor(((i + 1) / pageCount) * 80));
        }
      }

      setStatus({ type: "success", msg: "PDF split successfully!" });
      setProgress(100);
    } catch (error: any) {
      console.error(error);
      setStatus({ type: "error", msg: error.message || "An unexpected error occurred." });
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
            <SplitSquareHorizontal className="text-accent-orange w-10 h-10" />
            Split PDF
          </h1>
          <p className="text-lg text-muted">Extract page ranges, split in half, or export each page separately.</p>
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
                  <ControlGroup label="Split Mode" description="Choose how to split the PDF.">
                    <Select value={mode} onChange={(e) => setMode(e.target.value as SplitMode)} disabled={isProcessing}>
                      <option value="ranges">Extract Page Ranges</option>
                      <option value="half">Split in Half</option>
                      <option value="all">Export Each Page Separately</option>
                    </Select>
                  </ControlGroup>

                  {mode === "ranges" && (
                    <ControlGroup label="Pages to Extract" description="e.g. 1-3, 5, 8-10">
                      <Input
                        type="text"
                        placeholder="1-5, 8, 11-13"
                        value={rangeStr}
                        onChange={(e) => setRangeStr(e.target.value)}
                        disabled={isProcessing}
                      />
                    </ControlGroup>
                  )}
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
                    onClick={handleSplit}
                    disabled={isProcessing}
                  >
                    <SplitSquareHorizontal className="w-5 h-5 mr-2" />
                    Split PDF
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
