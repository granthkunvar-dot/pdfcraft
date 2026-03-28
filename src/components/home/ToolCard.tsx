import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  isActive?: boolean;
}

export function ToolCard({ title, description, href, icon: Icon, isActive }: ToolCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col p-6 rounded-2xl bg-surface transition-all duration-300",
        "border border-surface-border border-dashed hover:border-solid hover:border-accent-orange",
        "hover:shadow-[0_8px_30px_rgba(255,107,53,0.1)] hover:-translate-y-1",
        isActive && "border-solid border-accent-orange shadow-[0_8px_30px_rgba(255,107,53,0.15)] -translate-y-1"
      )}
    >
      <div className={cn(
        "w-12 h-12 flex items-center justify-center rounded-xl bg-surface2 mb-4 transition-colors",
        "group-hover:bg-accent-orange/10 group-hover:text-accent-orange text-muted",
        isActive && "bg-accent-orange/10 text-accent-orange"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-muted line-clamp-2">{description}</p>
    </Link>
  );
}
