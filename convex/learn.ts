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
        return { page: [], isDone: true, continueCursor: "" };
    }

    let results;

    if (args.search) {
        // Use Search Index if search term is provided
        // Note: Search results are paginated differently than standard queries in some contexts, but .paginate() supports it on the search query builder.
        // We cannot easily chain .filter(category) on a search query in the same way efficiently without filtered search.
        // For MVP, we will search first, then filter in memory if needed or trust the search rank.
        // However, we can use filter() on search query for equality checks on indexed fields if supported, but typically search filters are limited.
        // Let's do a search query.

        let q = ctx.db.query("words")
            .withSearchIndex("search_text", q => q.search("text", args.search!));

        // Attempting detailed filtering on search results is complex.
        // We will fetch search results and filter in memory since user specifically searched.
        results = await q.paginate(args.paginationOpts);

        // In-memory filter for category/difficulty if needed (search might return things outside category)
        if (args.category) {
             results.page = results.page.filter(w => w.category === args.category);
        }
        if (args.difficulty) {
             results.page = results.page.filter(w => w.difficulty === args.difficulty);
        }

    } else {
        // Standard Filtered Query
        let q = ctx.db.query("words");

        if (args.category) {
             q = q.filter(q => q.eq(q.field("category"), args.category));
        }

        if (args.difficulty) {
            q = q.filter(q => q.eq(q.field("difficulty"), args.difficulty));
        }

        results = await q.paginate(args.paginationOpts);
    }

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

    // Filter out mastered words
    const filteredPage = pageWithProgress.filter(w => w.userProgress?.status !== "mastered");

    return {
        ...results,
        page: filteredPage
    };
  },
});

export const getReviewWords = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return { page: [], isDone: true, continueCursor: "" };

        // Fetch user progress items that are 'learning' or 'mastered'
        // We have index "by_user_status". We can't query multiple statuses in one go easily with pagination on mixed statuses without a custom index.
        // We can use `.filter` on a scan of `user_word_progress` for that user? index "by_user_word" -> user scan.
        // Or union query? Convex doesn't do union queries for pagination.
        // Let's rely on client-side or separate tabs?
        // User asked for "Vocab Old" (Review).

        // Strategy: Query `user_word_progress` by user.
        // Filter `status !== 'new'` (so learning or mastered).
        // Paginate THAT.
        // Then fetch the words.

        const progressQuery = ctx.db
            .query("user_word_progress")
            .withIndex("by_user_word", q => q.eq("userId", userId));

        // We want to filter status.
        // .filter(q => q.neq(q.field("status"), "new"))
        // Note: neq might be slow-ish if not indexed but userId limits scope.

        const results = await progressQuery
            .filter(q => q.neq(q.field("status"), "new"))
            .paginate(args.paginationOpts);

        const words = await Promise.all(
            results.page.map(async (p) => {
                const word = await ctx.db.get(p.wordId);
                return {
                    ...word, // word might be null if deleted? handle gracefully
                    userProgress: p
                };
            })
        );

        // Filter out nulls if any
        const validWords = words.filter(w => w.text !== undefined);

        return {
            ...results,
            page: validWords
        };
    }
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

export const getNextWord = query({
    args: {
        currentWordId: v.id("words"),
        category: v.optional(v.string()),
        difficulty: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        const currentWord = await ctx.db.get(args.currentWordId);
        if (!currentWord) return null;

        // Start scanning after the current word
        let q = ctx.db.query("words")
            .withIndex("by_creation_time", q => q.gt("_creationTime", currentWord._creationTime));

        if (args.category) {
            q = q.filter(q => q.eq(q.field("category"), args.category));
        }
        if (args.difficulty) {
            q = q.filter(q => q.eq(q.field("difficulty"), args.difficulty));
        }

        // Fetch a batch to find the next valid non-mastered word
        // We limit to 50 to avoid infinite scan in worst case (though UI can handle "End of list")
        const candidates = await q.take(50);

        if (candidates.length === 0) return null;

        // If no user, just return the next one
        if (!userId) return candidates[0]._id;

        // Check progress
        for (const candidate of candidates) {
            const progress = await ctx.db
                .query("user_word_progress")
                .withIndex("by_user_word", q => q.eq("userId", userId).eq("wordId", candidate._id))
                .unique();

            // If NOT mastered, this is our next word
            if (progress?.status !== "mastered") {
                return candidate._id;
            }
        }

        // If all 50 are mastered, return null or maybe the first one?
        // User said: "not show that words again which user already know"
        // So return null implies "End of new words".
        return null;
    }
});
