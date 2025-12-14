"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, BookOpen, Activity, Settings, User } from 'lucide-react';
import { cn } from "@/lib/utils";

export function ArchitecturalSidebar() {
  const pathname = usePathname();

  const navItems = [
    { id: '/', icon: LayoutGrid, label: 'Overview' },
    { id: '/learn', icon: BookOpen, label: 'Modules' },
    { id: '/stats', icon: Activity, label: 'Analytics' },
    { id: '/profile', icon: User, label: 'Profile' },
    { id: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-full md:w-20 lg:w-64 border-r border-zinc-900 bg-surface flex flex-col z-50 sticky top-0 min-h-dvh">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-zinc-900 justify-start md:justify-center lg:justify-start">
         <div className="w-8 h-8 shrink-0 bg-white rounded flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
           <span className="font-display font-bold text-black text-xl">E</span>
         </div>
         <span className="ml-3 font-display font-bold text-lg block md:hidden lg:block tracking-tight text-white">
           English<span className="text-zinc-500">Mastery</span>
         </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-2 lg:px-4 space-y-2 flex flex-col items-stretch md:items-center lg:items-stretch">
        {navItems.map((item) => {
          const isActive = pathname === item.id;
          return (
            <Link
              key={item.id}
              href={item.id}
              className={cn(
                "flex items-center space-x-3 md:space-x-0 lg:space-x-3 px-3 py-3 rounded-lg transition-all group justify-start md:justify-center lg:justify-start",
                isActive ? "bg-zinc-900 border border-zinc-800" : "hover:bg-zinc-900/50 border border-transparent"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")} />
              <span className={cn("text-sm font-medium block md:hidden lg:block", isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")}>
                {item.label}
              </span>
              {isActive && <div className="ml-auto w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,1)] block md:hidden lg:block" />}
            </Link>
          );
        })}
      </nav>

      {/* User Mini Profile */}
      <div className="p-4 border-t border-zinc-900 flex justify-start md:justify-center lg:justify-start">
        <div className="flex items-center space-x-3 md:space-x-0 lg:space-x-3 p-2 rounded-lg bg-zinc-900/30 border border-zinc-900 w-full md:w-auto lg:w-full justify-start md:justify-center lg:justify-start">
          <div className="w-8 h-8 rounded bg-linear-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-xs font-bold border border-white/10 text-white shrink-0">RK</div>
          <div className="block md:hidden lg:block">
            <p className="text-xs font-bold text-white">Ritik K.</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Pro Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
