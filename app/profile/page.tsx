/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import {
    Flame, Star, PieChart, ChevronRight, History, Settings, LogOut, Edit
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const { signOut } = useAuthActions();
  const stats = useQuery(api.analytics.getProfileStats);

  const handleSignOut = async () => {
      await signOut();
      router.push("/auth");
  };

  if (stats === undefined) return <div className="h-screen flex items-center justify-center">Loading Profile...</div>;
  if (stats === null) return <div className="h-screen flex items-center justify-center">Please Log In</div>;

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#101622] flex flex-col font-sans pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex justify-between items-center bg-white dark:bg-[#1e2229] border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Profile</h1>
          <Button variant="ghost" size="icon" className="text-slate-400">
              <Edit size={20} />
          </Button>
      </div>

      <main className="flex-1 overflow-y-auto w-full max-w-md mx-auto p-6 space-y-6">

          {/* User Info */}
          <div className="flex flex-col items-center">
              <div className="relative mb-3">
                  <div className="h-24 w-24 rounded-full p-1 bg-linear-to-tr from-blue-600 to-purple-500">
                      <Image
                        src={stats.image || "https://github.com/shadcn.png"}
                        width={100}
                        height={100}
                        alt="Profile"
                        className="h-full w-full rounded-full object-cover border-4 border-white dark:border-[#1e2229]"
                      />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-white dark:bg-[#1e2229] rounded-full p-1">
                      <div className="bg-green-500 h-4 w-4 rounded-full border-2 border-white dark:border-[#1e2229]"></div>
                  </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{stats.name}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{stats.email}</p>
              <div className="mt-2 px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                  Premium Member
              </div>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
              <div className="bg-white dark:bg-[#1e2229] rounded-xl p-3 flex flex-col items-center border border-slate-100 dark:border-slate-800 shadow-sm">
                  <Flame className="text-orange-500 mb-1" fill="currentColor" size={24} />
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.streak}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Day Streak</span>
              </div>
              <div className="bg-white dark:bg-[#1e2229] rounded-xl p-3 flex flex-col items-center border border-slate-100 dark:border-slate-800 shadow-sm">
                  <Star className="text-yellow-500 mb-1" fill="currentColor" size={24} />
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.avgScore}%</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Avg Score</span>
              </div>
              <div className="bg-white dark:bg-[#1e2229] rounded-xl p-3 flex flex-col items-center border border-slate-100 dark:border-slate-800 shadow-sm">
                  <PieChart className="text-blue-500 mb-1" fill="currentColor" size={24} />
                  <span className="text-lg font-bold text-slate-900 dark:text-white">{stats.accuracy}%</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Correct</span>
              </div>
          </div>

          {/* Performance Bars */}
          <div className="bg-white dark:bg-[#1e2229] rounded-xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Performance by Topic</h3>
                  <span className="text-xs font-medium text-blue-600 cursor-pointer">View All</span>
              </div>
              <div className="space-y-4">
                  {stats.performance.map((item: any) => (
                      <div key={item.category}>
                          <div className="flex justify-between text-xs mb-1.5">
                              <span className="font-medium text-slate-600 dark:text-slate-300">{item.category}</span>
                              <span className="font-bold text-slate-900 dark:text-white">{item.percentage}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-[#101622] rounded-full overflow-hidden">
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
                className="group flex items-center justify-between p-4 bg-white dark:bg-[#1e2229] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-blue-500 transition-all active:scale-[0.98]"
              >
                  <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                          <History size={20} />
                      </div>
                      <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Test History</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Review past quizzes</p>
                      </div>
                  </div>
                  <ChevronRight className="text-slate-300" size={20} />
              </button>

              <button className="group flex items-center justify-between p-4 bg-white dark:bg-[#1e2229] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-blue-500 transition-all active:scale-[0.98]">
                  <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                          <Settings size={20} />
                      </div>
                      <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Settings</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Account preferences</p>
                      </div>
                  </div>
                  <ChevronRight className="text-slate-300" size={20} />
              </button>
          </div>

          <div className="pt-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                  <LogOut size={18} />
                  Sign Out
              </button>
          </div>

      </main>

      <BottomNav />
    </div>
  );
}
