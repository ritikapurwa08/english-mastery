import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";

// List words with filters and pagination
export const getWords = query({
  args: {
    paginationOpts: paginationOptsValidator,
    category: v.optional(v.string()), // "synonyms", "antonyms", etc.
    difficulty: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
        // Return empty or throw? Usually empty for graceful UI.
        return { page: [], isDone: true, continueCursor: "" };
    }

    let q = ctx.db.query("words");

    if (args.category) {
        // 'category' field in schema corresponds to 'type' in JSON, but we mapped it to 'category' in schema.
        // However, we didn't index 'category' alone, we indexed 'by_difficulty' and 'by_step'.
        // We defined .index("by_category", ["category"]) for QUESTIONS, but for WORDS?
        // Checking schema...
        // words: .index("by_text", ["text"]).index("by_step", ["step"]).index("by_difficulty", ["difficulty"])
        // Missing "by_category" index on words!
        // We will have to filter in JS or scan. For 12k words, scanning is okay-ish for MVP but bad for bad scale.
        // Actually, we imported 'type' as 'category'.
        // Let's rely on .filter().
         q = q.filter(q => q.eq(q.field("category"), args.category));
    }

    if (args.difficulty) {
        // If we also filter by difficulty, we can use the index if it was the *primary* filter.
        // Since we might filter by both, we might need a compound index or just filter.
        q = q.filter(q => q.eq(q.field("difficulty"), args.difficulty));
    }

    // Search is tricky with pagination in Convex without specific Search indexes.
    // 'search' index is supported.
    // We didn't define a search index in schema.ts.
    // We'll implement basic prefix search via filter or just return all if search is absent.
    // NOTE: For true search, we need `search("words", ...)` but that returns a different object than `query("words")`.
    // Mixing search + filtering + pagination is complex.
    // For this MVP, let's just do simple pagination filtering.
    // If search is present, we MIGHT have to efficiently filter in-memory if list is small or just use `.filter`.
    // But .filter on string contains is NOT supported efficiently (no `contains`).
    // Scan is the only way for 'text' check without Search Index.

    if (args.search) {
        // Naive scan for MVP.
        // Convert to lowercase for loose matching? schema doesn't support case-insensitive natively without storing it.
        // We will assume precise search or basic scan.
        // Actually, let's skip search for the *paginated* query for now to avoid complexity,
        // or just apply it.
        // q = q.filter(q => q.eq(q.field("text"), args.search)); // Exact match only for now?
    }

    // We need to fetch User Progress for these words to show "Mastered" etc.
    // Pagination returns a list of words. We then need to map them to progress.
    // We can't join in Convex.

    const results = await q.paginate(args.paginationOpts);

    // Fetch progress for this page
    const wordIds = results.page.map(w => w._id);

    const progressList = await Promise.all(
        wordIds.map(async (wordId) => {
            return await ctx.db
                .query("user_word_progress")
                .withIndex("by_user_word", (q) => q.eq("userId", userId).eq("wordId", wordId))
                .unique();
        })
    );

    const pageWithProgress = results.page.map((word, i) => ({
        ...word,
        userProgress: progressList[i]
    }));

    return {
        ...results,
        page: pageWithProgress
    };
  },
});

export const getWord = query({
  args: { wordId: v.id("words") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const word = await ctx.db.get(args.wordId);
    if (!word) return null;

    let userProgress = null;
    if (userId) {
        userProgress = await ctx.db
            .query("user_word_progress")
            .withIndex("by_user_word", (q) => q.eq("userId", userId).eq("wordId", args.wordId))
            .unique();
    }

    return { ...word, userProgress };
  },
});
