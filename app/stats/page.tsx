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

  const isLoading = stats === undefined;

  return (
    <div className="flex min-h-screen bg-background text-zinc-100 font-sans selection:bg-indigo-500/30">
        <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />

        <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-0 h-screen overflow-hidden">
             {/* Header */}
            <header className="shrink-0 h-16 border-b border-zinc-800 bg-black/50 backdrop-blur-md z-20 px-6 flex items-center justify-between">
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

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 space-y-6 w-full max-w-md mx-auto">

                {/* Main Hero Stats (Compact) */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface p-4 rounded-xl border border-zinc-800 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-transform">
                        <div className="p-2.5 bg-orange-500/10 rounded-lg text-orange-500 shrink-0">
                            <Zap size={18} fill="currentColor" />
                        </div>
                        <div>
                            {isLoading ? (
                                <div className="h-6 w-12 bg-zinc-800 rounded animate-pulse mb-1"></div>
                            ) : (
                                <h3 className="text-xl font-bold text-white leading-none">{stats?.streak ?? 0}</h3>
                            )}
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Streak</p>
                        </div>
                    </div>

                    <div className="bg-surface p-4 rounded-xl border border-zinc-800 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-transform">
                        <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-500 shrink-0">
                            <Target size={18} />
                        </div>
                        <div>
                           {isLoading ? (
                                <div className="h-6 w-12 bg-zinc-800 rounded animate-pulse mb-1"></div>
                            ) : (
                                <h3 className="text-xl font-bold text-white leading-none">{stats?.avgScore ?? 0}%</h3>
                            )}
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Avg Score</p>
                        </div>
                    </div>
                </div>

                {/* Detailed Stats Card */}
                {isLoading ? (
                    <div className="bg-surface rounded-2xl p-6 border border-zinc-800 space-y-6 animate-pulse">
                        <div className="h-6 w-32 bg-zinc-800 rounded"></div>
                        <div className="space-y-4">
                            <div className="h-10 bg-zinc-800 rounded"></div>
                            <div className="h-10 bg-zinc-800 rounded"></div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-surface rounded-2xl p-6 border border-zinc-800 shadow-sm">
                        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
                            <BarChart3 className="text-indigo-500" size={20} />
                            Learning Analytics
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-zinc-400">Total Tests Taken</span>
                                    <span className="font-bold text-white">{stats?.totalTests ?? 0}</span>
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
                                    <span className="font-bold text-white">{stats?.accuracy ?? 0}%</span>
                                </div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-emerald-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats?.accuracy ?? 0}%` }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Performance */}
                {isLoading ? (
                    <div className="bg-surface rounded-2xl p-6 border border-zinc-800 h-40 animate-pulse"></div>
                ) : (
                    <div className="bg-surface rounded-2xl p-6 border border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <TrendingUp className="text-green-500" size={20} />
                                Skill Breakdown
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {stats?.performance.map((item: any, idx: number) => (
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
                            {stats?.performance.length === 0 && (
                                <p className="text-zinc-500 text-sm italic text-center py-4">No test data available yet.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Quick Action */}
                <div className="pt-2">
                    <Button
                        onClick={() => router.push("/test")}
                        variant="outline"
                        className="w-full h-14 bg-surface text-base md:text-lg font-bold shadow-lg shadow-indigo-500/20"
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
