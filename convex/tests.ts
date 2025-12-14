import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export const generateTest = mutation({
  args: {
    categories: v.array(v.string()), // "synonyms", etc.
    questionCount: v.number(), // 10, 20, 50
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    let allQuestions: Doc<"questions">[] = [];

    // Fetch from 'questions' table for each category
    const questionsPerCat = await Promise.all(
        args.categories.map(async (cat) => {
             // Basic fetch. Ideally we'd have randomized index or fetch more and shuffle.
             // Fetch 20 (limitPerCat) to have some variety then shuffle.
             // Map 'phrasal-verbs' (UI) to 'phrasal verbs' (DB) if needed.
             // UI sends: "idioms", "antonyms", "vocabulary", "grammar", "phrasal-verbs"
             // DB has: "idioms", "antonyms", "vocabulary", "grammar", "phrasal verbs"
             const dbCat = cat === "phrasal-verbs" ? "phrasal verbs" : cat;

             return await ctx.db.query("questions")
                .withIndex("by_category", q => q.eq("category", dbCat))
                .take(20);
        })
    );

    allQuestions = questionsPerCat.flat();

    // Shuffle (Fisher-Yates)
    for (let i = allQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }



    return {
        testId: "temp_id_" + Date.now(),
        questions: allQuestions.slice(0, args.questionCount)
    };
  },
});

export const submitResult = mutation({
  args: {
    score: v.number(),
    totalQuestions: v.number(),
    correctCount: v.number(),
    duration: v.number(),
    categoryBreakdown: v.array(v.object({
        category: v.string(),
        correct: v.number(),
        total: v.number()
    })),
    mistakes: v.array(v.object({
        wordId: v.id("words"),
        question: v.string(),
        userAnswer: v.string(),
        correctAnswer: v.string(),
        explanation: v.optional(v.string())
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Save Result
    const resultId = await ctx.db.insert("test_results", {
        userId,
        date: Date.now(),
        duration: args.duration,
        score: args.score,
        status: "completed",
        questionsAttempted: args.totalQuestions,
        questionsCorrect: args.correctCount,
        categoryBreakdown: args.categoryBreakdown,
        mistakes: args.mistakes.map(m => ({
            wordId: m.wordId,
            question: m.question,
            userAnswer: m.userAnswer,
            correctAnswer: m.correctAnswer,
            explanation: m.explanation,
        })),
    });

    // Update User Stats (e.g. Streak logic could be here, or handled separately)
    // For now, let's just ensure we track the user has taken a test.
    const user = await ctx.db.get(userId);
    if (user) {
        // Maybe update 'lastActivity'?
         await ctx.db.patch(userId, { lastLogin: Date.now() });
    }

    return resultId;
  },
});

export const getHistory = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        return await ctx.db
            .query("test_results")
            .withIndex("by_user_date", q => q.eq("userId", userId))
            .order("desc")
            .take(20);
    }
});
