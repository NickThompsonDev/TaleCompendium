import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  npcs: defineTable({
    user: v.id('users'),
    npcName: v.string(),
    npcDescription: v.string(),
    armorClass: v.number(),
    hitPoints: v.number(),
    speed: v.number(),
    str: v.number(),
    dex: v.number(),
    con: v.number(),
    int: v.number(),
    wis: v.number(),
    cha: v.number(),
    skills: v.optional(v.string()),
    senses: v.optional(v.string()),
    languages: v.optional(v.string()),
    challenge: v.optional(v.number()),
    proficiencyBonus: v.number(),
    specialTraits: v.optional(v.string()),
    actions: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
    author: v.string(),
    authorId: v.string(),
    authorImageUrl: v.string(),
    views: v.number(),
  })
    .searchIndex('search_author', { searchField: 'author' })
    .searchIndex('search_title', { searchField: 'npcName' })
    .searchIndex('search_body', { searchField: 'npcDescription' }),

  users: defineTable({
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    name: v.string(),
    tokens: v.float64(),
  })
});
