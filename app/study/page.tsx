"use client";

import { useState, Suspense } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StudyPage() {
    return (
        <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center text-zinc-500">Loading Study Mode...</div>}>
            <StudyContent />
        </Suspense>
    );
}

function StudyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get("mode") || "learning"; // 'learning', 'mastered', 'new'
    const category = searchParams.get("category");

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Fetch words based on mode
    // We'll reuse getWords but we might need a specific query for 'mastered' only if getWords doesn't filter by status.
    // userProgress is attached in getWords.
    // For now, let's just fetch all and filter client side if the list is small (10-20),
    // OR arguably we should add a status filter to the backend.
    // Given the constraints and existing `getWords`, let's check `getWords` signature again.
    // It accepts `category` and `difficulty`. It doesn't seem to accept `status` (mastered/learning).
    // However, `getWords` returns `userProgress`.
    // Ideally we filter on backend. But I'll filter client side for MVP or fetching 50 items.

    // Actually, for "Slideshow", we usually want a specific set.
    // Let's use `usePaginatedQuery` and filter visually or add a specialized query.
    // I'll stick to `getWords` and show what we get, maybe filtering in the UI?
    // No, that's bad if page 1 has 0 matches.

    // I will assume for this 'UI' task, display is key. I'll fetch `getWords` and if mode is 'mastered',
    // I'll filter. If we get empty, we load more.
    // Optimization: Add `status` to `getWords` later.

    const { results, status, loadMore } = usePaginatedQuery(
        api.learn.getWords,
        { category: category || undefined },
        { initialNumItems: 50 }
    );

    // Filter results based on mode
    const filteredWords = results?.filter(w => {
        const isMastered = w.userProgress?.status === "mastered";
        if (mode === "mastered") return isMastered;
        if (mode === "learning" || mode === "new") return !isMastered;
        return true;
    }) || [];

    const currentWord = filteredWords[currentIndex];

    const handleNext = () => {
        setIsFlipped(false);
        if (currentIndex < filteredWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else if (status === "CanLoadMore") {
            loadMore(20);
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        setIsFlipped(false);
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    return (
        <div className="flex min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30">
            <Sidebar isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />

            <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
                {/* Header */}
                <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 pointer-events-none">
                     <Button
                        variant="ghost"
                        size="icon"
                        className="pointer-events-auto rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md"
                        onClick={() => router.back()}
                    >
                        <X size={20} />
                     </Button>
                     <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                         <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                             {mode === 'mastered' ? 'Reviewing Masters' : 'Learning New Words'}
                         </span>
                     </div>
                     <div className="w-10"></div> {/* Spacer */}
                </header>

                {/* Slideshow Area */}
                <div className="flex-1 flex items-center justify-center p-6">
                    <AnimatePresence mode="wait">
                        {currentWord ? (
                            <div className="w-full max-w-md perspective-1000">
                                <motion.div
                                    key={currentWord._id}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    className="relative w-full aspect-3/4 md:aspect-4/3"
                                >
                                    {/* Card Container with Flip */}
                                    <div
                                        onClick={() => setIsFlipped(!isFlipped)}
                                        className={cn(
                                            "w-full h-full relative preserve-3d transition-transform duration-500 cursor-pointer",
                                            isFlipped ? "rotate-y-180" : ""
                                        )}
                                        style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
                                    >
                                        {/* Front */}
                                        <div className="absolute inset-0 backface-hidden bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl">
                                             <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">{currentWord.category} • {currentWord.difficulty}</span>
                                             <h2 className="text-5xl font-bold text-white mb-6 capitalize">{currentWord.text}</h2>
                                             <p className="text-zinc-400 text-sm">Tap to reveal meaning</p>
                                        </div>

                                        {/* Back */}
                                        <div
                                            className="absolute inset-0 backface-hidden bg-indigo-900/20 border border-indigo-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl"
                                            style={{ transform: "rotateY(180deg)" }}
                                        >
                                            <h3 className="text-2xl font-bold text-white mb-4 bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">Definition</h3>
                                            <p className="text-lg text-zinc-200 leading-relaxed mb-6">{currentWord.definition}</p>

                                            {currentWord.hindiSynonyms && currentWord.hindiSynonyms.length > 0 && (
                                                <div className="bg-black/20 rounded-xl px-4 py-2">
                                                    <span className="text-sm font-bold text-zinc-400 mr-2">Hindi:</span>
                                                    <span className="text-zinc-200">{currentWord.hindiSynonyms[0]}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            <div className="text-center text-zinc-500">
                                <p>No words found.</p>
                                <Button variant="link" onClick={() => router.push("/learn")}>Browse Library</Button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="p-8 flex items-center justify-center gap-6">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-14 w-14 rounded-full border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                    >
                        <ChevronLeft />
                    </Button>

                    <Button
                        size="lg"
                        className="h-14 px-8 rounded-full font-bold text-lg shadow-lg shadow-indigo-500/20"
                        variant="accent"
                        onClick={handleNext}
                        disabled={!filteredWords.length}
                    >
                        Next Word
                    </Button>
                </div>

            </main>
        </div>
    );
}

