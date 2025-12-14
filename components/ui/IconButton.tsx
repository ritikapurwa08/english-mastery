import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  active?: boolean;
}

export const IconButton = ({ icon: Icon, active, className, ...props }: IconButtonProps) => (
  <button
    className={cn(
      "w-10 h-10 flex items-center justify-center rounded-lg border transition-all duration-200",
      active
        ? "bg-zinc-100 text-black border-zinc-100 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
        : "bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700",
      className
    )}
    {...props}
  >
    <Icon className="w-5 h-5" />
  </button>
);
