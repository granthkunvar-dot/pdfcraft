import { useState } from "react";
import { PrimaryBtn } from "@/components/ui/PrimaryBtn";
import { Input } from "@/components/ui/Input";
import { Search, Replace } from "lucide-react";

interface FindReplaceProps {
  onFind: (query: string) => void;
  onReplace: (query: string, replacement: string) => void;
  matchCount: number;
}

export function FindReplace({ onFind, onReplace, matchCount }: FindReplaceProps) {
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  const handleFind = () => {
    if (findText.trim()) onFind(findText);
  };

  const handleReplaceAll = () => {
    if (findText.trim()) onReplace(findText, replaceText);
  };

  return (
    <div className="w-full bg-surface border-b border-surface-border p-4 animate-in slide-in-from-top-4 z-30 relative">
      <div className="container mx-auto max-w-4xl flex flex-col md:flex-row items-end gap-4">
        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-bold text-muted uppercase">Find Text</label>
          <div className="flex gap-2">
            <Input 
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFind()}
              placeholder="Text to search..." 
              className="h-10"
            />
            <PrimaryBtn variant="secondary" size="sm" className="h-10 px-4 shrink-0" onClick={handleFind}>
              <Search className="w-4 h-4" />
            </PrimaryBtn>
          </div>
        </div>

        <div className="flex-1 w-full space-y-1">
          <label className="text-xs font-bold text-muted uppercase">Replace With</label>
          <div className="flex gap-2">
            <Input 
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="New text..." 
              className="h-10"
            />
            <PrimaryBtn size="sm" className="h-10 px-4 shrink-0" onClick={handleReplaceAll} disabled={matchCount === 0 || !findText}>
              <Replace className="w-4 h-4 mr-2" />
              Replace All
            </PrimaryBtn>
          </div>
        </div>
      </div>
      
      {matchCount > 0 && (
        <div className="container mx-auto max-w-4xl mt-3">
          <p className="text-xs font-medium text-accent-yellow">
            Found {matchCount} match{matchCount !== 1 ? 'es' : ''} across document
          </p>
        </div>
      )}
    </div>
  );
}
