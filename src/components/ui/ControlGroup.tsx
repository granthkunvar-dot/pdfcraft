import { ReactNode } from "react";

interface ControlGroupProps {
  label: string;
  children: ReactNode;
  description?: string;
}

export function ControlGroup({ label, children, description }: ControlGroupProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted">
        {label}
      </label>
      {children}
      {description && <p className="text-xs text-muted/70">{description}</p>}
    </div>
  );
}
