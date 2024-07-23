import { mutation } from "@/convex/_generated/server";
import { ConvexError, v } from "convex/values";
import Stripe from "stripe";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const createPaymentIntent = mutation({
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
    userId: v.id("users"),
    tokens: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, tokens } = args;
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User not found");

    const updatedTokens = (user.tokens || 0) + tokens;
    await ctx.db.patch(userId, { tokens: updatedTokens });
  },
});
