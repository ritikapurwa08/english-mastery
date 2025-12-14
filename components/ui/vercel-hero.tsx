"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VercelHero() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex min-h-[80vh] w-full flex-col items-center justify-center bg-black px-4 py-20"
    >

      {/* 1. The Small "Badge" Text (Mono & Subtle) */}
      <motion.span
        variants={fadeIn}
        className="mb-8 inline-block rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1 text-xs font-medium text-neutral-300 backdrop-blur-3xl font-mono"
      >
        New: Gemini 2.0 Integration
      </motion.span>

      {/* 2. The Main "Vercel" Heading
          - tracking-tighter: This pulls letters closer (CRITICAL for the look)
          - bg-gradient-to-b: Creates that metallic shine
      */}
      <motion.h1
        variants={fadeIn}
        className="bg-linear-to-b from-white via-white to-neutral-400 bg-clip-text text-center text-5xl font-bold tracking-tighter text-transparent sm:text-7xl mb-6 max-w-4xl"
      >
        Master English with <br className="hidden sm:block" />
        AI-Powered Precision.
      </motion.h1>

      {/* 3. The Subtext (Grey & Clean)
          - text-neutral-400: The specific "Vercel Grey"
          - max-w-lg: Keeps it readable width
      */}
      <motion.p
        variants={fadeIn}
        className="mt-4 max-w-lg text-center text-lg text-neutral-400 sm:text-xl mb-10"
      >
        The platform for ambitious learners. Build vocabulary, test grammar, and track progress with zero configuration.
      </motion.p>

      {/* 4. Buttons (Black/White Contrast) */}
      <motion.div
        variants={fadeIn}
        className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
      >
        <Button
            size="lg"
            className="rounded-full bg-white text-black hover:bg-neutral-200 h-12 px-8 text-base font-medium"
        >
          Start Learning <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button
            variant="outline"
            size="lg"
            className="rounded-full border-neutral-800 bg-black text-white hover:bg-neutral-900 hover:text-neutral-300 h-12 px-8 text-base font-medium"
        >
          Read Documentation
        </Button>
      </motion.div>
    </motion.div>
  );
}
