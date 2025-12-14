"use client";

import { Suspense, useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
// import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
import { WordListCard } from "@/components/WordListCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Menu, Filter } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

export default function LearnPage() {
    return (
        <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center text-zinc-500">Loading Vocabulary...</div>}>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { results, status, loadMore, isLoading } = usePaginatedQuery(
    api.learn.getWords,
    {
        category: category === "all" ? undefined : category,
        difficulty: difficulty === "all" ? undefined : difficulty,
        search: search === "" ? undefined : search,
    },
    { initialNumItems: 50 }
  );

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    router.replace(`/learn?category=${val}`);
  };

  return (
    <div className="flex min-h-screen bg-background text-zinc-200 font-sans selection:bg-indigo-500/30">
      <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />

      <main className="flex-1 flex flex-col min-w-0 pb-0">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between gap-4">
             <div className="flex items-center lg:hidden">
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
                    <Menu className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-1 max-w-md hidden md:flex relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                 <Input
                    className="pl-9 h-9 bg-zinc-900 border-zinc-700 text-sm"
                    placeholder="Search vocabulary..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

             <div className="flex items-center gap-2">
                 <Button variant="ghost" size="sm" className="hidden md:flex text-zinc-400 hover:text-white">
                    <Filter size={16} className="mr-2" />
                    Filters
                 </Button>
                  <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                     <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                        Library
                     </span>
                  </div>
            </div>
        </header>

        {/* Mobile Search & Filter Pills */}
        <div className="md:hidden px-4 py-3 space-y-3 bg-black/50 backdrop-blur-sm border-b border-zinc-800 sticky top-16 z-10">
            <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                 <Input
                    className="pl-9 h-10 bg-zinc-900 border-zinc-800"
                    placeholder="Search words..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

             {/* Scrolling Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-fade-sides">
                <button
                    onClick={() => handleCategoryChange("all")}
                    className={`flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap border transition-colors ${category === "all" ? "bg-indigo-600 text-white border-indigo-600" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}
                >
                    All
                </button>
                {["idioms", "phrasal-verbs", "proverbs", "synonyms", "antonyms"].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap border transition-colors ${category === cat ? "bg-indigo-600 text-white border-indigo-600" : "bg-zinc-900 border-zinc-800 text-zinc-400"}`}
                    >
                        {cat.replace("-", " ")}
                    </button>
                ))}
            </div>
        </div>

        {/* Word List */}
         <div className="flex-1 p-4 md:p-6 overflow-y-auto w-full max-w-2xl mx-auto space-y-4">
            {status === "LoadingFirstPage" ? (
                 <div className="flex flex-col gap-4">
                     {[1,2,3,4].map(i => (
                         <div key={i} className="h-32 bg-zinc-900 rounded-xl animate-pulse"></div>
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
                            hindiSynonyms={word.hindiSynonyms} // Ensure this prop exists in WordListCard or adapt as needed
                        />
                    ))}

                    {status === "CanLoadMore" && (
                        <Button
                            onClick={() => loadMore(20)}
                            disabled={isLoading}
                            className="w-full mt-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white"
                            variant="outline"
                        >
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Load More"}
                        </Button>
                    )}

                    {results?.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                             <Search size={48} className="mb-4 opacity-20" />
                             <p>No words found for this category.</p>
                        </div>
                    )}
                </>
            )}
        </div>

      </main>
    </div>
  );
}
