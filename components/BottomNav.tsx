"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/test", label: "Test", icon: Compass },
    { href: "/stats", label: "Stats", icon: BarChart2 },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#101622]/80 backdrop-blur-md border-t border-slate-200/50 dark:border-slate-800/50 px-6 pb-6 pt-3">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex flex-col items-center gap-1 transition-colors",
                isActive
                  ? "text-blue-600 dark:text-blue-500"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              )}
            >
              <Icon
                size={24}
                className={cn("transition-transform group-active:scale-90", isActive && "fill-current")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
