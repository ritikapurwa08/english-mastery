import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getProfileStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    // Fetch all test results for calculating stats
    // Warning: Unbounded fetch. For Production, use improved aggregation or incremental updates.
    const results = await ctx.db
        .query("test_results")
        .withIndex("by_user_date", q => q.eq("userId", userId))
        .collect();

    const totalTests = results.length;
    let totalScore = 0;
    let totalQuestions = 0;
    let totalCorrect = 0;

    // Category Breakdown (rough approximation from test tags or inference)
    // Since we didn't store "category" in test_result root (only inside 'mistakes' or implicitly via test gen),
    // we might have to rely on 'categoryBreakdown' if we populated it, or skip for MVP.
    // The previous implementation of `submitResult` left `categoryBreakdown` empty.
    // For MVP, we will simulate category stats randomly or just show global stats.

    // Category Breakdown
    const catStats: Record<string, { total: number; correct: number }> = {};
    results.forEach(r => {
        totalScore += r.score;
        totalQuestions += r.questionsAttempted;
        totalCorrect += r.questionsCorrect;

        if (r.categoryBreakdown) {
            r.categoryBreakdown.forEach(c => {
                if (!catStats[c.category]) catStats[c.category] = { total: 0, correct: 0 };
                catStats[c.category].total += c.total;
                catStats[c.category].correct += c.correct;
            });
        }
    });

    const avgScore = totalTests > 0 ? Math.round(totalScore / totalTests) : 0;
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Performance Bars
    const performance = Object.entries(catStats).map(([cat, stat]) => ({
        category: cat.charAt(0).toUpperCase() + cat.slice(1),
        percentage: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
        color: "bg-blue-600" // dynamic colors could be added here
    })).sort((a,b) => b.percentage - a.percentage);

    if (performance.length === 0) {
        // Fallback if no category data yet
        performance.push(
            { category: "Vocabulary", percentage: accuracy || 0, color: "bg-green-500" }
        );
    }

    // Last 3 tests for recent activity
    const recentActivity = results
        .sort((a, b) => b.date - a.date)
        .slice(0, 3)
        .map(r => ({
            _id: r._id,
            date: r.date,
            score: r.score,
            duration: r.duration,
            type: "Vocabulary" // Currently we only have Vocab
        }));

    return {
        name: user.name || "User",
        email: user.email,
        image: user.image,
        streak: user.streak || 0,
        avgScore,
        accuracy,
        totalTests,
        recentActivity,
        performance
    };
  },
});
