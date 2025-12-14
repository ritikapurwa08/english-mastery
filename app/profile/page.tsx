/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import {
    Flame, Star, PieChart, ChevronRight, History, Settings, LogOut, Edit, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const stats = useQuery(api.analytics.getProfileStats);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
      await signOut();
      router.push("/auth");
  };

  const isLoading = stats === undefined;

  return (
    <div className="flex min-h-screen bg-background text-zinc-100  font-sans selection:bg-indigo-500/30">
       <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />

       <main className="flex-1 flex flex-col min-w-0  h-screen overflow-hidden">
          {/* Header */}
            <header className="shrink-0 h-16 border-b border-zinc-800 bg-black/50 backdrop-blur-md z-20 px-6 flex items-center justify-between">
                <div className="flex items-center lg:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>

                <h1 className="text-lg font-bold text-white">Profile</h1>

                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                    <Edit size={20} />
                </Button>
            </header>

          <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto p-6 space-y-8   custom-scrollbar">

              {/* User Info */}
              {isLoading ? (
                <div className="flex flex-col items-center animate-pulse">
                    <div className="h-28 w-28 rounded-full bg-zinc-800 mb-4"></div>
                    <div className="h-8 w-40 bg-zinc-800 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-zinc-800 rounded mb-3"></div>
                    <div className="h-6 w-24 bg-zinc-800 rounded-full"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="h-28 w-28 rounded-full p-1 bg-linear-to-tr from-indigo-500 to-purple-500">
                            <Image
                              src={stats?.image || "https://github.com/shadcn.png"}
                              width={112}
                              height={112}
                              alt="Profile"
                              className="h-full w-full rounded-full object-cover border-4 border-black"
                            />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black rounded-full p-1.5">
                            <div className="bg-emerald-500 h-3 w-3 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{stats?.name || "User"}</h2>
                    <p className="text-zinc-500 text-sm mb-3">{stats?.email}</p>
                    <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                        Free Member
                    </div>
                </div>
              )}

              {/* Key Stats (Compact) */}
              <div className="flex items-center gap-3">
                  <div className="flex-1 bg-surface p-3 rounded-xl border border-zinc-800 shadow-sm flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform">
                      {isLoading ? (
                         <div className="h-6 w-8 bg-zinc-800 rounded animate-pulse"></div>
                      ) : (
                         <div className="flex items-center gap-1.5 text-orange-500">
                             <Flame size={16} fill="currentColor" />
                             <span className="text-lg font-bold text-white">{stats?.streak ?? 0}</span>
                         </div>
                      )}
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Streak</p>
                  </div>

                  <div className="flex-1 bg-surface p-3 rounded-xl border border-zinc-800 shadow-sm flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform">
                      {isLoading ? (
                         <div className="h-6 w-8 bg-zinc-800 rounded animate-pulse"></div>
                      ) : (
                         <div className="flex items-center gap-1.5 text-yellow-500">
                             <Star size={16} fill="currentColor" />
                             <span className="text-lg font-bold text-white">{stats?.avgScore ?? 0}%</span>
                         </div>
                      )}
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Avg Score</p>
                  </div>

                  <div className="flex-1 bg-surface p-3 rounded-xl border border-zinc-800 shadow-sm flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-transform">
                      {isLoading ? (
                         <div className="h-6 w-8 bg-zinc-800 rounded animate-pulse"></div>
                      ) : (
                         <div className="flex items-center gap-1.5 text-blue-500">
                             <PieChart size={16} fill="currentColor" />
                             <span className="text-lg font-bold text-white">{stats?.accuracy ?? 0}%</span>
                         </div>
                      )}
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Accuracy</p>
                  </div>
              </div>

              {/* Performance Bars */}
              {isLoading ? (
                 <div className="bg-surface rounded-xl p-5 border border-zinc-800 h-40 animate-pulse"></div>
              ) : (
                  <div className="bg-surface rounded-xl p-5 border border-zinc-800">
                      <div className="flex items-center justify-between mb-5">
                          <h3 className="text-sm font-bold text-white">Performance by Topic</h3>
                          <span className="text-xs font-bold text-indigo-400 cursor-pointer hover:text-indigo-300">VIEW ALL</span>
                      </div>
                      <div className="space-y-5">
                          {stats?.performance.map((item: any) => (
                              <div key={item.category}>
                                  <div className="flex justify-between text-xs mb-2">
                                      <span className="font-bold text-zinc-400 uppercase tracking-wide">{item.category}</span>
                                      <span className="font-bold text-white">{item.percentage}%</span>
                                  </div>
                                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                      <div
                                        className={cn("h-full rounded-full", item.color)}
                                        style={{ width: `${item.percentage}%` }}
                                      ></div>
                                  </div>
                              </div>
                          ))}
                          {stats?.performance.length === 0 && (
                             <p className="text-zinc-500 text-xs italic text-center py-2">No data yet</p>
                          )}
                      </div>
                  </div>
              )}

              {/* Menu Links */}
              <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push("/test/history")}
                    className="group flex items-center justify-between p-4 bg-surface border border-zinc-800 rounded-xl hover:border-indigo-500/50 transition-all active:scale-[0.98]"
                  >
                      <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                              <History size={20} />
                          </div>
                          <div className="text-left">
                              <h4 className="text-sm font-bold text-white">Test History</h4>
                              <p className="text-xs text-zinc-500">Review past quizzes</p>
                          </div>
                      </div>
                      <ChevronRight className="text-zinc-600 group-hover:text-indigo-400" size={20} />
                  </button>

                  <button
                    onClick={() => router.push("/settings")}
                    className="group flex items-center justify-between p-4 bg-surface border border-zinc-800 rounded-xl hover:border-indigo-500/50 transition-all active:scale-[0.98]">
                      <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white transition-colors">
                              <Settings size={20} />
                          </div>
                          <div className="text-left">
                              <h4 className="text-sm font-bold text-white">Settings</h4>
                              <p className="text-xs text-zinc-500">Account preferences</p>
                          </div>
                      </div>
                      <ChevronRight className="text-zinc-600 group-hover:text-indigo-400" size={20} />
                  </button>
              </div>

              <div className="pt-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-4 text-sm font-bold text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20"
                  >
                      <LogOut size={18} />
                      Sign Out
                  </button>
              </div>

          </div>
       </main>
    </div>
  );
}
