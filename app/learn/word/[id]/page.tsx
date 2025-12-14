"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Heart, BookOpen, Check, X } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function WordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const wordId = params.id as Id<"words">;

  // Optimistic UI state could be better, but we rely on Convex reactivity for now
  const word = useQuery(api.learn.getWord, { wordId });
  const toggleFavoriteMutation = useMutation(api.wordProgress.toggleFavorite);
  const updateStatusMutation = useMutation(api.wordProgress.updateStatus);


  const [isUpdating, setIsUpdating] = useState(false);

  if (word === undefined) {
      return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  if (word === null) {
      return <div className="h-screen flex items-center justify-center">Word not found</div>;
  }

  const handleFavorite = async () => {
      await toggleFavoriteMutation({ wordId });
  };

  const handleStatus = async (status: "learning" | "mastered") => {
      setIsUpdating(true);
      try {
          // If already mastered and clicking mastered, maybe toggle back to learning?
          // For now, strict setting.
          await updateStatusMutation({ wordId, status });
          router.push("/learn"); // Go back to list on completion? Or stay? UI mockup showed "Next" button.
          // In 'word-learning-page.html', known/unknown were bottom actions.
      } finally {
          setIsUpdating(false);
      }
  };


  const isFavorite = word.userProgress?.isFavorite;

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-[#101622] flex flex-col overflow-hidden no-scrollbar  relative font-sans">
      {/* Header */}
      <header className="shrink-0 pt-4 pb-2 px-4 flex items-center justify-between z-10">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="text-slate-600 dark:text-slate-300" />
        </Button>

        {/* Progress Dots Placeholder */}
        <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Studying</span>
        </div>

        <Button variant="ghost" size="icon" className="rounded-full" onClick={handleFavorite}>
            <Heart
                className={cn("transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-slate-600 dark:text-slate-300")}
            />
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-32 flex flex-col items-center w-full max-w-lg mx-auto no-scrollbar">
         {/* Word Hero */}
         <motion.div variants={slideUp} initial="initial" animate="animate" className="flex flex-col items-center justify-center w-full py-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center mb-2 capitalize">
                {word.text}
            </h1>
            <div className="flex items-center gap-3 bg-white dark:bg-[#1e2229] px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-white/5">
                <span className="text-blue-600 dark:text-blue-400 font-medium text-lg">
                    {word.pronunciation || "/.../"}
                </span>
                {/* Audio Icon Removed as per Request, or kept visual only? "No Audio" in request.
                    I'll remove the Volume button completely. */}
            </div>
         </motion.div>

         {/* Definition */}
         <motion.div variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.1 }} className="w-full bg-white dark:bg-[#1e2229] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/5 mb-4">
            <div className="flex items-center gap-2 mb-3">
                <BookOpen className="text-blue-600" size={16} />
                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Definition</h2>
            </div>
            <p className="text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {word.definition}
            </p>
         </motion.div>

         {/* Hindi Meanings */}
         {word.hindiSynonyms && word.hindiSynonyms.length > 0 && (
             <motion.div variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.15 }} className="w-full bg-orange-50 dark:bg-orange-900/10 rounded-2xl p-6 shadow-sm border border-orange-100 dark:border-orange-900/20 mb-4">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🇮🇳</span>
                    <h2 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Hindi Meaning</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                    {word.hindiSynonyms.map((mean, i) => (
                        <Button variant="outline" key={i} className="text-sm md:text-lg  text-slate-800 dark:text-slate-200 font-bold">
                            {mean}{i < word.hindiSynonyms!.length - 1 ? ", " : ""}
                        </Button>
                    ))}
                </div>
             </motion.div>
         )}

         {/* Example Sentence */}
         {word.examples && word.examples.length > 0 ? (
             <motion.div variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.2 }} className="w-full relative rounded-2xl bg-linear-to-br from-blue-600/10 to-blue-600/5 border border-blue-600/20 p-6 mb-4">
                 <div className="flex items-center gap-2 mb-4">
                    <span className="text-blue-600 material-symbols-outlined text-sm font-bold">&quot;</span>
                    <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Context</h2>
                 </div>
                 <div>
                    {word.examples.map((ex, i) => (
                        <div key={i} className="mb-2 last:mb-0">
                            <p className="text-base text-slate-800 dark:text-slate-100 leading-normal italic">
                                &quot;{ex.sentence}&quot;
                            </p>
                            {ex.translation && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {ex.translation}
                                </p>
                            )}
                        </div>
                    ))}
                 </div>
             </motion.div>
         ) : (
            <motion.div variants={fadeIn} initial="initial" animate="animate" transition={{ delay: 0.2 }} className="w-full mb-4">

            </motion.div>
         )}

         {/* Synonyms / Related */}
         {word.englishSynonyms && word.englishSynonyms.length > 0 && (
            <div className="w-full mb-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 px-1">Synonyms</h3>
                <div className="flex flex-wrap gap-2">
                    {word.englishSynonyms.map((syn, i) => (
                        <Button variant={"outline"}   key={i} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1e2229] border border-slate-200 dark:border-white/5 text-slate-700 font-bold dark:text-slate-200 text-sm">
                            {syn}
                        </Button>
                    ))}
                </div>
            </div>
         )}

         {/* Antonyms */}
         {word.antonyms && word.antonyms.length > 0 && (
            <div className="w-full mb-6 space-y-3">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 px-1">Antonyms</h3>
                <div className="flex flex-wrap gap-2">
                    {word.antonyms.map((ant, i) => (
                        <div key={i} className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium">
                            {ant}
                        </div>
                    ))}
                </div>
            </div>
         )}

      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-linear-to-t from-white via-white to-transparent dark:from-[#101622] dark:via-[#101622] pt-12">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
             <Button
                variant="outline"
                className="flex-1 h-12 rounded-xl border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                onClick={() => handleStatus("learning")}
                disabled={isUpdating}
             >
                <X className="mr-2" size={20} />
                Still Learning
             </Button>

             <Button
                className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25"
                onClick={() => handleStatus("mastered")}
                disabled={isUpdating}
             >
                <Check className="mr-2" size={20} />
                Mastered
             </Button>
        </div>
      </div>

    </div>
  );
}
