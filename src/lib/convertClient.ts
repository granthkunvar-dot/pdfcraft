import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";
import * as pdfjsLib from "pdfjs-dist";
import { downloadBlob } from "./pdf";

// Ensure worker is set for internal functions
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export const convertTxtToPdf = async (file: File): Promise<Uint8Array> => {
  const text = await file.text();
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  
  const fontSize = 12;
  const padding = 50;
  let y = height - padding;
  
  const lines = text.split("\n");
  for (const line of lines) {
    if (y < padding) {
      page = pdfDoc.addPage();
      y = height - padding;
    }
    page.drawText(line, { x: padding, y, size: fontSize, font });
    y -= fontSize * 1.5;
  }
  
  return await pdfDoc.save();
};

export const convertPdfToImagesZip = async (file: File): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  const task = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await task.promise;
  
  const zip = new JSZip();
  
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // High quality
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({ canvasContext: ctx, viewport }).promise;
    
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (blob) {
      zip.file(`page-${i}.jpg`, blob);
    }
  }
  
  return await zip.generateAsync({ type: "blob" });
};

export const convertPdfToTxt = async (file: File): Promise<Blob> => {
  const arrayBuffer = await file.arrayBuffer();
  const task = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await task.promise;
  
  let fullText = "";
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item: any) => item.str);
    fullText += strings.join(" ") + "\n\n";
  }
  
  return new Blob([fullText], { type: "text/plain" });
};
