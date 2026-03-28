"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DropZone } from "@/components/ui/DropZone";
import { FileListItem } from "@/components/ui/FileListItem";
import { PrimaryBtn } from "@/components/ui/PrimaryBtn";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBar, StatusState } from "@/components/ui/StatusBar";
import { Select } from "@/components/ui/Select";
import { ArrowRightLeft } from "lucide-react";
// import convert handlers later

const INPUT_FORMATS = {
  pdf: ["jpg", "png", "docx", "txt", "zip"],
  jpg: ["pdf"],
  png: ["pdf"],
  webp: ["pdf"],
  docx: ["pdf"],
  txt: ["pdf"],
  html: ["pdf"],
  xlsx: ["pdf"],
  csv: ["pdf"],
};

export default function ConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [inputExt, setInputExt] = useState<string>("pdf");
  const [outputExt, setOutputExt] = useState<string>("docx");
  
  const [status, setStatus] = useState<StatusState | null>(null);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedName, setConvertedName] = useState<string>("");

  const handleFilesAdded = (newFiles: File[]) => {
    const selected = newFiles[0];
    if (!selected) return;

    const extMatch = selected.name.match(/\.([a-zA-Z0-9]+)$/);
    let ext = extMatch ? extMatch[1].toLowerCase() : "";
    
    if (ext === "jpeg") ext = "jpg";
    
    if (!(ext in INPUT_FORMATS)) {
      setStatus({ type: "error", msg: `Unsupported input format: .${ext}. Try PDF, DOCX, JPG, PNG, HTML...` });
      return;
    }

    setFile(selected);
    setInputExt(ext);
    setOutputExt((INPUT_FORMATS as any)[ext][0]);
    setStatus(null);
    setConvertedUrl(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setStatus({ type: "processing", msg: `Converting ${inputExt.toUpperCase()} to ${outputExt.toUpperCase()}...` });
    setProgress(10);
    setConvertedUrl(null);

    try {
      // Client-side execution simulation
      await new Promise(r => setTimeout(r, 1000));
      setProgress(50);
      await new Promise(r => setTimeout(r, 1000));
      
      setStatus({ type: "success", msg: "Conversion complete!" });
      setProgress(100);
      setConvertedName(`converted-${file.name.split('.')[0]}.${outputExt}`);
      
      // Mock Blob
      const blob = new Blob(["Mock converted content"], { type: "text/plain" });
      setConvertedUrl(URL.createObjectURL(blob));
      
    } catch (err: any) {
      console.error(err);
      setStatus({ type: "error", msg: err.message || "Conversion failed." });
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <ArrowRightLeft className="text-accent-orange w-10 h-10" />
            Document Converter
          </h1>
          <p className="text-lg text-muted">Convert documents instantly. PDF to Word, Images to PDF, and more.</p>
        </div>

        <div className="bg-surface relative rounded-[22px] p-6 md:p-10 border border-surface-border shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent-orange to-accent-yellow rounded-t-[22px]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 items-center">
            {/* LEFT PANEL */}
            <div className="flex flex-col h-full space-y-4">
              <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Convert FROM</h3>
              <div className="flex-1 bg-surface2/50 border border-surface-border rounded-xl p-6 min-h-[250px] flex flex-col justify-center">
                {!file ? (
                  <DropZone onFilesAdded={handleFilesAdded} multiple={false} accept="*/*" title="Drop any supported file here" />
                ) : (
                  <div className="space-y-4">
                    <FileListItem file={file} onRemove={() => { setFile(null); setStatus(null); setConvertedUrl(null); }} />
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-surface-border text-foreground font-bold text-xs uppercase rounded-md">
                        .{inputExt} format detected
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CENTER ARROW */}
            <div className="flex justify-center flex-shrink-0 lg:rotate-0 rotate-90 my-4 lg:my-0 text-muted/50">
              <ArrowRightLeft className="w-10 h-10" />
            </div>

            {/* RIGHT PANEL */}
            <div className="flex flex-col h-full space-y-4">
              <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Convert TO</h3>
              <div className="flex-1 bg-surface2/50 border border-surface-border rounded-xl p-6 min-h-[250px] flex flex-col justify-center">
                <Select 
                  value={outputExt}
                  onChange={(e) => setOutputExt(e.target.value)}
                  disabled={!file || isProcessing}
                  className="h-16 text-lg"
                >
                  {!file ? (
                    <option value="" disabled>Waiting for input file...</option>
                  ) : (
                    (INPUT_FORMATS as any)[inputExt]?.map((opt: string) => (
                      <option key={opt} value={opt}>.{opt.toUpperCase()}</option>
                    ))
                  )}
                </Select>
                
                <p className="mt-8 text-sm text-muted text-center">
                  {outputExt === "docx" ? "Runs securely via API route" : "Runs securely inside your browser"}
                </p>
              </div>
            </div>
          </div>

          {(file || status) && (
            <div className="mt-10 pt-8 border-t border-surface-border flex flex-col gap-4">
              {status && <StatusBar status={status} />}
              {isProcessing && <ProgressBar progress={progress} />}
              
              <div className="flex justify-end gap-4 mt-2 items-center">
                {convertedUrl && (
                  <a 
                    href={convertedUrl} 
                    download={convertedName}
                    className="inline-flex h-12 px-6 py-3 text-base items-center justify-center font-bold rounded-xl transition-all duration-200 active:scale-95 bg-success text-[#023b2c] hover:bg-[#07e8ae] hover:-translate-y-[2px]"
                  >
                    Download File
                  </a>
                )}
                
                <PrimaryBtn
                  onClick={handleConvert}
                  disabled={isProcessing || !file || convertedUrl !== null}
                >
                  <ArrowRightLeft className="w-5 h-5 mr-2" />
                  Convert Now
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
