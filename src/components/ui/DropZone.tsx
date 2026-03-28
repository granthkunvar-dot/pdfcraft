import { useCallback, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
  title?: string;
}

export function DropZone({
  onFilesAdded,
  accept = "application/pdf",
  multiple = true,
  className,
  title = "Drag & drop PDF files here, or click to browse",
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFilesAdded(Array.from(e.dataTransfer.files));
      }
    },
    [onFilesAdded]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFilesAdded(Array.from(e.target.files));
      }
    },
    [onFilesAdded]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl transition-all duration-200 group cursor-pointer",
        isDragging
          ? "border-accent-orange bg-accent-orange/5"
          : "border-surface-border bg-surface2 hover:border-accent-orange/50 hover:bg-surface2/80",
        className
      )}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted group-hover:text-accent-orange transition-colors">
        <UploadCloud className="w-10 h-10 mb-3" />
        <p className="mb-2 text-sm font-semibold text-center px-4">
          {title.split("browse").map((text, i, arr) => (
            <span key={i}>
              {text}
              {i < arr.length - 1 && <span className="text-accent-orange">browse</span>}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
