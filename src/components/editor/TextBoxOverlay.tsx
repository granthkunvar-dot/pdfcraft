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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!edit.text) {
      setIsEditing(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [edit.text]);

  return (
    <div
      className="absolute border border-transparent hover:border-surface-border transition-colors pointer-events-auto"
      style={{
        left: edit.x * scale,
        top: edit.y * scale,
        borderColor: isEditing ? "#ff6b35" : "",
      }}
    >
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
        value={edit.text || ""}
        onChange={(e) => onUpdate(edit.id, { text: e.target.value })}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        className="bg-transparent outline-none resize-none overflow-hidden placeholder:text-muted/50 w-full h-full min-w-[200px]"
        style={{
          fontSize: (edit.fontSize || 16) * scale,
          color: edit.colorHex || "#ffffff",
          fontFamily: edit.fontFamily || "Helvetica, sans-serif",
          lineHeight: 1.2,
        }}
        placeholder="Type here..."
      />
    </div>
  );
}
