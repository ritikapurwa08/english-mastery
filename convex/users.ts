import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    return user;
  },
});

// Update daily goal or preferences
export const updateSettings = mutation({
  args: {
    dailyGoal: v.optional(v.number()),
    weeklyGoal: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    await ctx.db.patch(userId, {
        dailyGoal: args.dailyGoal,
        weeklyGoal: args.weeklyGoal,
    });
  },
});
