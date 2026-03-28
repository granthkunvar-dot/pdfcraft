import { AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusType = "idle" | "processing" | "success" | "error";

export interface StatusState {
  type: StatusType;
  msg: string;
}

interface StatusBarProps {
  status: StatusState | null;
  className?: string;
}

export function StatusBar({ status, className }: StatusBarProps) {
  if (!status || status.type === "idle" || !status.msg) return null;

  const bgStyles = {
    processing: "bg-accent-yellow/10 border-accent-yellow/20 text-accent-yellow",
    success: "bg-success/10 border-success/20 text-success",
    error: "bg-red-500/10 border-red-500/20 text-red-500",
  };

  const Icon = {
    processing: Loader2,
    success: CheckCircle2,
    error: AlertCircle,
  }[status.type] || Info;

  return (
    <div
      className={cn(
        "flex items-center gap-3 w-full p-4 rounded-xl border text-sm font-medium transition-all animate-in fade-in slide-in-from-bottom-2",
        bgStyles[status.type],
        className
      )}
    >
      <Icon className={cn("w-5 h-5 flex-shrink-0", status.type === "processing" && "animate-spin")} />
      <span>{status.msg}</span>
    </div>
  );
}
