import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// create NPC mutation
export const createNPC = mutation({
  args: {
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
    imageStorageId: v.id("_storage"),
    views: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("User not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .collect();

    if (user.length === 0) {
      throw new ConvexError("User not found");
    }

    return await ctx.db.insert("npcs", {
      ...args,
      user: user[0]._id,
      author: user[0].name,
      authorId: user[0].clerkId,
      authorImageUrl: user[0].imageUrl,
    });
  },
});

// this mutation is required to generate the url after uploading the file to the storage.
export const getUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Query to get NPC by ID
export const getNPCById = query({
  args: {
    npcId: v.id("npcs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.npcId);
  },
});

// Query to get all NPCs
export const getAllNPCs = query({
  handler: async (ctx) => {
    return await ctx.db.query("npcs").order("desc").collect();
  },
});

// Query to get NPCs based on the search query
export const getNPCBySearch = query({
  args: {
    search: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.search === "") {
      return await ctx.db.query("npcs").order("desc").collect();
    }

    const authorSearch = await ctx.db
      .query("npcs")
      .withSearchIndex("search_author", (q) => q.search("author", args.search))
      .take(10);

    if (authorSearch.length > 0) {
      return authorSearch;
    }

    const titleSearch = await ctx.db
      .query("npcs")
      .withSearchIndex("search_title", (q) =>
        q.search("npcName", args.search)
      )
      .take(10);

    if (titleSearch.length > 0) {
      return titleSearch;
    }

    return await ctx.db
      .query("npcs")
      .withSearchIndex("search_body", (q) =>
        q.search("npcDescription" || "npcName", args.search)
      )
      .take(10);
  },
});

// Query to get NPCs by authorId
export const getNPCByAuthorId = query({
  args: {
    authorId: v.string(),
  },
  handler: async (ctx, args) => {
    const npcs = await ctx.db
      .query("npcs")
      .filter((q) => q.eq(q.field("authorId"), args.authorId))
      .collect();

    const totalViews = npcs.reduce(
      (sum, npc) => sum + npc.views,
      0
    );

    return { npcs, views: totalViews };
  },
});

// Query to get NPCs based on the views of the NPC
export const getTrendingNPCs = query({
  handler: async (ctx) => {
    const npcs = await ctx.db.query("npcs").collect();

    return npcs.sort((a, b) => b.views - a.views).slice(0, 8);
  },
});

// Mutation to update NPC views
export const updateNPCViews = mutation({
  args: {
    npcId: v.id("npcs"),
  },
  handler: async (ctx, args) => {
    const npc = await ctx.db.get(args.npcId);

    if (!npc) {
      throw new ConvexError("NPC not found");
    }

    return await ctx.db.patch(args.npcId, {
      views: npc.views + 1,
    });
  },
});

// Mutation to delete NPC
export const deleteNPC = mutation({
  args: {
    npcId: v.id("npcs"),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const npc = await ctx.db.get(args.npcId);

    if (!npc) {
      throw new ConvexError("NPC not found");
    }

    if (args.imageStorageId) {
      await ctx.storage.delete(args.imageStorageId);
    }
    return await ctx.db.delete(args.npcId);
  },
});
