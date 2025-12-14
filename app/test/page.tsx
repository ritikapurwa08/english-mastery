"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar"; // Assuming Sidebar is global now? Or reusing Home layout?
// For this rewrite, I'll assume we wrap in a similar layout or just use standalone page with Sidebar.
// The user asked for "Website Modification", likely implying a shared layout.
// But for now, let's keep it simple and include Sidebar if possible, or just the content.
// The Home page imports Sidebar. Let's do the same here for consistency.

import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Timer, BookOpen, MessageCircle, SpellCheck, Repeat, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

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
  const user = useQuery(api.users.viewer);
  const firstName = user?.name?.split(' ')[0] || 'User';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="flex min-h-screen bg-background text-zinc-200 font-sans selection:bg-indigo-500/30">
       <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />

       <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-0 relative">
          {/* Header */}
            <header className="h-16 border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
                <div className="flex items-center lg:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>

                <h1 className="text-lg font-bold text-white hidden md:block">New Test</h1>

                <div className="flex items-center space-x-4 ml-auto">
                    <Link href="/profile" className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                        {firstName.slice(0, 2)}
                    </Link>
                </div>
            </header>

          <div className="flex-1 p-6 overflow-y-auto w-full max-w-md mx-auto space-y-8">

            {/* Categories Selection */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Select Categories</h3>
                    <button
                        onClick={() => setSelectedCategories(CATEGORIES.map(c => c.id))}
                        className="text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider"
                    >
                        Select All
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategories.includes(cat.id);
                        const Icon = cat.icon;
                        return (
                            <div
                                key={cat.id}
                                onClick={() => toggleCategory(cat.id)}
                                className={cn(
                                    "cursor-pointer group flex items-center justify-between p-4 border rounded-xl shadow-sm transition-all active:scale-[0.98]",
                                    isSelected
                                        ? "bg-indigo-600/10 border-indigo-600 shadow-indigo-500/10"
                                        : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "flex items-center justify-center h-10 w-10 rounded-lg transition-colors",
                                        isSelected ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400"
                                    )}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="text-left">
                                        <h4 className={cn("text-sm font-bold", isSelected ? "text-white" : "text-zinc-300")}>{cat.label}</h4>
                                        <p className="text-xs text-zinc-500">Practice {cat.label.toLowerCase()}</p>
                                    </div>
                                </div>
                                {isSelected ? (
                                    <CheckCircle2 className="text-indigo-500" size={20} />
                                ) : (
                                    <Circle className="text-zinc-700 group-hover:text-zinc-500" size={20} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Test Settings */}
            <section className="bg-zinc-900/40 rounded-xl p-5 border border-zinc-800 space-y-6">
                 <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Timer className="text-indigo-500" size={20} />
                            <span className="font-bold text-white">Time Limit</span>
                        </div>
                        <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                            Untimed
                        </span>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="text-indigo-500" size={20} />
                        <span className="font-bold text-white">Question Count</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {[10, 20, 30, 50].map((count) => (
                            <button
                                key={count}
                                onClick={() => setQuestionCount(count)}
                                className={cn(
                                    "py-2.5 rounded-lg text-sm font-bold border transition-all",
                                    questionCount === count
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20"
                                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                                )}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                 </div>
            </section>

          </div>

          {/* Sticky Start Button area */}
          <div className="sticky bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black via-black to-transparent z-10 w-full max-w-md mx-auto">
             <Button
                variant="accent"
                className="w-full h-14 text-base font-bold shadow-xl shadow-indigo-500/20"
                disabled={selectedCategories.length === 0 || isGenerating}
                onClick={handleStartTest}
                isLoading={isGenerating}
            >
                {isGenerating ? "Generating..." : "Start Test"}
            </Button>
          </div>

       </main>
    </div>
  );
}
