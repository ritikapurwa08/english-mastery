/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
// import { BottomNav } from "@/components/BottomNav"; // Deprecated
import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, Zap, Target, BookOpen, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function StatsPage() {
  const router = useRouter();
  const stats = useQuery(api.analytics.getProfileStats);
  const user = useQuery(api.users.viewer);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const firstName = user?.name?.split(' ')[0] || 'User';

  if (stats === undefined) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Loading Stats...</div>;
  if (stats === null) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Please Log In</div>;

  return (
    <div className="flex min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30">
        <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />

        <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-0">
             {/* Header */}
            <header className="h-16 border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
                <div className="flex items-center lg:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>

                <h1 className="text-lg font-bold text-white hidden md:block">Statistics</h1>
                 <div className="flex items-center space-x-4 ml-auto">
                    <Link href="/profile" className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                        {firstName.slice(0, 2)}
                    </Link>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 w-full max-w-md mx-auto no-scrollbar">

                {/* Main Hero Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 shadow-sm flex flex-col justify-between h-32">
                        <div className="flex items-start justify-between">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                                <Zap size={20} fill="currentColor" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-white">{stats.streak}</h3>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mt-1">Day Streak</p>
                        </div>
                    </div>

                    <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 shadow-sm flex flex-col justify-between h-32">
                        <div className="flex items-start justify-between">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <Target size={20} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-white">{stats.avgScore}%</h3>
                            <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest mt-1">Avg Score</p>
                        </div>
                    </div>
                </div>

                {/* Detailed Stats Card */}
                <div className="bg-zinc-900/40 rounded-2xl p-6 border border-zinc-800 shadow-sm">
                    <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                        <BarChart3 className="text-indigo-500" size={20} />
                        Learning Analytics
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-zinc-400">Total Tests Taken</span>
                                <span className="font-bold text-white">{stats.totalTests}</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
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
                                <span className="text-zinc-400">Global Accuracy</span>
                                <span className="font-bold text-white">{stats.accuracy}%</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-emerald-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${stats.accuracy}%` }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Performance */}
                <div className="bg-zinc-900/40 rounded-2xl p-6 border border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-white flex items-center gap-2">
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
                                        <span className="font-medium text-zinc-300 text-sm">{item.category}</span>
                                        <span className="font-bold text-white text-sm">{item.percentage}%</span>
                                    </div>
                                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
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
                        variant="accent"
                        className="w-full h-14 text-lg font-bold shadow-lg shadow-indigo-500/20"
                    >
                        <BookOpen className="mr-2" size={20} />
                        Start New Test
                    </Button>
                </div>

            </div>
        </main>
    </div>
  );
}
