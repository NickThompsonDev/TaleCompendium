import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import stripe from "stripe";

const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!);

export const getUserById = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    if (!args.clerkId) {
      return null;
    }
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    user.tokens = user.tokens || 0;

    return user;
  },
});

export const getTopUserByNPCCreationCount = query({
  args: {},
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();

    const userData = await Promise.all(
      users.map(async (u) => {
        const npcs = await ctx.db
          .query("npcs")
          .filter((q) => q.eq(q.field("authorId"), u.clerkId))
          .collect();

        const sortedNPCs = npcs.sort((a, b) => b.views - a.views);

        return {
          ...u,
          totalNPCs: npcs.length,
          npcs: sortedNPCs.map((n) => ({
            npcName: n.npcName,
            npcId: n._id,
          })),
        };
      })
    );

    return userData.sort((a, b) => b.totalNPCs - a.totalNPCs);
  },
});

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      imageUrl: args.imageUrl,
      name: args.name,
      tokens: 30,
    });
  },
});

export const updateUser = internalMutation({
  args: {
    clerkId: v.string(),
    imageUrl: v.string(),
    email: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      imageUrl: args.imageUrl,
      email: args.email,
    });

    const npcs = await ctx.db
      .query("npcs")
      .filter((q) => q.eq(q.field("authorId"), args.clerkId))
      .collect();

    await Promise.all(
      npcs.map(async (npc) => {
        await ctx.db.patch(npc._id, {
          authorImageUrl: args.imageUrl,
        });
      })
    );
  },
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.delete(user._id);
  },
});

export const createPaymentIntent = internalMutation({
  args: {
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const { amount, currency } = args;
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount,
      currency,
    });

    return { clientSecret: paymentIntent.client_secret };
  },
});

export const addTokens = mutation({
  args: {
    clerkId: v.string(),
    tokens: v.number(),
  },
  handler: async (ctx, args) => {
    const { clerkId, tokens } = args;
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), clerkId))
      .unique();

    if (!user) throw new ConvexError("User not found");

    const updatedTokens = (user.tokens || 0) + tokens;
    await ctx.db.patch(user._id, { tokens: updatedTokens });
  },
});

export const consumeTokens = mutation({
  args: {
    clerkId: v.string(),
    tokens: v.number(),
  },
  handler: async (ctx, args) => {
    const { clerkId, tokens } = args;
    const user = await ctx.db.query("users").filter((q) => q.eq(q.field("clerkId"), clerkId)).unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    if (user.tokens < tokens) {
      throw new ConvexError("Insufficient tokens");
    }

    await ctx.db.patch(user._id, { tokens: user.tokens - tokens });
  },
});