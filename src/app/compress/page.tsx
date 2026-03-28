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
import { FileArchive, ArrowRight } from "lucide-react";
import { isValidPDF, downloadBlob } from "@/lib/pdf";

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [fileSize, setFileSize] = useState(0);
  
  const [status, setStatus] = useState<StatusState | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [compressedSize, setCompressedSize] = useState<number | null>(null);

  const handleFilesAdded = async (newFiles: File[]) => {
    const selected = newFiles[0];
    if (!selected) return;

    setStatus({ type: "processing", msg: "Reading PDF..." });
    setIsProcessing(true);
    setCompressedSize(null);

    try {
      const arrayBuffer = await selected.arrayBuffer();
      if (!isValidPDF(arrayBuffer)) {
        throw new Error("Invalid PDF file format.");
      }

      const doc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      setPdfDoc(doc);
      setFile(selected);
      setFileSize(selected.size);
      setStatus(null);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "error", msg: err.message || "Failed to load PDF." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompress = async () => {
    if (!file || !pdfDoc) return;

    setIsProcessing(true);
    setStatus({ type: "processing", msg: "Compressing PDF structure..." });
    setProgress(20);

    try {
      const newPdf = await PDFDocument.create();
      
      setStatus({ type: "processing", msg: "Stripping unused objects and metadata..." });
      setProgress(40);
      
      const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach((p) => newPdf.addPage(p));
      
      newPdf.setTitle("");
      newPdf.setAuthor("");
      newPdf.setSubject("");
      newPdf.setKeywords([]);
      newPdf.setCreator("");
      newPdf.setProducer("");

      setStatus({ type: "processing", msg: "Saving optimized streams..." });
      setProgress(80);

      const bytes = await newPdf.save({ useObjectStreams: true });
      
      setCompressedSize(bytes.length);
      
      downloadBlob(bytes, `compressed-${file.name}`);

      setStatus({ type: "success", msg: "PDF compressed successfully!" });
      setProgress(100);
    } catch (error: any) {
      console.error(error);
      setStatus({ type: "error", msg: error.message || "An unexpected error occurred during compression." });
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <FileArchive className="text-accent-orange w-10 h-10" />
            Compress PDF
          </h1>
          <p className="text-lg text-muted">Reduce file size using object streams and stripping metadata.</p>
        </div>

        <div className="bg-surface relative rounded-[22px] p-6 md:p-8 border border-surface-border shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-orange to-accent-yellow rounded-t-[22px]" />
          
          {!file ? (
            <div className="flex justify-center">
              <DropZone onFilesAdded={handleFilesAdded} multiple={false} accept="application/pdf" className="max-w-2xl" />
            </div>
          ) : (
            <div className="space-y-8">
              <FileListItem file={file} onRemove={() => { setFile(null); setPdfDoc(null); setStatus(null); setCompressedSize(null); }} />

              <div className="bg-surface2/50 border border-surface-border rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
                <span className="text-sm font-medium text-muted">Compression Estimate</span>
                
                <div className="flex items-center justify-center gap-6 w-full max-w-md">
                  <div className="flex flex-col items-center p-4 bg-surface rounded-lg border border-surface-border w-1/3">
                    <span className="text-xs text-muted mb-1">Original Size</span>
                    <span className="font-bold text-white">{formatBytes(fileSize)}</span>
                  </div>
                  
                  <div className="text-muted/50">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                  
                  <div className="flex flex-col items-center p-4 bg-surface rounded-lg border border-accent-orange/30 w-1/3">
                    <span className="text-xs text-muted mb-1">New Size</span>
                    <span className="font-bold text-success">
                      {compressedSize ? formatBytes(compressedSize) : "??? MB"}
                    </span>
                  </div>
                </div>
                
                {compressedSize && (
                  <p className="text-sm text-accent-yellow font-medium mt-4">
                    Saved {formatBytes(fileSize - compressedSize)} ({Math.round((1 - compressedSize / fileSize) * 100)}%)
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-4">
                {status && <StatusBar status={status} />}
                {isProcessing && <ProgressBar progress={progress} />}
                
                <div className="flex justify-end gap-3 mt-2">
                  <PrimaryBtn
                    variant="secondary"
                    onClick={() => { setFile(null); setPdfDoc(null); setStatus(null); setCompressedSize(null); }}
                    disabled={isProcessing}
                  >
                    Cancel
                  </PrimaryBtn>
                  <PrimaryBtn
                    onClick={handleCompress}
                    disabled={isProcessing || compressedSize !== null}
                  >
                    <FileArchive className="w-5 h-5 mr-2" />
                    Compress PDF
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
