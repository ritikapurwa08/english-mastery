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

  if (!result) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Processing Results...</div>;

  return (
    <div className="flex min-h-screen bg-background text-zinc-200 font-sans selection:bg-indigo-500/30">
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Header */}
          <header className="shrink-0 flex items-center justify-between px-6 py-5 bg-black/50 backdrop-blur-md z-20 border-b border-zinc-800">
              <Button variant="ghost" size="icon" className="rounded-full text-zinc-500 hover:text-white" onClick={() => router.push("/")}>
                  <Home />
              </Button>
              <h1 className="text-lg font-bold text-white">Results</h1>
              <div className="w-10" />
          </header>

          <main className="flex-1 flex flex-col items-center px-6 py-4 overflow-y-auto custom-scrollbar w-full max-w-md mx-auto">
              {/* Hero */}
              <div className="flex flex-col items-center mb-8 mt-4">
                  <div className="w-24 h-24 mb-4 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                      <Award className="text-white" size={48} />
                  </div>
                  <h2 className="text-3xl font-display font-medium text-white mb-1 tracking-tight">
                      {result.score >= 80 ? "Great Job!" : result.score >= 50 ? "Good Effort!" : "Keep Practicing!"}
                  </h2>
                  <p className="text-zinc-400 text-sm font-medium">
                      You scored {result.score}% on this test.
                  </p>
              </div>

              {/* Stats Card */}
              <div className="w-full bg-surface rounded-2xl p-6 shadow-sm border border-zinc-800 mb-6 relative overflow-hidden">
                  <div className="flex justify-between items-end mb-4 relative z-10">
                      <div>
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Score</p>
                          <div className="flex items-baseline gap-1">
                              <span className="text-5xl font-bold text-white">{result.score}</span>
                              <span className="text-xl font-bold text-indigo-400">%</span>
                          </div>
                      </div>
                      <div className="text-right">
                          <span className={cn(
                              "px-2 py-1 rounded text-xs font-bold uppercase tracking-wider",
                              result.score >= 60 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                          )}>
                              {result.score >= 60 ? "Passed" : "Needs Work"}
                          </span>
                          <p className="text-lg font-bold text-white mt-1">
                              {result.correctCount}/{result.total}
                          </p>
                      </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden relative z-10">
                      <motion.div
                        className="h-full bg-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${result.score}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                      />
                  </div>

                  {/* Decorative Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
              </div>

              {/* Mistakes / Review */}
              <div className="w-full space-y-4 pb-32">
                  <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white">Review Mistakes</h3>
                  </div>

                  {result.mistakes.length === 0 ? (
                      <div className="p-6 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-center text-emerald-400 font-medium">
                          Perfect score! No mistakes to review.
                      </div>
                  ) : (
                      result.mistakes.map((m: any, i: number) => (
                          <div key={i} className="bg-surface p-4 rounded-xl border border-zinc-800 shadow-sm flex items-start gap-3">
                              <XCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
                              <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-zinc-200 mb-2">{m.question}</p>
                                  <div className="flex flex-col gap-1">
                                      <div className="text-xs text-zinc-500 flex justify-between">
                                          <span>Your answer:</span>
                                          <span className="text-red-400 font-bold truncate ml-2">{m.userAnswer}</span>
                                      </div>
                                      <div className="text-xs text-zinc-500 flex justify-between">
                                          <span>Correct answer:</span>
                                          <span className="text-emerald-400 font-bold truncate ml-2">{m.correctAnswer}</span>
                                      </div>
                                  </div>
                                  {m.explanation && (
                                    <div className="mt-3 text-xs text-zinc-400 bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg leading-relaxed">
                                        <span className="font-bold text-indigo-400 block mb-1">Explanation</span>
                                        {m.explanation}
                                    </div>
                                  )}
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </main>

          <footer className="fixed bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black via-black to-transparent z-10">
              <div className="max-w-md mx-auto space-y-3">
                <Button
                    className="w-full h-14 text-base font-bold rounded-xl bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5"
                    onClick={() => router.push("/test")}
                >
                    <RotateCcw className="mr-2 w-4 h-4" />
                    Take Another Test
                </Button>
                <Button
                    variant="ghost"
                    className="w-full h-12 text-sm font-bold text-zinc-500 hover:text-white"
                    onClick={() => router.push("/")}
                >
                    Back to Dashboard
                </Button>
              </div>
          </footer>
      </div>
    </div>
  );
}
