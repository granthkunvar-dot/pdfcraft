"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DropZone } from "@/components/ui/DropZone";
import { FileListItem } from "@/components/ui/FileListItem";
import { PrimaryBtn } from "@/components/ui/PrimaryBtn";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBar, StatusState } from "@/components/ui/StatusBar";
import { ControlGroup } from "@/components/ui/ControlGroup";
import { Input } from "@/components/ui/Input";
import { Type } from "lucide-react";
import { isValidPDF, downloadBlob } from "@/lib/pdf";

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [pageCount, setPageCount] = useState(0);
  
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState("0.3");
  const [fontSize, setFontSize] = useState("72");
  const [colorHex, setColorHex] = useState("#ff6b35");
  
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

  const hexToRgb = (hex: string) => {
    const sanitized = hex.replace("#", "");
    const r = parseInt(sanitized.substring(0, 2), 16) / 255;
    const g = parseInt(sanitized.substring(2, 4), 16) / 255;
    const b = parseInt(sanitized.substring(4, 6), 16) / 255;
    return rgb(r, g, b);
  };

  const handleWatermark = async () => {
    if (!file || !pdfDoc) return;
    if (!text.trim()) {
      setStatus({ type: "error", msg: "Watermark text cannot be empty." });
      return;
    }

    setIsProcessing(true);
    setStatus({ type: "processing", msg: "Applying watermark..." });
    setProgress(20);

    try {
      const numFontSize = parseInt(fontSize, 10) || 72;
      const numOpacity = parseFloat(opacity) || 0.3;
      const color = hexToRgb(colorHex);
      
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const textWidth = font.widthOfTextAtSize(text, numFontSize);
      const textHeight = font.heightAtSize(numFontSize);

      const pages = pdfDoc.getPages();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        // Approximate center for 45 deg rotation
        const rad = Math.PI / 4;
        const x = width / 2 - (textWidth / 2) * Math.cos(rad) + (textHeight / 2) * Math.sin(rad);
        const y = height / 2 - (textWidth / 2) * Math.sin(rad) - (textHeight / 2) * Math.cos(rad);

        page.drawText(text, {
          x,
          y,
          size: numFontSize,
          font,
          color,
          opacity: numOpacity,
          rotate: degrees(45),
        });

        if (i % 10 === 0) {
          setProgress(20 + Math.floor(((i + 1) / pages.length) * 60));
          await new Promise((resolve) => setTimeout(resolve, 5)); // Allow UI to update
        }
      }

      setStatus({ type: "processing", msg: "Saving watermarked document..." });
      setProgress(85);

      const bytes = await pdfDoc.save();
      downloadBlob(bytes, `watermarked-${file.name}`);

      setStatus({ type: "success", msg: "Watermark applied successfully!" });
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
            <Type className="text-accent-orange w-10 h-10" />
            Watermark PDF
          </h1>
          <p className="text-lg text-muted">Add a custom diagonal text watermark to all pages.</p>
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
                  <ControlGroup label="Watermark Text" description="Text to stamp on each page.">
                    <Input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      disabled={isProcessing}
                      placeholder="e.g. CONFIDENTIAL"
                    />
                  </ControlGroup>

                  <ControlGroup label="Color" description="Pick a color for the watermark.">
                    <div className="flex items-center gap-4 h-12 w-full rounded-xl border border-surface-border bg-surface2 px-4 py-2 opacity-100 disabled:opacity-50">
                      <input
                        type="color"
                        value={colorHex}
                        onChange={(e) => setColorHex(e.target.value)}
                        disabled={isProcessing}
                        className="w-8 h-8 rounded shrink-0 cursor-pointer overflow-hidden bg-transparent border-none p-0"
                      />
                      <span className="text-sm text-foreground font-mono uppercase tracking-wider">{colorHex}</span>
                    </div>
                  </ControlGroup>

                  <ControlGroup label="Opacity" description={`Current: ${Math.round(parseFloat(opacity) * 100)}%`}>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => setOpacity(e.target.value)}
                      disabled={isProcessing}
                      className="w-full h-2 mt-4 bg-surface-border rounded-lg appearance-none cursor-pointer accent-accent-orange"
                    />
                  </ControlGroup>

                  <ControlGroup label="Font Size" description={`Size: ${fontSize}px`}>
                    <input
                      type="range"
                      min="12"
                      max="200"
                      step="4"
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      disabled={isProcessing}
                      className="w-full h-2 mt-4 bg-surface-border rounded-lg appearance-none cursor-pointer accent-accent-orange"
                    />
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
                    onClick={handleWatermark}
                    disabled={isProcessing || !text.trim()}
                  >
                    <Type className="w-5 h-5 mr-2" />
                    Add Watermark
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
