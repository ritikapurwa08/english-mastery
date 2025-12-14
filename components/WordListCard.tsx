"use client";

import { motion } from "framer-motion";
import { Volume2, CheckCircle, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface WordListCardProps {
  id: Id<"words">;
  text: string;
  definition: string;
  category: string;
  difficulty: string;
  hindiSynonyms?: string[];
  userProgress?: {
      status: "new" | "learning" | "mastered";
      isFavorite?: boolean;
  } | null;
  index: number;
}

export function WordListCard({ id, text, definition, category, difficulty, hindiSynonyms, userProgress, index }: WordListCardProps) {
  const toggleFavorite = useMutation(api.wordProgress.toggleFavorite);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({ wordId: id });
  };

  const isFavorite = userProgress?.isFavorite;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="group relative bg-zinc-900/40 rounded-xl p-4 shadow-sm border border-zinc-800 hover:border-indigo-500/50 transition-all cursor-pointer"
    >
      <Link href={`/learn/word/${id}`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-zinc-100 capitalize">{text}</h3>
            <span className="text-xs text-zinc-500 italic capitalize">{category} • {difficulty}</span>
          </div>

          <button
            onClick={handleFavorite}
            className="p-1.5 rounded-full hover:bg-zinc-800 transition-colors z-10"
          >
             <Heart
              size={20}
              className={cn(
                "transition-colors",
                isFavorite ? "fill-red-500 text-red-500" : "text-zinc-600 hover:text-red-400"
              )}
             />
          </button>
        </div>

        <p className="text-sm text-zinc-400 mb-2 line-clamp-2">
          {definition}
        </p>

        {hindiSynonyms && hindiSynonyms.length > 0 && (
          <p className="text-sm text-zinc-500 mb-3 line-clamp-1 italic">
             <span className="font-semibold text-zinc-600 mr-1">Hindi:</span>
             {hindiSynonyms[0]}
             {hindiSynonyms.length > 1 && <span className="text-xs ml-1">+{hindiSynonyms.length - 1} more</span>}
          </p>
        )}

        <div className="flex items-center justify-between mt-2 pt-3 border-t border-zinc-800 border-dashed">
            <div className="flex items-center gap-2">
                 {/* Difficulty Badge */}
                 <span className={cn(
                     "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                     difficulty === "Hard" || difficulty === "C1" || difficulty === "C2" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                     difficulty === "Medium" || difficulty === "B1" || difficulty === "B2" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                     "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                 )}>
                    {difficulty}
                 </span>

                 {userProgress?.status === "mastered" && (
                   <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
                     <CheckCircle size={12} /> Mastered
                   </span>
                 )}
            </div>

            <ArrowRight size={16} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
        </div>
      </Link>
    </motion.div>
  );
}
