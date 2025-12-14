"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CheckCircle, Circle, Timer, BookOpen, MessageCircle, SpellCheck, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const CATEGORIES = [
  { id: "vocabulary", label: "Vocabulary", icon: BookOpen },
  { id: "grammar", label: "Grammar", icon: SpellCheck },
  { id: "idioms", label: "Idioms", icon: MessageCircle },
  { id: "phrasal-verbs", label: "Phrasal Verbs", icon: Repeat },
  { id: "antonyms", label: "Antonyms", icon: Circle },
];

export default function TestPage() {
  const router = useRouter();
  const generateTest = useMutation(api.tests.generateTest);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(["vocabulary"]);
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const handleStartTest = async () => {
    if (selectedCategories.length === 0) return;

    setIsGenerating(true);
    try {
        const test = await generateTest({
            categories: selectedCategories,
            questionCount: questionCount
        });

        // Pass test data to the runner via localStorage or Context or URL params.
        // For security/cleanliness, URL params or Context is better.
        // But the questions list might be large.
        // We'll store it in sessionStorage for this MVP flow.
        sessionStorage.setItem("currentTest", JSON.stringify(test));
        router.push("/test/ongoing");
    } catch (err) {
        console.error("Failed to generate test", err);
        alert("Could not generate test. Please try again.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#101622] pb-24 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#101622]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center">
         <h1 className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white">New Test</h1>
      </header>

      <main className="p-4 flex-1 w-full max-w-md mx-auto space-y-6">

        {/* Categories */}
        <section>
            <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Select Categories</h3>
                <button
                    onClick={() => setSelectedCategories(CATEGORIES.map(c => c.id))}
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                    Select All
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    const Icon = cat.icon;
                    return (
                        <motion.div
                            key={cat.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleCategory(cat.id)}
                            className={cn(
                                "relative p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col gap-3",
                                isSelected
                                    ? "bg-blue-600/10 border-blue-600"
                                    : "bg-white dark:bg-[#1e2229] border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                            )}
                        >
                            <div className={cn("absolute top-3 right-3 transition-colors", isSelected ? "text-blue-600" : "text-slate-300 dark:text-slate-600")}>
                                {isSelected ? <CheckCircle size={20} className="fill-blue-600/20" /> : <Circle size={20} />}
                            </div>

                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                                isSelected ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                            )}>
                                <Icon size={20} />
                            </div>
                            <span className={cn("font-bold text-sm", isSelected ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400")}>
                                {cat.label}
                            </span>
                        </motion.div>
                    );
                })}
            </div>
        </section>

        {/* Settings */}
        <section className="bg-white dark:bg-[#1e2229] rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Timer className="text-blue-600" size={20} />
                    <span className="font-medium text-slate-900 dark:text-white">Time Limit</span>
                </div>
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-1 rounded">
                    Untimed (MVP)
                </span>
             </div>

             <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <BookOpen className="text-blue-600" size={20} />
                    <span className="font-medium text-slate-900 dark:text-white">Question Count</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    {[10, 20, 30, 50].map((count) => (
                        <button
                            key={count}
                            onClick={() => setQuestionCount(count)}
                            className={cn(
                                "py-2 rounded-lg text-sm font-bold border transition-all",
                                questionCount === count
                                    ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                                    : "bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                        >
                            {count}
                        </button>
                    ))}
                </div>
             </div>
        </section>

        <Button
            size="lg"
            className="w-full h-14 text-lg font-bold rounded-xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20"
            disabled={selectedCategories.length === 0 || isGenerating}
            onClick={handleStartTest}
        >
            {isGenerating ? "Preparing Test..." : "Start Test"}
        </Button>

      </main>

      <BottomNav />
    </div>
  );
}
