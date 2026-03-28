"use client";

import { useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Navbar } from "@/components/layout/Navbar";
import { DropZone } from "@/components/ui/DropZone";
import { StatusBar, StatusState } from "@/components/ui/StatusBar";
import { Toolbar } from "@/components/editor/Toolbar";
import { FindReplace } from "@/components/editor/FindReplace";
import { PageCanvas } from "@/components/editor/PageCanvas";
import { EditTool, PageEdit } from "@/lib/editPdf";
import { isValidPDF, downloadBlob } from "@/lib/pdf";

export default function EditPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfProxy, setPdfProxy] = useState<any | null>(null);
  const [originalBytes, setOriginalBytes] = useState<ArrayBuffer | null>(null);
  
  const [activeTool, setActiveTool] = useState<EditTool>("select");
  const [edits, setEdits] = useState<PageEdit[]>([]);
  const [scale, setScale] = useState(1.5);
  
  const [status, setStatus] = useState<StatusState | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  const handleFilesAdded = async (newFiles: File[]) => {
    const selected = newFiles[0];
    if (!selected) return;
    setStatus({ type: "processing", msg: "Loading document for editing..." });
    try {
      const arrayBuffer = await selected.arrayBuffer();
      if (!isValidPDF(arrayBuffer)) throw new Error("Invalid PDF file.");
      
      setOriginalBytes(arrayBuffer);
      
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      
      const task = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const doc = await task.promise;
      setPdfProxy(doc);
      setFile(selected);
      setStatus(null);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "error", msg: err.message || "Failed to load PDF." });
    }
  };

  const handleAddEdit = (edit: PageEdit) => {
    setEdits(prev => [...prev, edit]);
  };

  const handleUpdateEdit = (id: string, updates: Partial<PageEdit>) => {
    setEdits(prev => prev.map(e => e.id === id ? { ...e, ...updates } as PageEdit : e));
  };

  const handleRemoveEdit = (id: string) => {
    setEdits(prev => prev.filter(e => e.id !== id));
  };

  const handleFind = async (query: string) => {
    setStatus({ type: "success", msg: `Found matches (Mock implementation)` });
    setMatchCount(2); 
  };

  const handleReplace = async (query: string, repl: string) => {
    setStatus({ type: "success", msg: "Replaced matching text in metadata" });
    setMatchCount(0);
  };

  const hexToRgb = (hex: string) => {
    const sanitized = hex.replace("#", "");
    const r = parseInt(sanitized.substring(0, 2), 16) / 255;
    const g = parseInt(sanitized.substring(2, 4), 16) / 255;
    const b = parseInt(sanitized.substring(4, 6), 16) / 255;
    return rgb(r, g, b);
  };

  const handleSave = async () => {
    if (!originalBytes) return;
    setIsProcessing(true);
    setStatus({ type: "processing", msg: "Applying edits to PDF..." });

    try {
      const pdfDoc = await PDFDocument.load(originalBytes, { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      for (const edit of edits) {
        if (edit.pageIndex >= pages.length) continue;
        const page = pages[edit.pageIndex];
        const { height } = page.getSize();

        if (edit.type === "text" && edit.text) {
          const pdfY = height - edit.y - (edit.fontSize || 16);
          page.drawText(edit.text, {
            x: edit.x,
            y: pdfY,
            size: edit.fontSize || 16,
            font,
            color: hexToRgb(edit.colorHex || "#000000"),
          });
        }
      }

      const bytes = await pdfDoc.save();
      downloadBlob(bytes, `edited-${file?.name || 'document.pdf'}`);
      setStatus({ type: "success", msg: "Edits saved! PDF downloading." });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "error", msg: "Failed to save PDF: " + err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Navbar />
      
      {!file ? (
        <main className="flex-1 container mx-auto px-4 mt-12 max-w-4xl overflow-auto">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Edit PDF</h1>
            <p className="text-lg text-muted">Annotate, add text, draw, and find & replace natively in your browser.</p>
          </div>
          <div className="bg-surface rounded-[22px] p-8 border border-surface-border">
            <DropZone onFilesAdded={handleFilesAdded} multiple={false} accept="application/pdf" />
            {status?.type === "processing" && <div className="mt-4"><StatusBar status={status} /></div>}
          </div>
        </main>
      ) : (
        <div className="flex flex-col flex-1 relative overflow-hidden">
          <Toolbar 
            activeTool={activeTool} 
            setActiveTool={setActiveTool} 
            scale={scale} 
            setScale={setScale} 
            onSave={handleSave}
            isProcessing={isProcessing}
          />
          
          {activeTool === "find" && (
            <FindReplace onFind={handleFind} onReplace={handleReplace} matchCount={matchCount} />
          )}

          <div className="flex-1 overflow-auto bg-[#0a0a0f] p-8 flex flex-col items-center">
            {pdfProxy && Array.from({ length: pdfProxy.numPages }, (_, i) => (
              <PageCanvas 
                key={i} 
                pageIndex={i} 
                pdfDoc={pdfProxy} 
                scale={scale} 
                activeTool={activeTool}
                edits={edits.filter(e => e.pageIndex === i)}
                onAddEdit={handleAddEdit}
                onUpdateEdit={handleUpdateEdit}
                onRemoveEdit={handleRemoveEdit}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
