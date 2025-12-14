"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Timer, Pause, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [startTime] = useState(() => Date.now());
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);

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
    if (selectedOption) return; // prevent multiple clicks
    setSelectedOption(option);
  };

  const currentQuestion = testData?.questions[currentIndex];

  const handleNext = async () => {
    if (!currentQuestion) return;

    // Record Result
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    const newMistakes = isCorrect ? mistakes : [...mistakes, {
        wordId: currentQuestion.wordId,
        question: currentQuestion.question,
        userAnswer: selectedOption || "Skipped",
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation,
    }];

    setScore(newScore);
    setMistakes(newMistakes);
    setSelectedOption(null);

    if (testData && currentIndex < testData.questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
    } else {
        // Test Finished
        finishTest(newScore, newMistakes);
    }
  };

  const finishTest = async (finalScore: number, finalMistakes: Mistake[]) => {
      if (!testData) return;

      const duration = Math.floor((Date.now() - startTime) / 1000);
      const percentage = Math.round((finalScore / testData.questions.length) * 100);

      // Calculate Category Breakdown
      const cats: Record<string, { total: number; correct: number }> = {};
      testData.questions.forEach((q) => {
          const cat = q.category || "General";
          if (!cats[cat]) cats[cat] = { total: 0, correct: 0 };
          cats[cat].total++;

          // Check if this specific question index was answered correctly
          // We don't have per-question correctness in the 'mistakes' array easily without ID.
          // Better: We tracked finalScore, but we need per-question result.
          // Retroactive check: if NOT in mistakes, it is correct.
          const isWrong = finalMistakes.some(m => m.question === q.question);
          if (!isWrong) {
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
      }
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!testData || !currentQuestion) return <div className="h-screen flex items-center justify-center">Loading Test...</div>;

  const progress = ((currentIndex + 1) / testData.questions.length) * 100;

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-[#101622] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-6 py-5 bg-white dark:bg-[#101622] z-20 border-b border-slate-100 dark:border-slate-800">
        <Button variant="ghost" size="icon" className="rounded-full">
            <Pause className="text-slate-500" />
        </Button>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-[#1e2229]">
            <Timer className="text-slate-500" size={16} />
            <span className="text-slate-900 dark:text-white font-bold tabular-nums">{formatTime(timer)}</span>
        </div>
        <button className="text-red-500 font-bold text-sm" onClick={() => router.push("/test")}>End</button>
      </header>

      {/* Progress */}
      <div className="shrink-0 px-6 pb-2 pt-2 bg-white dark:bg-[#101622]">
         <div className="flex justify-between mb-2 text-sm font-medium">
            <span className="text-slate-500">Question {currentIndex + 1} of {testData.questions.length}</span>
            <span className="text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 rounded text-xs py-0.5">{currentQuestion.category || "General"}</span>
         </div>
         <div className="h-2 w-full bg-slate-100 dark:bg-[#1e2229] rounded-full overflow-hidden">
             <motion.div
                className="h-full bg-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
             />
         </div>
      </div>

      {/* Question */}
      <main className="flex-1 flex flex-col px-6 py-4 overflow-y-auto w-full max-w-md mx-auto">
         <div className="mt-4 mb-8 flex-1 flex flex-col justify-center min-h-40">
             <div className="bg-white dark:bg-[#1e2229] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                 <h1 className="text-slate-900 dark:text-white text-xl font-bold mb-4">{currentQuestion.question}</h1>
             </div>
         </div>

         {/* Options */}
         <div className="flex flex-col gap-3 pb-20">
            {currentQuestion.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                return (
                    <button
                        key={i}
                        onClick={() => handleSelect(opt)}
                        className={cn(
                            "relative w-full flex items-center gap-4 p-4 min-h-18 rounded-xl text-left border-2 transition-all active:scale-[0.99]",
                            isSelected
                                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                : "border-transparent bg-white dark:bg-[#1e2229] hover:bg-slate-50 dark:hover:bg-[#252b36]"
                        )}
                    >
                        <div className={cn(
                            "shrink-0 flex items-center justify-center size-8 rounded-lg text-sm font-bold transition-colors",
                            isSelected ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                        )}>
                            {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-slate-700 dark:text-slate-200 font-medium leading-normal">{opt}</span>
                    </button>
                );
            })}
         </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-linear-to-t from-white via-white to-transparent dark:from-[#101622] dark:via-[#101622] pt-12 z-10">
          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20"
            disabled={!selectedOption}
            onClick={handleNext}
          >
            <span>{currentIndex === testData.questions.length - 1 ? "Finish Test" : "Next Question"}</span>
            <ArrowRight className="ml-2" />
          </Button>
      </footer>
    </div>
  );
}
