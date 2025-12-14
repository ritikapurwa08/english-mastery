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

    // Fetch user progress for counts
    const userProgressResults = await ctx.db
        .query("user_word_progress")
        .withIndex("by_user_word", q => q.eq("userId", userId))
        .collect();

    const now = Date.now();
    const startOfDay = new Date(now).setHours(0,0,0,0);
    const dayOfWeek = new Date(now).getDay(); // 0 is Sunday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now - dayOfWeek * 24 * 60 * 60 * 1000);
    startOfWeek.setHours(0,0,0,0);
    const startOfWeekTime = startOfWeek.getTime();

    let wordsToday = 0;
    let wordsThisWeek = 0;
    let wordsMastered = 0;
    let wordsMarked = 0; // "Learning" status

    for (const p of userProgressResults) {
        if (p.lastReviewed >= startOfDay) wordsToday++;
        if (p.lastReviewed >= startOfWeekTime) wordsThisWeek++;

        if (p.status === "mastered") wordsMastered++;
        // "learning" is essentially "Marked" for learning in this context
        if (p.status === "learning") wordsMarked++;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const categories = [
        { id: "synonyms", label: "Synonyms" },
        { id: "antonyms", label: "Antonyms" },
        { id: "idioms", label: "Idioms" },
        { id: "grammar", label: "Grammar" },
    ];

    return {
        streak: user.streak || 0,
        dailyGoal: user.dailyGoal || 10,
        weeklyGoal: user.weeklyGoal || 50,
        wordsToday,
        wordsThisWeek,
        wordsMastered,
        wordsMarked,
        categoryCounts: [] // Placeholder
    };
  },
});
