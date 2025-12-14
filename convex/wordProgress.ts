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

    const existing = await ctx.db
      .query("user_word_progress")
      .withIndex("by_user_word", (q) => q.eq("userId", userId).eq("wordId", args.wordId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        lastReviewed: Date.now(),
      });
    } else {
      await ctx.db.insert("user_word_progress", {
        userId,
        wordId: args.wordId,
        status: args.status,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: Date.now(),
      });
    }
  },
});
