import { mutation } from "./_generated/server";

export const populate = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Clear existing generic "starter" words if we want to avoid duplicates?
    // For now, we'll just append.

    const starterWords = [
      // Vocabulary
      {
        text: "ephemeral",
        definition: "Lasting for a very short time.",
        pronunciation: "/əˈfem.ər.əl/",
        category: "vocabulary",
        difficulty: "C1",
        examples: [{ sentence: "Fashions are ephemeral, changing with every season." }],
        englishSynonyms: ["transient", "fleeting", "short-lived"],
        hindiSynonyms: ["अल्पकालिक"],
        step: 0,
      },
      {
        text: "serendipity",
        definition: "The occurrence and development of events by chance in a happy or beneficial way.",
        pronunciation: "/ˌser.ənˈdɪp.ə.t̬i/",
        category: "vocabulary",
        difficulty: "B2",
        examples: [{ sentence: "It was pure serendipity that we met properly." }],
        englishSynonyms: ["chance", "luck"],
        hindiSynonyms: ["संयोग"],
        step: 0,
      },
      {
        text: "resilient",
        definition: "Able to withstand or recover quickly from difficult conditions.",
        pronunciation: "/rɪˈzɪl.jənt/",
        category: "vocabulary",
        difficulty: "B2",
        examples: [{ sentence: "Babies are generally more resilient than adults realize." }],
        englishSynonyms: ["tough", "strong"],
        hindiSynonyms: ["लचीला", "सहनशील"],
        step: 0,
      },
      // Grammar Concepts (Stored as Words for MVP compatibility)
      {
        text: "Past Perfect Tense",
        definition: "Used to describe an action that was completed before another action in the past.",
        pronunciation: "-",
        category: "grammar",
        difficulty: "B1",
        examples: [{ sentence: "I had finished my work before he arrived." }],
        englishSynonyms: [],
        hindiSynonyms: ["पूर्ण भूतकाल"],
        step: 0,
      },
      {
        text: "Conditional Type 2",
        definition: "Used to talk about unreal situations in the present or future.",
        pronunciation: "-",
        category: "grammar",
        difficulty: "B2",
        examples: [{ sentence: "If I were rich, I would travel the world." }],
        englishSynonyms: [],
        hindiSynonyms: [],
        step: 0,
      },
      // Idioms
      {
        text: "Bite the bullet",
        definition: "To face a difficult situation with courage and determination.",
        pronunciation: "-",
        category: "idioms",
        difficulty: "B2",
        examples: [{ sentence: "I decided to bite the bullet and resign." }],
        englishSynonyms: ["face the music"],
        hindiSynonyms: ["कड़वा घूंट पीना"],
        step: 0,
      }
    ];

    let count = 0;
    for (const w of starterWords) {
      // Check for existence
      const existing = await ctx.db
        .query("words")
        .withIndex("by_text", (q) => q.eq("text", w.text))
        .first();

      if (!existing) {
        await ctx.db.insert("words", w);
        count++;
      }
    }

    return `Added ${count} starter items.`;
  },
});
