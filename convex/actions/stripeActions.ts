"use node"

import { action } from "../_generated/server";
import stripePackage from "stripe";
import { v } from "convex/values";

const stripe = new stripePackage(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export const createPaymentIntent = action({
  args: { amount: v.number(), currency: v.string() },
  handler: async (ctx, args) => {
    const { amount, currency } = args;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    return { clientSecret: paymentIntent.client_secret };
  },
});
