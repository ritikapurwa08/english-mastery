"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { BottomNav } from "@/components/BottomNav";
import { Progress } from "@/components/ui/progress";
import { Flame, CheckCircle, Flag, Repeat, SpellCheck, MessageCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { ModeToggle } from "@/components/theme-toggle-button";
import { VercelHero } from "@/components/ui/vercel-hero";

export default function Home() {
  const stats = useQuery(api.dashboard.getStats);
  const user = useQuery(api.users.viewer);

  // Loading state (skeleton could be better)
  if (stats === undefined || user === undefined) {
    return <div className="min-h-screen bg-slate-50 dark:bg-[#101622] flex items-center justify-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#101622] font-sans pb-24 selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full px-4 py-3 bg-white/80 dark:bg-[#101622]/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-3 py-1.5">
          <Flame className="text-orange-500 fill-orange-500" size={20} />
          <span className="text-orange-500 text-sm font-bold">{stats?.streak || 0} Days</span>
        </div>

        <Link href="/profile" className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-transparent hover:ring-blue-600 transition-all">
          {user?.image ? (
              <ModeToggle />
          ) : (
             <span className="text-slate-500 font-bold">U</span>
          )}
        </Link>
      </header>

      <VercelHero />

      <main className="flex flex-col gap-6 p-4 max-w-md mx-auto">
        {/* Stats Row */}
        <motion.section
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-4"
        >
            <motion.div variants={fadeIn} className="flex flex-col justify-between rounded-2xl bg-white dark:bg-[#1e2229] p-4 border border-slate-200 dark:border-slate-800 shadow-sm h-32">
                <div className="flex items-start justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Words Today</span>
                    <CheckCircle className="text-green-500" size={20} />
                </div>
                <div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.wordsToday || 0}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">+0 from yesterday</div>
                </div>
            </motion.div>

            <motion.div variants={fadeIn} className="flex flex-col justify-between rounded-2xl bg-white dark:bg-[#1e2229] p-4 border border-slate-200 dark:border-slate-800 shadow-sm h-32">
                <div className="flex items-start justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Weekly Goal</span>
                    <Flag className="text-blue-600" size={20} />
                </div>
                <div className="w-full">
                    <div className="flex items-end justify-between mb-2">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                </div>
            </motion.div>
        </motion.section>

        {/* Categories */}
        <section>
            <h3 className="mb-4 px-1 text-lg font-bold text-slate-900 dark:text-white">Categories</h3>
            <div className="grid grid-cols-2 gap-3">
                {/* Synonyms */}
                <Link href="/learn?category=synonyms" className="relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl bg-slate-800 p-4 shadow-sm active:scale-[0.98] transition-transform group">
                   <div className="absolute inset-0 bg-blue-600/40 mix-blend-multiply group-hover:bg-blue-600/50 transition-colors"></div>
                   <Repeat className="absolute top-4 left-4 text-white/50" size={32} />
                   <div className="relative z-10">
                        <p className="text-base font-bold text-white">Synonyms</p>
                        <p className="text-xs text-slate-300">Start Lesson</p>
                   </div>
                </Link>

                {/* Antonyms */}
                <Link href="/learn?category=antonyms" className="relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl bg-slate-800 p-4 shadow-sm active:scale-[0.98] transition-transform group">
                   <div className="absolute inset-0 bg-purple-600/40 mix-blend-multiply group-hover:bg-purple-600/50 transition-colors"></div>
                   <div className="absolute top-4 left-4 text-white/50 text-2xl">↔️</div>
                   <div className="relative z-10">
                        <p className="text-base font-bold text-white">Antonyms</p>
                        <p className="text-xs text-slate-300">Start Lesson</p>
                   </div>
                </Link>

                 {/* Grammar */}
                 <Link href="/learn?category=grammar" className="relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl bg-slate-800 p-4 shadow-sm active:scale-[0.98] transition-transform group">
                   <div className="absolute inset-0 bg-teal-600/40 mix-blend-multiply group-hover:bg-teal-600/50 transition-colors"></div>
                   <SpellCheck className="absolute top-4 left-4 text-white/50" size={32} />
                   <div className="relative z-10">
                        <p className="text-base font-bold text-white">Grammar</p>
                        <p className="text-xs text-slate-300">Start Lesson</p>
                   </div>
                </Link>

                 {/* Idioms */}
                 <Link href="/learn?category=idioms" className="relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl bg-slate-800 p-4 shadow-sm active:scale-[0.98] transition-transform group">
                   <div className="absolute inset-0 bg-orange-600/40 mix-blend-multiply group-hover:bg-orange-600/50 transition-colors"></div>
                   <MessageCircle className="absolute top-4 left-4 text-white/50" size={32} />
                   <div className="relative z-10">
                        <p className="text-base font-bold text-white">Idioms</p>
                        <p className="text-xs text-slate-300">Start Lesson</p>
                   </div>
                </Link>
            </div>
        </section>

      </main>

      <BottomNav />
    </div>
  );
}
