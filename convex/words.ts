import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const batchInsert = mutation({
  args: {
    words: v.array(v.object({
      word: v.string(),
      meaning: v.string(),
      hindiMeanings: v.array(v.string()),
      synonyms: v.array(v.string()), // Maps to englishSynonyms
      sentence: v.string(), // Maps to examples
      step: v.number(),
      level: v.string(), // Maps to difficulty
      type: v.string(), // Maps to category
      isFavorite: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    // We can just iterate and insert.
    // Since this is a batch, we won't check for duplicates individually to save time,
    // or we can use `upsert` logic if we had a unique index on `text` + `step`?
    // User schema says index on `text`. We can check if it exists or just insert.
    // For manual seed, simplest is `insert` but idempotency is better.

    // However, checking 100s of words one by one in a loop might be slow.
    // Let's just insert for now. If user wants idempotency, they should clear table first.

    for (const w of args.words) {
      await ctx.db.insert("words", {
        text: w.word,
        definition: w.meaning,
        englishSynonyms: w.synonyms,
        hindiSynonyms: w.hindiMeanings,
        examples: [{ sentence: w.sentence }],
        difficulty: w.level,
        category: w.type,
        step: w.step,
        // isFavorite is user-specific, but the JSON has it as a static field?
        // Assuming it's meant to be a default or ignored for the global word definition.
        // We defined 'isFavorite' in 'user_word_progress', not in 'words' table in schema.
        // So we will IGNORE 'isFavorite' from the seed data for the 'words' table.
        // If the user meant for some words to start as favorite for *everyone*, that's odd.
        // We'll proceed with ignoring it for the 'words' table.
      });
    }
    return args.words.length;
  },
});

export const getWordsWithoutExamples = query({
  args: { count: v.number() },
  handler: async (ctx, args) => {
    // Inefficient scan, but fine for background job on 12k items for now.
    // Ideally we'd have an index on "hasExamples" but we don't.
    const words = await ctx.db.query("words").collect();
    // Filter in JS
    return words
      .filter((w) => !w.examples || w.examples.length === 0)
      .slice(0, args.count);
  },
});

export const updateWordExamples = mutation({
  args: {
    wordId: v.id("words"),
    examples: v.array(v.object({
      sentence: v.string(),
      translation: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.wordId, {
      examples: args.examples,
    });
  },
});
