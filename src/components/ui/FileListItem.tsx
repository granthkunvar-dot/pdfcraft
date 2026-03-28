import { File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileListItemProps {
  file: File;
  onRemove?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  className?: string;
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function FileListItem({ file, onRemove, onMoveUp, onMoveDown, className }: FileListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-xl bg-surface2 border border-surface-border group",
        className
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="p-2 rounded-lg bg-surface shrink-0 text-muted group-hover:text-accent-orange transition-colors">
          <File className="w-5 h-5" />
        </div>
        <div className="flex flex-col truncate">
          <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
          <span className="text-xs text-muted">{formatBytes(file.size)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {onMoveUp && (
          <button onClick={onMoveUp} className="p-1 text-muted hover:text-foreground transition-colors" title="Move Up"><span className="text-xs">▲</span></button>
        )}
        {onMoveDown && (
          <button onClick={onMoveDown} className="p-1 text-muted hover:text-foreground transition-colors" title="Move Down"><span className="text-xs">▼</span></button>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-2 ml-1 text-muted hover:text-red-400 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-red-400 rounded-md"
            type="button"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
