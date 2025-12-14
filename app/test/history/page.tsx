"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Filter, Calendar, Clock, ChevronRight, CheckCircle, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function TestHistoryPage() {
  const router = useRouter();
  const history = useQuery(api.tests.getHistory);

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-[#101622] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="pt-6 pb-2 px-4 bg-white dark:bg-[#1e2229] sticky top-0 z-20 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4 mt-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
                <ArrowLeft className="text-slate-700 dark:text-white" />
            </Button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Test History</h1>
            <Button variant="ghost" size="icon" className="rounded-full relative">
                <Filter className="text-slate-700 dark:text-white" size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border border-white dark:border-[#1e2229]"></span>
            </Button>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <Input
                    className="pl-10 bg-slate-50 dark:bg-[#151b28] border-none"
                    placeholder="Search tests..."
                />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                <button className="flex-none px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-medium shadow-sm shadow-blue-600/30">All Tests</button>
                <button className="flex-none px-4 py-1.5 rounded-full bg-slate-100 dark:bg-[#151b28] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium whitespace-nowrap">Vocabulary</button>
            </div>
        </div>
      </div>

      {/* List */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#101622] p-4 space-y-3 no-scrollbar">
         {history === undefined ? (
             <div className="text-center py-10 text-slate-400">Loading history...</div>
         ) : history.length === 0 ? (
             <div className="text-center py-10 text-slate-400">No tests taken yet.</div>
         ) : (
             <>
                {/* Client-Side Logic for Search/Filter since history is small (top 20) */}
                 {(() => {
                    const filtered = history.filter(t => {
                        // For MVP, we calculate "Category" from breakdown or assume Mixed.
                        // We assume most recent tests are Vocabulary if no breakdown.
                        // Actually, we can check mistakes[0]?.category or similar if we stored it?
                        // 'test_results' schema has 'categoryBreakdown'.
                        // Let's implement robust filtering later. For now, simple search.
                        // Search matches date string or score? Not very useful. Matches ID?
                        // Let's assume search matches nothing for now as titles are static.
                        // TODO: Add 'test title' or 'tags' to schema.
                        return true;
                    });

                    return filtered.map((test) => (
                     <div
                        key={test._id}
                        className="group relative bg-white dark:bg-[#1e2229] p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.99] transition-all cursor-pointer hover:border-blue-500/30"
                        onClick={() => {
                            // Re-construct result object and go to result page
                            const resultObj = {
                                score: test.score,
                                correctCount: test.questionsCorrect,
                                total: test.questionsAttempted,
                                mistakes: test.mistakes,
                                resultId: test._id
                            };
                            sessionStorage.setItem("testResult", JSON.stringify(resultObj));
                            router.push("/test/result");
                        }}
                     >
                        <div className="flex items-start gap-3">
                            <div className={cn(
                                "flex-none w-12 h-12 rounded-lg flex items-center justify-center",
                                test.score >= 80 ? "bg-green-100 dark:bg-green-900/10 text-green-600 dark:text-green-400" :
                                test.score >= 50 ? "bg-orange-100 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400" :
                                "bg-red-100 dark:bg-red-900/10 text-red-600 dark:text-red-400"
                            )}>
                                {test.score >= 80 ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                            {test.categoryBreakdown?.[0]?.category
                                                ? `${test.categoryBreakdown[0].category} Test`
                                                : "General Test"}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {test.questionsCorrect}/{test.questionsAttempted} Correct
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={cn(
                                            "text-sm font-bold",
                                            test.score >= 60 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                        )}>{test.score}%</span>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {test.score >= 80 ? "Excellent" : test.score >= 60 ? "Passed" : "Failed"}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                                    <div className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {Math.floor(test.duration / 60)}m {test.duration % 60}s
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {format(test.date, "MMM d, h:mm a")}
                                    </div>
                                </div>
                            </div>

                            <div className="self-center pl-2">
                                <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
                            </div>
                        </div>
                     </div>
                 ));
                 })()}
             </>
         )}
      </main>
    </div>
  );
}
