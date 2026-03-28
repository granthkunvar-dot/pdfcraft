import { useState, useRef, useEffect } from "react";
import { BoxEdit } from "@/lib/editPdf";
import { X } from "lucide-react";

interface TextBoxProps {
  edit: BoxEdit;
  scale: number;
  onUpdate: (id: string, updates: Partial<BoxEdit>) => void;
  onRemove: (id: string) => void;
}

export function TextBoxOverlay({ edit, scale, onUpdate, onRemove }: TextBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(edit.text || "");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalText(edit.text || "");
  }, [edit.text]);

  useEffect(() => {
    if (!edit.text && localText === "") {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBlur = () => {
    setIsEditing(false);
    if (localText !== edit.text) {
      onUpdate(edit.id, { text: localText });
    }
  };

  return (
    <div
      className="absolute border border-transparent hover:border-surface-border transition-colors pointer-events-auto flex flex-col items-start gap-1"
      style={{
        left: edit.x * scale,
        top: edit.y * scale,
        borderColor: isEditing ? "#ff6b35" : "",
      }}
    >
      <div className="relative">
        {isEditing && (
          <button 
            onClick={() => onRemove(edit.id)} 
            className="absolute -top-8 -right-4 p-1.5 bg-surface rounded-full text-foreground border border-surface-border shadow-lg hover:text-red-400 z-50"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <textarea
          ref={inputRef}
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={handleBlur}
          className="bg-transparent outline-none resize-none overflow-hidden placeholder:text-muted/50 w-full min-w-[200px]"
          style={{
            fontSize: (edit.fontSize || 16) * scale,
            color: edit.colorHex || "#ffffff",
            fontFamily: edit.fontFamily || "Helvetica, sans-serif",
            fontWeight: edit.fontWeight || "normal",
            fontStyle: edit.fontStyle || "normal",
            lineHeight: 1.2,
            height: Math.max(30 * scale, ((edit.fontSize || 16) * scale * 1.5))
          }}
          placeholder="Type here..."
        />
      </div>
      
      {isEditing && edit.detectedFontName && (
        <div className="absolute top-full left-0 mt-1 bg-[#ff6b35]/10 border border-[#ff6b35]/30 text-[#ff6b35] text-[0.7rem] px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm pointer-events-none">
          {edit.detectedFontName}
        </div>
      )}
    </div>
  );
}
