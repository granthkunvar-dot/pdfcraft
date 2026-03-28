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
import { Image as ImageIcon } from "lucide-react";
import { downloadBlob } from "@/lib/pdf";

type PageSize = "a4" | "letter" | "fit";
type Orientation = "portrait" | "landscape";
type Margin = "none" | "small" | "large";

export default function ImageToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState<Margin>("small");
  
  const [status, setStatus] = useState<StatusState | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesAdded = (newFiles: File[]) => {
    // Only accept basic image formats
    const valid = newFiles.filter(f => f.type.startsWith("image/"));
    if (valid.length < newFiles.length) {
      setStatus({ type: "error", msg: "Some files were skipped because they are not images." });
    } else {
      setStatus(null);
    }
    setFiles((prev) => [...prev, ...valid]);
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

  const ensurePngFormat = async (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas not supported"));
          // Fill white bg in case of transparent webp/png converting to jpeg bounds?
          // We'll export to PNG so transparency is preserved.
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error("Blob creation failed"));
            blob.arrayBuffer().then(resolve).catch(reject);
          }, "image/png");
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${file.name}`));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsDataURL(file);
    });
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setStatus({ type: "processing", msg: "Converting images to PDF..." });
    setProgress(10);

    try {
      const pdfDoc = await PDFDocument.create();
      
      const marginMap = { none: 0, small: 20, large: 50 };
      const marginPt = marginMap[margin];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        let imgBuffer = await file.arrayBuffer();
        let pdfImage;
        
        // Embed image to PDF-Lib
        if (file.type === "image/jpeg") {
          pdfImage = await pdfDoc.embedJpg(imgBuffer);
        } else if (file.type === "image/png") {
          pdfImage = await pdfDoc.embedPng(imgBuffer);
        } else {
          // WebP or other formats -> Convert to PNG via Canvas first
          setStatus({ type: "processing", msg: `Converting ${file.name} format...` });
          imgBuffer = await ensurePngFormat(file);
          pdfImage = await pdfDoc.embedPng(imgBuffer);
        }

        const imgWidth = pdfImage.width;
        const imgHeight = pdfImage.height;

        let pgWidth = 595.28; // A4
        let pgHeight = 841.89;

        if (pageSize === "letter") {
          pgWidth = 612;
          pgHeight = 792;
        }

        if (orientation === "landscape" && pageSize !== "fit") {
          [pgWidth, pgHeight] = [pgHeight, pgWidth];
        }

        if (pageSize === "fit") {
          pgWidth = imgWidth + marginPt * 2;
          pgHeight = imgHeight + marginPt * 2;
        }

        const page = pdfDoc.addPage([pgWidth, pgHeight]);

        // Calculate scaling to fit image within the page (minus margins)
        const maxDrawWidth = pgWidth - marginPt * 2;
        const maxDrawHeight = pgHeight - marginPt * 2;
        
        const scale = Math.min(maxDrawWidth / imgWidth, maxDrawHeight / imgHeight);
        
        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;
        
        // Center the image
        const x = (pgWidth - drawWidth) / 2;
        const y = (pgHeight - drawHeight) / 2;

        page.drawImage(pdfImage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });

        setProgress(10 + Math.floor(((i + 1) / files.length) * 80));
      }

      setStatus({ type: "processing", msg: "Saving PDF..." });
      setProgress(95);

      const bytes = await pdfDoc.save();
      downloadBlob(bytes, `pdfcraft-images.pdf`);

      setStatus({ type: "success", msg: "Images converted to PDF successfully!" });
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
            <ImageIcon className="text-accent-orange w-10 h-10" />
            Image to PDF
          </h1>
          <p className="text-lg text-muted">Convert JPG, PNG, and WebP images into a single PDF document.</p>
        </div>

        <div className="bg-surface relative rounded-[22px] p-6 md:p-8 border border-surface-border shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-orange to-accent-yellow rounded-t-[22px]" />
          
          <DropZone 
            onFilesAdded={handleFilesAdded} 
            multiple={true} 
            accept="image/jpeg, image/png, image/webp" 
            title="Drag & drop images here, or click to browse"
          />

          {files.length > 0 && (
            <div className="mt-8 space-y-6">
              <div className="bg-surface2/50 border border-surface-border rounded-xl p-6 space-y-6">
                <span className="text-sm font-medium text-foreground pb-2 border-b border-surface-border block">
                  Page Settings
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <ControlGroup label="Page Size">
                    <Select value={pageSize} onChange={(e) => setPageSize(e.target.value as PageSize)} disabled={isProcessing}>
                      <option value="a4">A4</option>
                      <option value="letter">US Letter</option>
                      <option value="fit">Fit to Image</option>
                    </Select>
                  </ControlGroup>
                  <ControlGroup label="Orientation">
                    <Select value={orientation} onChange={(e) => setOrientation(e.target.value as Orientation)} disabled={isProcessing || pageSize === "fit"}>
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </Select>
                  </ControlGroup>
                  <ControlGroup label="Margin">
                    <Select value={margin} onChange={(e) => setMargin(e.target.value as Margin)} disabled={isProcessing}>
                      <option value="none">No Margin</option>
                      <option value="small">Small (20pt)</option>
                      <option value="large">Large (50pt)</option>
                    </Select>
                  </ControlGroup>
                </div>
              </div>

              <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Images to Convert</h3>
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
                  onClick={handleConvert}
                  disabled={isProcessing || files.length === 0}
                  className="w-full sm:w-auto self-end mt-2"
                >
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Convert to PDF
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
