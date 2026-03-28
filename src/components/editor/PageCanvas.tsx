import { useEffect, useRef, useState } from "react";
import { EditTool, PageEdit, BoxEdit } from "@/lib/editPdf";
import { TextBoxOverlay } from "./TextBoxOverlay";

interface PageCanvasProps {
  pageIndex: number;
  pdfDoc: any; // PDFDocumentProxy
  scale: number;
  activeTool: EditTool;
  edits: PageEdit[];
  onAddEdit: (edit: PageEdit) => void;
  onUpdateEdit: (id: string, updates: Partial<PageEdit>) => void;
  onRemoveEdit: (id: string) => void;
}

export function PageCanvas({
  pageIndex,
  pdfDoc,
  scale,
  activeTool,
  edits,
  onAddEdit,
  onUpdateEdit,
  onRemoveEdit,
}: PageCanvasProps) {
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const interactRef = useRef<HTMLDivElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const renderPage = async () => {
      if (!baseCanvasRef.current || !pdfDoc) return;
      try {
        const page = await pdfDoc.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale });
        const canvas = baseCanvasRef.current;
        const context = canvas.getContext("2d");
        
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          if (drawCanvasRef.current) {
            drawCanvasRef.current.height = viewport.height;
            drawCanvasRef.current.width = viewport.width;
          }
          if (interactRef.current) {
            interactRef.current.style.width = `${viewport.width}px`;
            interactRef.current.style.height = `${viewport.height}px`;
          }

          await page.render({ canvasContext: context, viewport }).promise;
        }
      } catch (err) {
        console.error(err);
      }
    };
    renderPage();
  }, [pageIndex, pdfDoc, scale]);

  useEffect(() => {
    if (!drawCanvasRef.current) return;
    const ctx = drawCanvasRef.current.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);
    
    edits.forEach((edit) => {
      if (edit.type === "draw") {
        ctx.beginPath();
        ctx.strokeStyle = edit.colorHex;
        ctx.lineWidth = edit.strokeWidth * scale; 
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        edit.points.forEach((p, i) => {
          const x = (p.x / edit.canvasWidth) * drawCanvasRef.current!.width;
          const y = (p.y / edit.canvasHeight) * drawCanvasRef.current!.height;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    });

    if (isDrawing && currentPath.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = "#ff6b35"; 
      ctx.lineWidth = 3 * scale;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      currentPath.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }
  }, [edits, isDrawing, currentPath, scale]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactRef.current || !drawCanvasRef.current) return;
    const rect = interactRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === "text") {
      onAddEdit({
        id: Math.random().toString(36).substring(7),
        pageIndex,
        type: "text",
        x: x / scale, 
        y: y / scale,
        width: 150,
        height: 50,
        text: "",
        fontSize: 16,
        colorHex: "#000000"
      });
    } else if (activeTool === "draw") {
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !interactRef.current) return;
    const rect = interactRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPath((prev) => [...prev, { x, y }]);
  };

  const handlePointerUp = () => {
    if (isDrawing && drawCanvasRef.current) {
      if (currentPath.length > 1) {
        onAddEdit({
          id: Math.random().toString(36).substring(7),
          pageIndex,
          type: "draw",
          points: currentPath,
          strokeWidth: 3,
          colorHex: "#ff6b35",
          canvasWidth: drawCanvasRef.current.width,
          canvasHeight: drawCanvasRef.current.height
        });
      }
      setIsDrawing(false);
      setCurrentPath([]);
    }
  };

  return (
    <div className="relative mb-8 bg-white shadow-xl shadow-black/20 shrink-0">
      <canvas ref={baseCanvasRef} className="absolute inset-0 z-0" />
      <canvas ref={drawCanvasRef} className="absolute inset-0 z-10 pointer-events-none" />
      
      <div 
        ref={interactRef} 
        className="relative z-20 cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {edits.map((edit) => {
          if (edit.type === "text" || edit.type === "highlight" || edit.type === "shape") {
            return (
              <TextBoxOverlay 
                key={edit.id} 
                edit={edit as BoxEdit} 
                scale={scale} 
                onUpdate={onUpdateEdit} 
                onRemove={onRemoveEdit} 
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
