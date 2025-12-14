import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // 1. Words Today (Mock logic or real agg)
    // In a real app with 12k words, we assume 'user_word_progress' is the source of truth.
    // For MVP/Seed, we might not have progress data populated yet.
    // Let's count progress items updated > today start.
    const now = Date.now();
    const startOfDay = new Date(now).setHours(0,0,0,0);

    // NOTE: Convex query filtration on non-indexed 'lastReviewed' for huge table is slow.
    // We should index 'lastReviewed' or just fetch user's active items.
    // Schema has: .index("by_user_status", ["userId", "status"])
    // We can fetch all "learning" or "mastered" for user and filter in JS if list is small,
    // or adding an index on ["userId", "lastReviewed"] would be better.
    // For now, let's just return placeholders or small query.

    // Let's assume we want a quick dashboard.
    const streak = user.streak || 0;
    const dailyGoal = user.dailyGoal || 10;

    // Aggregation for categories:
    // We can count total words per category from 'words' table.
    // 'words' table index: "by_category" (which is actually 'type' in JSON)
    // categories: "synonyms", "antonyms", "idioms", "grammar"
    // We can run parallel collects.

    // Optimized: In a real large-scale app, we'd store these counts in a 'stats' table.
    // For this app, counting explicitly might be okay if words < 50k.

    const categories = [
        { id: "synonyms", label: "Synonyms" },
        { id: "antonyms", label: "Antonyms" },
        { id: "idioms", label: "Idioms" },
        { id: "grammar", label: "Grammar" },
    ];

    const categoryCounts = await Promise.all(
        categories.map(async (cat) => {
            // This count() is efficient? Convex supports .count() now? No, .collect().length.
            // Be careful. 12k words. Fetching 12k docs is bad.
            // We should use `aggregate` if available or just hardcode/cache counts.
            // For now, let's NOT fetch all 12k.
            // We will just return 0 or a placeholder, OR use a separate `counters` table if accuracy needed.
            return {
                ...cat,
                count: 0 // TODO: Implement efficient counting
            };
        })
    );

    return {
        streak,
        dailyGoal,
        wordsToday: 0, // Valid placeholder
        wordsLearnedTotal: 0,
        categoryCounts
    };
  },
});
