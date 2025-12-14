"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { StatBlock } from "@/components/ui/StatBlock";
import { IconButton } from "@/components/ui/IconButton";
import { Search, Trophy, Flame, ArrowUpRight, ChevronRight, Menu } from "lucide-react";
import Link from "next/link";


export default function Home() {


  const stats = useQuery(api.dashboard.getStats);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const marked = stats?.wordsMarked || 0;
  const mastered = stats?.wordsMastered || 0;
  const streak = stats?.streak || 0;


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />

      <main className="flex-1 relative overflow-y-auto h-screen custom-scrollbar">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0 opacity-20" />

        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-zinc-900 px-6 md:px-8 py-5 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <h1 className="text-xl md:text-2xl font-display font-medium text-white tracking-tight">
                    Dashboard <span className="text-zinc-600 hidden sm:inline">/ Overview</span>
                </h1>
            </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center px-3 py-1.5 bg-zinc-900/50 rounded border border-zinc-800">
               <Flame className="w-4 h-4 text-orange-500 mr-2" />
               <span className="text-xs font-mono text-zinc-300">STREAK: {streak}</span>
            </div>
            <IconButton icon={Search} />
            <IconButton icon={Trophy} active />
          </div>
        </header>

        {/* Content Area */}
        <div className="relative z-10 p-6 lg:p-10 max-w-7xl mx-auto space-y-10">

           {/* Section 1: Hero & Stats */}
           <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Hero Card */}
              <div className="md:col-span-8 bento-card rounded-2xl p-8 flex flex-col justify-between min-h-70 group border-l-4 border-l-indigo-600">
                 <div className="space-y-4 max-w-lg">
                    <Badge className="text-indigo-400 border-indigo-500/20 bg-indigo-500/10">Daily Focus</Badge>
                    <h2 className="text-4xl md:text-5xl font-display font-medium text-white tracking-tight leading-[1.1]">
                       Master the art of <br />
                       <span className="text-indigo-500 text-glow">English.</span>
                    </h2>
                 </div>
                 <div className="pt-8">
                    <Link href="/study?mode=learning">
                        <button className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                        <span>Start Session</span>
                        <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </Link>
                 </div>
              </div>

              {/* Stats Column */}
              <div className="md:col-span-4 grid grid-rows-2 gap-6">
                 <Link href="/stats" className="bento-card rounded-2xl cursor-pointer hover:bg-surface/80 transition-colors">
                    <StatBlock label="Words Mastered" value={mastered.toString()} trend="+2" trendUp />
                 </Link>
                 <Link href="/learn" className="bento-card rounded-2xl cursor-pointer hover:bg-surface/80 transition-colors">
                    <StatBlock label="Words Marked" value={marked.toString()} trend="Learning" trendUp />
                 </Link>
              </div>
           </section>

           {/* Section 2: List Layout */}
           <section>
              <div className="flex items-end justify-between mb-6 border-b border-zinc-900 pb-2">
                 <h3 className="text-xl font-display text-white">Active Modules</h3>
                 <Link href="/test">
                     <button className="text-xs font-mono text-zinc-500 hover:text-white uppercase tracking-wider flex items-center">
                        Take Test <ChevronRight className="w-3 h-3 ml-1" />
                     </button>
                 </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900 rounded-2xl overflow-hidden">

                 <Link href="/learn?category=vocabulary" className="bg-surface p-6 hover:bg-zinc-900/50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_currentColor]" />
                       <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="text-xl font-display text-white mb-2 group-hover:text-glow transition-all">Vocabulary</h4>
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Core Lexicon</p>
                 </Link>

                 <Link href="/test" className="bg-surface p-6 hover:bg-zinc-900/50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_currentColor]" />
                       <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="text-xl font-display text-white mb-2 group-hover:text-glow transition-all">Quick Test</h4>
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">10 Questions</p>
                 </Link>

                 <Link href="/study?mode=learning" className="bg-surface p-6 hover:bg-zinc-900/50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_currentColor]" />
                       <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                    </div>
                    <h4 className="text-xl font-display text-white mb-2 group-hover:text-glow transition-all">Flashcards</h4>
                    <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Study Mode</p>
                 </Link>

              </div>
           </section>

        </div>
      </main>
    </div>
  );
}
