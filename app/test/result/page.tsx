"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Home, RotateCcw, Award } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TestResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("testResult");
    if (!data) {
        router.push("/test");
        return;
    }
    setResult(JSON.parse(data));
  }, []);

  if (!result) return <div className="h-screen flex items-center justify-center">Processing Results...</div>;

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-[#101622] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-6 py-5 z-20">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/")}>
              <Home className="text-slate-500" />
          </Button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Results</h1>
          <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-4 overflow-y-auto w-full max-w-md mx-auto no-scrollbar">
          {/* Hero */}
          <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 mb-4 rounded-full bg-linear-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Award className="text-white" size={48} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {result.score >= 80 ? "Great Job!" : result.score >= 50 ? "Good Effort!" : "Keep Practicing!"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  You scored {result.score}% on this test.
              </p>
          </div>

          {/* Stats Card */}
          <div className="w-full bg-white dark:bg-[#1e2229] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
              <div className="flex justify-between items-end mb-4">
                  <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Score</p>
                      <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">{result.score}</span>
                          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">%</span>
                      </div>
                  </div>
                  <div className="text-right">
                      <span className={cn(
                          "px-2 py-1 rounded text-xs font-bold uppercase",
                          result.score >= 60 ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      )}>
                          {result.score >= 60 ? "Passed" : "Needs Work"}
                      </span>
                      <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                          {result.correctCount}/{result.total}
                      </p>
                  </div>
              </div>

              {/* Progress Bar */}
              <div className="h-4 w-full bg-slate-100 dark:bg-[#101622] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.score}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
              </div>
          </div>

          {/* Mistakes / Review */}
          <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white">Review Mistakes</h3>
              </div>

              {result.mistakes.length === 0 ? (
                  <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20 text-center text-green-700 dark:text-green-400 font-medium">
                      Perfect score! No mistakes to review.
                  </div>
              ) : (
                  result.mistakes.map((m: any, i: number) => (
                      <div key={i} className="bg-white dark:bg-[#1e2229] p-4 rounded-xl border border-red-100 dark:border-red-900/20 shadow-sm flex items-start gap-3">
                          <XCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                          <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{m.question}</p>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                  Your answer: <span className="text-red-500 font-bold">{m.userAnswer}</span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                  Correct answer: <span className="text-green-500 font-bold">{m.correctAnswer}</span>
                              </div>
                              {m.explanation && (
                                <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2 rounded">
                                    <span className="font-bold">Explanation:</span> {m.explanation}
                                </div>
                              )}
                          </div>
                      </div>
                  ))
              )}
          </div>
      </main>

      <footer className="p-6 bg-white dark:bg-[#101622] border-t border-slate-100 dark:border-slate-800">
          <Button
            className="w-full h-14 text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20"
            onClick={() => router.push("/test")}
          >
              <RotateCcw className="mr-2" />
              Take Another Test
          </Button>
      </footer>
    </div>
  );
}
