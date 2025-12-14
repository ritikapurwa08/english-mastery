import { cn } from "@/lib/utils";
import React from "react";

export const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn(
    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-zinc-900 border border-zinc-800 text-zinc-400",
    className
  )}>
    {children}
  </span>
);
