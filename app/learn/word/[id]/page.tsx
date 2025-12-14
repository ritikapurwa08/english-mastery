"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, BookOpen, Check, X } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function WordDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const wordId = params.id as Id<"words">;

  const category = searchParams.get("category") || undefined;
  const difficulty = searchParams.get("difficulty") || undefined;

  const word = useQuery(api.learn.getWord, { wordId });
  const nextWordId = useQuery(api.learn.getNextWord, {
      currentWordId: wordId,
      category,
      difficulty
  });

  const toggleFavoriteMutation = useMutation(api.wordProgress.toggleFavorite);
  const updateStatusMutation = useMutation(api.wordProgress.updateStatus);

  const [isUpdating, setIsUpdating] = useState(false);

  if (word === undefined) {
      return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Loading Word...</div>;
  }

  if (word === null) {
      return <div className="h-screen bg-black flex items-center justify-center text-zinc-500">Word not found</div>;
  }

  const handleFavorite = async () => {
      await toggleFavoriteMutation({ wordId });
  };

  const handleStatus = async (status: "learning" | "mastered") => {
      setIsUpdating(true);
      try {
          await updateStatusMutation({ wordId, status });

          if (nextWordId) {
             let url = `/learn/word/${nextWordId}?`;
             if (category) url += `category=${category}&`;
             if (difficulty) url += `difficulty=${difficulty}`;
             router.replace(url);
          } else {
             router.push("/learn"); // No more words, back to list
          }
      } finally {
          setIsUpdating(false);
      }
  };


  const isFavorite = word.userProgress?.isFavorite;

  return (
    <div className="h-screen w-full bg-black text-zinc-100 flex flex-col overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="shrink-0 pt-6 pb-2 px-6 flex items-center justify-between z-10 bg-black/50 backdrop-blur-md sticky top-0">
        <Button variant="ghost" size="icon" className="rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={() => router.back()}>
            <ArrowLeft />
        </Button>

        {/* Categories Pill */}
        <div className="flex flex-col items-center">
            <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                {word.category}
            </span>
        </div>

        <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-800" onClick={handleFavorite}>
            <Heart
                className={cn("transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-zinc-600 hover:text-red-400")}
            />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 pb-32 flex flex-col items-center w-full max-w-lg mx-auto no-scrollbar">
         {/* Word Hero */}
         <motion.div variants={slideUp} initial="initial" animate="animate" className="flex flex-col items-center justify-center w-full py-10">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight text-center mb-4 capitalize">
                {word.text}
            </h1>
            <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800 shadow-lg shadow-indigo-500/10">
                <span className="text-indigo-400 font-medium text-lg font-mono">
                    {word.pronunciation || "/.../"}
                </span>
            </div>
         </motion.div>

         {/* Definition */}
         <motion.div variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.1 }} className="w-full bg-zinc-900/60 rounded-2xl p-8 shadow-sm border border-zinc-800 mb-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4">
                <BookOpen className="text-indigo-500" size={18} />
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Definition</h2>
            </div>
            <p className="md:text-xl text-base  text-zinc-200 font-medium leading-relaxed">
                {word.definition}
            </p>
         </motion.div>

         {/* Hindi Meanings */}
         {word.hindiSynonyms && word.hindiSynonyms.length > 0 && (
             <motion.div variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.15 }} className="w-full bg-zinc-900/60 rounded-2xl p-8 shadow-sm border border-zinc-800 mb-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg grayscale opacity-70">🇮🇳</span>
                    <h2 className="text-xs font-bold text-orange-400 uppercase tracking-wider">Hindi Meaning</h2>
                </div>
                <div className="flex flew-row overflow-x-auto no-scrollbar  gap-2">
                    {word.hindiSynonyms.map((mean, i) => (
                        <div key={i} className="px-3 py-1.5 rounded-lg  bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-medium min-w-fit   md:text-lg ">
                            {mean}
                        </div>
                    ))}
                </div>
                         {/* Synonyms / Related */}
                 {word.englishSynonyms && word.englishSynonyms.length > 0 && (
            <div className="w-full mb-4 space-y-3 pt-4 border-t border-zinc-900">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide px-1">Synonyms</h3>
                <div className="flex flex-row w-full  overflow-x-auto no-scrollbar gap-2">
                    {word.englishSynonyms.map((syn, i) => (
                        <div key={i} className="px-3 py-1.5 min-w-fit  rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-medium w-auto ">
                            {syn}
                        </div>
                    ))}
                </div>
            </div>
         )}
             </motion.div>
         )}

         {/* Example Sentence */}
         {word.examples && word.examples.length > 0 && (
             <motion.div variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.2 }} className="w-full bg-zinc-900/60 rounded-2xl p-8 shadow-sm border border-zinc-800 mb-4 backdrop-blur-sm">
                 <div className="flex items-center gap-2 mb-4">
                    <span className="text-indigo-500 text-lg font-bold leading-none">&quot;</span>
                    <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Context</h2>
                 </div>
                 <div className="space-y-4">
                    {word.examples.map((ex, i) => (
                        <div key={i}>
                            <p className="text-base  text-white leading-normal  font-bold">
                                {ex.sentence}
                            </p>
                            {ex.translation && (
                                <p className="text-sm text-zinc-500 mt-2 pl-4 border-l-2 border-zinc-800">
                                    {ex.translation}
                                </p>
                            )}
                        </div>
                    ))}
                 </div>
             </motion.div>
         )}




         {/* Antonyms */}
         {word.antonyms && word.antonyms.length > 0 && (
            <div className="w-full mb-6 space-y-3">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide px-1">Antonyms</h3>
                <div className="flex flex-wrap gap-2">
                    {word.antonyms.map((ant, i) => (
                        <div key={i} className="px-3 py-1.5 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 text-sm font-medium">
                            {ant}
                        </div>
                    ))}
                </div>
            </div>
         )}

      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black via-black to-transparent pt-20 z-20">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
             <Button
                variant="outline"
                className="flex-1 h-14 rounded-2xl border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all hover:border-zinc-700"
                onClick={() => handleStatus("learning")}
                disabled={isUpdating}
             >
                <X className="mr-2" size={18} />
                Still Learning
             </Button>

             <Button
                className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 border border-indigo-500"
                onClick={() => handleStatus("mastered")}
                disabled={isUpdating}
             >
                <Check className="mr-2" size={18} />
                Mastered
             </Button>
        </div>
      </div>

    </div>
  );
}
