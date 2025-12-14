import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const toggleFavorite = mutation({
  args: { wordId: v.id("words") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("user_word_progress")
      .withIndex("by_user_word", (q) => q.eq("userId", userId).eq("wordId", args.wordId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isFavorite: !existing.isFavorite
      });
    } else {
      await ctx.db.insert("user_word_progress", {
        userId,
        wordId: args.wordId,
        status: "new",
        isFavorite: true,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: Date.now(),
      });
    }
  },
});

export const updateStatus = mutation({
  args: {
      wordId: v.id("words"),
      status: v.union(v.literal("new"), v.literal("learning"), v.literal("mastered"))
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("user_word_progress")
      .withIndex("by_user_word", (q) => q.eq("userId", userId).eq("wordId", args.wordId))
      .unique();

    const now = Date.now();
    const todayStart = new Date(now).setHours(0,0,0,0);
    const lastLogin = user.lastLogin || 0;
    const lastLoginDate = new Date(lastLogin).setHours(0,0,0,0);

    let newStreak = user.streak || 0;

    // Streak Logic:
    // If lastLogin was Yesterday (todayStart - 24h) -> Increment
    // If lastLogin was Today -> Keep same
    // If lastLogin was < Yesterday -> Reset to 1 (because we are active today)
    // EXCEPTION: If streak is 0, set to 1.

    const oneDay = 24 * 60 * 60 * 1000;

    // Check if we already counted today?
    if (lastLoginDate === todayStart) {
        // Already updated streak today presumably, do nothing specifically for streak
    } else if (lastLoginDate === todayStart - oneDay) {
        // Consecutive day
        newStreak += 1;
    } else {
        // Broke streak (or first time)
        newStreak = 1;
    }

    // Update User Streak & Last Login
    // Only update if it changed or if lastLogin is old
    if (lastLoginDate !== todayStart) {
        await ctx.db.patch(userId, {
            streak: newStreak,
            lastLogin: now
        });
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        lastReviewed: now,
      });
    } else {
      await ctx.db.insert("user_word_progress", {
        userId,
        wordId: args.wordId,
        status: args.status,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: now,
      });
    }
  },
});
