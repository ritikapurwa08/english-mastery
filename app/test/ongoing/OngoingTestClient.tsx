"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Timer, Pause, ArrowRight, ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Sidebar } from "@/components/Sidebar";

type Mistake = {
    wordId: Id<"words">;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    explanation?: string;
};

type Question = {
    wordId: Id<"words">;
    word: string;
    type: string;
    question: string;
    correctAnswer: string;
    options: string[];
    explanation?: string;
};

type TestData = {
    testId: string;
    questions: (Question & { category?: string })[];
};

export default function OngoingTestClient() {
  const router = useRouter();
  const submitResult = useMutation(api.tests.submitResult);

  // Initialize directly from sessionStorage (Client-side only component)
  const [testData] = useState<TestData | null>(() => {
    try {
        const stored = sessionStorage.getItem("currentTest");
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse test data", e);
    }
    return null;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({}); // valid selection
  const [startTime] = useState(() => Date.now());
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // If no data, redirect
    if (!testData) {
        router.push("/test");
        return;
    }

    // Start Timer
    timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
    }, 1000);

    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testData, router]);

  const handleSelect = (option: string) => {
    setAnswers(prev => ({
        ...prev,
        [currentIndex]: option
    }));
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (!testData) return;
    if (currentIndex < testData.questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
    } else {
        // Finish
        finishTest();
    }
  };

  const finishTest = async () => {
      if (!testData || isSubmitting) return;
      setIsSubmitting(true);

      const duration = Math.floor((Date.now() - startTime) / 1000);

      let finalScore = 0;
      const finalMistakes: Mistake[] = [];

      // Calculate Score
      testData.questions.forEach((q, idx) => {
          const userAnswer = answers[idx];
          const isCorrect = userAnswer === q.correctAnswer;

          if (isCorrect) {
              finalScore++;
          } else {
              finalMistakes.push({
                  wordId: q.wordId,
                  question: q.question,
                  userAnswer: userAnswer || "Skipped",
                  correctAnswer: q.correctAnswer,
                  explanation: q.explanation,
              });
          }
      });

      const percentage = Math.round((finalScore / testData.questions.length) * 100);

      // Calculate Category Breakdown
      const cats: Record<string, { total: number; correct: number }> = {};
      testData.questions.forEach((q, idx) => {
          const cat = q.category || "General";
          if (!cats[cat]) cats[cat] = { total: 0, correct: 0 };
          cats[cat].total++;

          const userAnswer = answers[idx];
          if (userAnswer === q.correctAnswer) {
              cats[cat].correct++;
          }
      });

      const categoryBreakdown = Object.entries(cats).map(([category, stats]) => ({
          category,
          correct: stats.correct,
          total: stats.total
      }));

      try {
        const resultId = await submitResult({
            score: percentage,
            totalQuestions: testData.questions.length,
            correctCount: finalScore,
            duration: duration,
            mistakes: finalMistakes,
            categoryBreakdown
        });

        sessionStorage.setItem("testResult", JSON.stringify({
            score: percentage,
            correctCount: finalScore,
            total: testData.questions.length,
            mistakes: finalMistakes,
            resultId
        }));

        router.push("/test/result");
      } catch (err) {
          console.error("Submission failed", err);
          alert("Failed to save results. Check console.");
          setIsSubmitting(false);
      }
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!testData?.questions || testData.questions.length === 0) {
      return (
          <div className="h-screen bg-black flex flex-col items-center justify-center text-zinc-400 gap-4">
              <p>No questions could be generated for the selected categories.</p>
              <Button variant="outline" onClick={() => router.push("/test")}>Go Back</Button>
          </div>
      );
  }

  const currentQuestion = testData.questions[currentIndex];
  // Calculate Progress: (answered count / total) * 100
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / testData.questions.length) * 100;

  const currentAnswer = answers[currentIndex];
  const isInLastQuestion = currentIndex === testData.questions.length - 1;

  return (
    <div className="flex min-h-screen bg-background text-zinc-200 font-sans selection:bg-indigo-500/30">
       <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />

       <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Header */}
          <header className="shrink-0 flex items-center justify-between px-6 py-5 bg-black/50 backdrop-blur-md z-20 border-b border-zinc-800">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                    <div className="w-5 h-5 flex flex-col justify-center gap-1.5">
                        <span className="w-full h-0.5 bg-zinc-400 rounded-full" />
                        <span className="w-full h-0.5 bg-zinc-400 rounded-full" />
                    </div>
                </Button>
                <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
                    <Timer className="text-zinc-500" size={16} />
                    <span className="text-zinc-200 font-bold tabular-nums">{formatTime(timer)}</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                 <span className="text-sm font-medium text-zinc-500 hidden sm:inline">
                    Question {currentIndex + 1} of {testData.questions.length}
                 </span>
                 <button className="text-red-500 hover:text-red-400 font-bold text-sm uppercase tracking-wider px-3" onClick={() => router.push("/test")}>
                    End Test
                 </button>
            </div>
          </header>

          {/* Progress Line */}
          <div className="h-1 w-full bg-zinc-900">
             <motion.div
                className="h-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
             />
          </div>

          {/* Question Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-32">
             <div className="max-w-3xl mx-auto space-y-8 mt-4 md:mt-10">

                {/* Question Card */}
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                            {currentQuestion.category || "General"}
                        </span>
                    </div>
                    <AnimatePresence mode="wait">
                        <motion.h1
                            key={currentIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-2xl md:text-3xl font-display font-medium text-white text-center leading-relaxed"
                        >
                            {currentQuestion.question}
                        </motion.h1>
                    </AnimatePresence>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 gap-3 md:gap-4 max-w-2xl mx-auto">
                    {currentQuestion.options.map((opt, i) => {
                        const isSelected = currentAnswer === opt;
                        return (
                            <button
                                key={i}
                                onClick={() => handleSelect(opt)}
                                className={cn(
                                    "relative group w-full flex items-center gap-4 p-4 md:p-5 rounded-xl text-left border transition-all duration-200 active:scale-[0.99]",
                                    isSelected
                                        ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                                        : "border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 hover:border-zinc-700"
                                )}
                            >
                                <div className={cn(
                                    "shrink-0 flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold transition-colors border",
                                    isSelected
                                        ? "bg-indigo-600 border-indigo-500 text-white"
                                        : "bg-zinc-800 border-zinc-700 text-zinc-500 group-hover:text-zinc-300"
                                )}>
                                    {String.fromCharCode(65 + i)}
                                </div>
                                <span className={cn(
                                    "font-medium leading-normal text-base md:text-lg",
                                    isSelected ? "text-white" : "text-zinc-300 group-hover:text-zinc-100"
                                )}>{opt}</span>
                                {isSelected && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                                        <CheckCircle2 className="text-indigo-500 w-6 h-6" />
                                    </motion.div>
                                )}
                            </button>
                        );
                    })}
                </div>

             </div>
          </div>

          {/* Footer Controls */}
          <footer className="fixed bottom-0 left-0 right-0 md:left-64 p-6 bg-linear-to-t from-black via-black to-transparent z-10">
              <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="h-12 w-32 border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white"
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Previous
                  </Button>

                  <Button
                    variant={isInLastQuestion ? (isSubmitting ? "outline" : "accent") : "outline"}
                    className={cn(
                        "h-12 min-w-32 text-base font-bold shadow-lg transition-all",
                        currentAnswer
                            ? (isInLastQuestion ? "bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-indigo-500/20" : "bg-white text-black hover:bg-zinc-200 border-transparent")
                            : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    )}
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    <span>{isInLastQuestion ? (isSubmitting ? "Submitting..." : "Finish Test") : "Next"}</span>
                    {!isInLastQuestion && <ArrowRight className="ml-2 w-4 h-4" />}
                  </Button>
              </div>
          </footer>
       </main>
    </div>
  );
}


