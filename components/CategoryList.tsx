"use client";

import { motion } from "framer-motion";
import { ChevronRight, BookOpen, Clock, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryItem {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    colorClass: string;
    href: string;
}

const CATEGORIES: CategoryItem[] = [
    {
        id: "vocab-old",
        title: "Vocab Old",
        subtitle: "Review your words",
        icon: Clock,
        colorClass: "bg-orange-500",
        href: "/learn?mode=review"
    },
    {
        id: "idioms",
        title: "Idioms",
        subtitle: "Master expressions",
        icon: MessageSquare,
        colorClass: "bg-blue-500",
        href: "/learn?category=idioms"
    },
    {
        id: "ore-idioms",
        title: "More Idioms",
        subtitle: "Advanced phrases",
        icon: Plus,
        colorClass: "bg-purple-500",
        href: "/learn?category=phrasal-verbs" // Mapping 'Ore idioms' to Phrasal Verbs or similar
    }
];

export function CategoryList() {
    return (
        <div className="flex flex-col gap-3">
            {CATEGORIES.map((cat, i) => (
                <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Link
                        href={cat.href}
                        className="group flex items-center justify-between p-4 bg-white dark:bg-[#1e2229] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-blue-500/50 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className={cn("flex items-center justify-center h-12 w-12 rounded-full text-white", cat.colorClass)}>
                                <cat.icon size={22} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                                    {cat.title}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {cat.subtitle}
                                </span>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" size={20} />
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
