import { ReactNode } from "react";

export function ControlRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row items-end gap-4 w-full">
      {children}
    </div>
  );
}
