"use client";

import { Suspense, useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BottomNav } from "@/components/BottomNav";
import { WordListCard } from "@/components/WordListCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

export default function LearnPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center text-slate-500">Loading Vocabulary...</div>}>
            <LearnPageContent />
        </Suspense>
    );
}

function LearnPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filters from URL or State
  const initialCategory = searchParams.get("category") || "all";
  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState("all");
  const [search, setSearch] = useState("");

  const { results, status, loadMore, isLoading } = usePaginatedQuery(
    api.learn.getWords,
    {
        category: category === "all" ? undefined : category,
        difficulty: difficulty === "all" ? undefined : difficulty,
    },
    { initialNumItems: 10 }
  );

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    router.replace(`/learn?category=${val}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#101622] pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#101622]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Vocabulary</h1>
            <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30">
                 <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Library
                 </span>
            </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                    className="pl-9 bg-slate-100 dark:bg-[#192233] border-none"
                    placeholder="Search words..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            {/* Mobile Filter Trigger (could be a Sheet, but sticking to simple dropdowns for now) */}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 no-scrollbar mask-fade-sides">
            <button
                onClick={() => handleCategoryChange("all")}
                className={`flex items-center px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${category === "all" ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-[#1e2229] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"}`}
            >
                All
            </button>
            {["idioms", "phrasal-verbs", "proverbs"].map((cat) => (
                <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`capitalize flex items-center px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${category === cat ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-[#1e2229] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"}`}
                >
                    {cat.replace("-", " ")}
                </button>
            ))}
        </div>
      </header>

      {/* List */}
      <main className="p-4 space-y-4 max-w-md mx-auto">
        {status === "LoadingFirstPage" ? (
             <div className="flex flex-col gap-4">
                 {[1,2,3,4].map(i => (
                     <div key={i} className="h-32 bg-slate-200 dark:bg-[#1e2229] rounded-xl animate-pulse"></div>
                 ))}
             </div>
        ) : (
            <>
                {results?.map((word, i) => (
                    <WordListCard
                        key={word._id}
                        index={i}
                        id={word._id}
                        text={word.text}
                        definition={word.definition}
                        category={word.category}
                        difficulty={word.difficulty}
                        userProgress={word.userProgress}
                        hindiSynonyms={word.hindiSynonyms}
                    />
                ))}

                {status === "CanLoadMore" && (
                    <Button
                        onClick={() => loadMore(20)}
                        disabled={isLoading}
                        className="w-full mt-4"
                        variant="outline"
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Load More"}
                    </Button>
                )}

                {results?.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        No words found for this category.
                    </div>
                )}
            </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
