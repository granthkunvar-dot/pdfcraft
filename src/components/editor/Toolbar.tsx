import { EditTool } from "@/lib/editPdf";
import { MousePointer2, Type, Highlighter, Pen, Image as ImageIcon, Square, Search, ZoomIn, ZoomOut, Save, Undo2, Redo2 } from "lucide-react";
import { PrimaryBtn } from "@/components/ui/PrimaryBtn";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  activeTool: EditTool;
  setActiveTool: (tool: EditTool) => void;
  scale: number;
  setScale: (scale: number | ((s: number) => number)) => void;
  onSave: () => void;
  isProcessing: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function Toolbar({ activeTool, setActiveTool, scale, setScale, onSave, isProcessing, onUndo, onRedo, canUndo, canRedo }: ToolbarProps) {
  const tools: { id: EditTool; icon: any; label: string }[] = [
    { id: "select", icon: MousePointer2, label: "Select" },
    { id: "text", icon: Type, label: "Text Box" },
    { id: "highlight", icon: Highlighter, label: "Highlight" },
    { id: "draw", icon: Pen, label: "Draw" },
    { id: "image", icon: ImageIcon, label: "Image" },
    { id: "shape", icon: Square, label: "Shape" },
    { id: "find", icon: Search, label: "Find & Replace" },
  ];

  return (
    <div className="sticky top-[64px] z-40 w-full bg-surface2 border-b border-surface-border p-2 flex items-center justify-between">
      <div className="flex items-center gap-1 overflow-x-auto">
        <div className="flex items-center gap-1 mr-2 px-2 border-r border-surface-border">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={cn(
              "p-2 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0",
              canUndo ? "text-muted hover:text-white hover:bg-surface active:bg-accent-orange" : "text-muted opacity-35 cursor-not-allowed"
            )}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={cn(
              "p-2 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0",
              canRedo ? "text-muted hover:text-white hover:bg-surface active:bg-accent-orange" : "text-muted opacity-35 cursor-not-allowed"
            )}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-5 h-5" />
          </button>
        </div>

        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTool(t.id)}
            className={cn(
              "p-2 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0",
              activeTool === t.id 
                ? "bg-accent-orange text-white" 
                : "text-muted hover:text-foreground hover:bg-surface"
            )}
            title={t.label}
          >
            <t.icon className="w-5 h-5" />
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-2 bg-surface p-1 rounded-lg border border-surface-border">
          <button onClick={() => setScale(s => Math.max(0.5, (s as number) - 0.25))} className="p-1 text-muted hover:text-foreground"><ZoomOut className="w-4 h-4" /></button>
          <span className="text-xs font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, (s as number) + 0.25))} className="p-1 text-muted hover:text-foreground"><ZoomIn className="w-4 h-4" /></button>
        </div>
        
        <PrimaryBtn size="sm" onClick={onSave} disabled={isProcessing} className="h-10 px-4 text-sm">
          <Save className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Save & Download</span>
          <span className="sm:hidden">Save</span>
        </PrimaryBtn>
      </div>
    </div>
  );
}
