"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BottomNav } from "@/components/BottomNav";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, Calendar, ArrowUpRight, Zap, Target, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function StatsPage() {
  const router = useRouter();
  const stats = useQuery(api.analytics.getProfileStats);

  if (stats === undefined) return <div className="h-screen flex items-center justify-center text-slate-500">Loading Stats...</div>;
  if (stats === null) return <div className="h-screen flex items-center justify-center text-slate-500">Please Log In</div>;

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#101622] flex flex-col font-sans pb-24">
      {/* Header */}
      <header className="px-6 py-6 bg-white dark:bg-[#1e2229] border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Progress</h1>
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Beta
            </div>
          </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 w-full max-w-md mx-auto no-scrollbar">

        {/* Main Hero Stats */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#1e2229] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-32">
                <div className="flex items-start justify-between">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                        <Zap size={20} fill="currentColor" />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.streak}</h3>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Day Streak</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1e2229] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-32">
                <div className="flex items-start justify-between">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        <Target size={20} />
                    </div>
                </div>
                <div>
                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stats.avgScore}%</h3>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Avg Score</p>
                </div>
            </div>
        </div>

        {/* Detailed Stats Card */}
        <div className="bg-white dark:bg-[#1e2229] rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 className="text-blue-500" size={20} />
                Learning Analytics
            </h3>

            <div className="space-y-6">
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500 dark:text-slate-400">Total Tests Taken</span>
                        <span className="font-bold text-slate-900 dark:text-white">{stats.totalTests}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-[#101622] rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1 }}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500 dark:text-slate-400">Global Accuracy</span>
                        <span className="font-bold text-slate-900 dark:text-white">{stats.accuracy}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-[#101622] rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-green-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.accuracy}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white dark:bg-[#1e2229] rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="text-green-500" size={20} />
                    Skill Breakdown
                </h3>
            </div>

            <div className="space-y-4">
                {stats.performance.map((item: any, idx: number) => (
                    <div key={item.category} className="flex items-center gap-4">
                        <div className={cn("w-2 h-8 rounded-full", item.color)}></div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{item.category}</span>
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{item.percentage}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 dark:bg-[#101622] rounded-full overflow-hidden">
                                <motion.div
                                    className={cn("h-full", item.color)}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.percentage}%` }}
                                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Quick Action */}
        <div className="pt-2">
            <Button
                onClick={() => router.push("/test")}
                className="w-full h-14 text-lg font-bold rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20"
            >
                <BookOpen className="mr-2" size={20} />
                Start New Test
            </Button>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
