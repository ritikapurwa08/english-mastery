import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Custom user fields
    dailyGoal: v.optional(v.number()), // e.g. 10 words per day
    weeklyGoal: v.optional(v.number()), // e.g. 50 words per week
    streak: v.optional(v.number()),
    lastLogin: v.optional(v.number()),
  }).index("email", ["email"]),

  words: defineTable({
    text: v.string(), // The word itself (mapped from 'word')
    definition: v.string(), // mapped from 'meaning'
    pronunciation: v.optional(v.string()),
    category: v.string(), // mapped from 'type' (default "word")
    difficulty: v.string(), // mapped from 'level' (B1, B2, C1, C2)
    step: v.optional(v.number()), // Learning path step

    // Rich content
    examples: v.optional(v.array(v.object({
      sentence: v.string(),
      translation: v.optional(v.string()),
    }))),

    englishSynonyms: v.optional(v.array(v.string())), // mapped from 'synonyms'
    hindiSynonyms: v.optional(v.array(v.string())), // mapped from 'hindiMeanings'
    antonyms: v.optional(v.array(v.string())),
  })
  .index("by_text", ["text"])
  .index("by_step", ["step"])
  .index("by_difficulty", ["difficulty"])
  .searchIndex("search_text", { searchField: "text" }),

  questions: defineTable({
    type: v.union(v.literal("multiple-choice"), v.literal("fill-blank"), v.literal("boolean")),
    category: v.string(), // matches word categories or "mixed"
    difficulty: v.string(),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.string(),
    explanation: v.optional(v.string()),
    relatedWordId: v.optional(v.id("words")),
  })
  .index("by_category", ["category"]),

  user_word_progress: defineTable({
    userId: v.id("users"),
    wordId: v.id("words"),
    status: v.union(v.literal("new"), v.literal("learning"), v.literal("mastered")),
    isFavorite: v.optional(v.boolean()),
    correctCount: v.number(),
    incorrectCount: v.number(),
    lastReviewed: v.number(),
    nextReview: v.optional(v.number()), // Spaced repetition timestamp
  })
  .index("by_user_word", ["userId", "wordId"])
  .index("by_user_status", ["userId", "status"])
  .index("by_user_favorite", ["userId", "isFavorite"]),

  test_results: defineTable({
    userId: v.id("users"),
    date: v.number(),
    duration: v.number(), // in seconds
    score: v.number(), // percentage
    status: v.union(v.literal("completed"), v.literal("abandoned")),
    questionsAttempted: v.number(),
    questionsCorrect: v.number(),
    categoryBreakdown: v.array(v.object({
      category: v.string(),
      correct: v.number(),
      total: v.number()
    })),
    mistakes: v.array(v.object({
      wordId: v.id("words"),
      category: v.optional(v.string()),
      question: v.string(),
      userAnswer: v.string(),
      correctAnswer: v.string(),
      explanation: v.optional(v.string()),
    })),
  })
  .index("by_user_date", ["userId", "date"]),
});
