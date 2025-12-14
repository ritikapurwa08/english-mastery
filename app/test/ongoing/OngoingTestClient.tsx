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

  if (!testData || !currentQuestion) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Loading Test...</div>;

  const progress = ((currentIndex + 1) / testData.questions.length) * 100;

  return (
    <div className="h-screen w-full bg-black text-zinc-100 flex flex-col font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-6 py-5 bg-black/50 backdrop-blur-md z-20 border-b border-zinc-800">
        <Button variant="ghost" size="icon" className="rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800">
            <Pause />
        </Button>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
            <Timer className="text-zinc-500" size={16} />
            <span className="text-zinc-200 font-bold tabular-nums">{formatTime(timer)}</span>
        </div>
        <button className="text-red-500 hover:text-red-400 font-bold text-sm uppercase tracking-wider" onClick={() => router.push("/test")}>End</button>
      </header>

      {/* Progress */}
      <div className="shrink-0 px-6 pb-2 pt-4 bg-black">
         <div className="flex justify-between mb-2 text-sm font-medium">
            <span className="text-zinc-500">Question {currentIndex + 1} of {testData.questions.length}</span>
            <span className="text-indigo-400 bg-indigo-500/10 px-2 rounded-md text-xs py-1 border border-indigo-500/20">{currentQuestion.category || "General"}</span>
         </div>
         <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
             <motion.div
                className="h-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
             />
         </div>
      </div>

      {/* Question */}
      <main className="flex-1 flex flex-col px-6 py-4 overflow-y-auto w-full max-w-md mx-auto">
         <div className="mt-4 mb-8 flex-1 flex flex-col justify-center min-h-32">
             <div className="p-1">
                 <h1 className="text-white text-2xl font-bold leading-relaxed text-center">{currentQuestion.question}</h1>
             </div>
         </div>

         {/* Options */}
         <div className="flex flex-col gap-3 pb-24">
            {currentQuestion.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                return (
                    <button
                        key={i}
                        onClick={() => handleSelect(opt)}
                        className={cn(
                            "relative w-full flex items-center gap-4 p-4 min-h-16 rounded-xl text-left border transition-all active:scale-[0.98]",
                            isSelected
                                ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                                : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-700"
                        )}
                    >
                        <div className={cn(
                            "shrink-0 flex items-center justify-center size-8 rounded-lg text-sm font-bold transition-colors border",
                            isSelected
                                ? "bg-indigo-600 border-indigo-500 text-white"
                                : "bg-zinc-800 border-zinc-700 text-zinc-400"
                        )}>
                            {String.fromCharCode(65 + i)}
                        </div>
                        <span className={cn(
                            "font-medium leading-normal",
                            isSelected ? "text-white" : "text-zinc-300"
                        )}>{opt}</span>
                    </button>
                );
            })}
         </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black via-black to-transparent z-10">
          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold rounded-xl"
            variant={selectedOption ? "accent" : "outline"}
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
