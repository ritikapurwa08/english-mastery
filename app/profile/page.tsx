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
  const stats = useQuery(api.analytics.getProfileStats); // Assuming this exists from previous context
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
      await signOut();
      router.push("/auth");
  };

  if (stats === undefined) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Loading Profile...</div>;
  if (stats === null) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Please Log In</div>;

  return (
    <div className="flex min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30">
       <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />

       <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
            <header className="h-16 border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
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

          <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto p-6 space-y-8">

              {/* User Info */}
              <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                      <div className="h-28 w-28 rounded-full p-1 bg-linear-to-tr from-indigo-500 to-purple-500">
                          <Image
                            src={stats.image || "https://github.com/shadcn.png"}
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
                  <h2 className="text-2xl font-bold text-white">{stats.name}</h2>
                  <p className="text-zinc-500 text-sm mb-3">{stats.email}</p>
                  <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                      Free Member
                  </div>
              </div>

              {/* Key Stats Buttons (Converted from lines) */}
              <div className="grid grid-cols-3 gap-3">
                  <button className="bg-zinc-900/50 hover:bg-zinc-800 transition-colors rounded-xl p-3 flex flex-col items-center border border-zinc-800">
                      <Flame className="text-orange-500 mb-2" fill="currentColor" size={24} />
                      <span className="text-xl font-bold text-white">{stats.streak}</span>
                      <span className="text-[10px] uppercase font-bold text-zinc-500">Streak</span>
                  </button>
                  <button className="bg-zinc-900/50 hover:bg-zinc-800 transition-colors rounded-xl p-3 flex flex-col items-center border border-zinc-800">
                      <Star className="text-yellow-500 mb-2" fill="currentColor" size={24} />
                      <span className="text-xl font-bold text-white">{stats.avgScore}%</span>
                      <span className="text-[10px] uppercase font-bold text-zinc-500">Avg Score</span>
                  </button>
                  <button className="bg-zinc-900/50 hover:bg-zinc-800 transition-colors rounded-xl p-3 flex flex-col items-center border border-zinc-800">
                      <PieChart className="text-blue-500 mb-2" fill="currentColor" size={24} />
                      <span className="text-xl font-bold text-white">{stats.accuracy}%</span>
                      <span className="text-[10px] uppercase font-bold text-zinc-500">Accuracy</span>
                  </button>
              </div>

              {/* Performance Bars */}
              <div className="bg-zinc-900/40 rounded-xl p-5 border border-zinc-800">
                  <div className="flex items-center justify-between mb-5">
                      <h3 className="text-sm font-bold text-white">Performance by Topic</h3>
                      <span className="text-xs font-bold text-indigo-400 cursor-pointer hover:text-indigo-300">VIEW ALL</span>
                  </div>
                  <div className="space-y-5">
                      {stats.performance.map((item: any) => (
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
                  </div>
              </div>

              {/* Menu Links */}
              <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push("/test/history")}
                    className="group flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-indigo-500/50 transition-all active:scale-[0.98]"
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
                    className="group flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-indigo-500/50 transition-all active:scale-[0.98]">
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
