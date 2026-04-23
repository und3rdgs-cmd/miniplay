import Stripe from "stripe";

// ─── Server-side Stripe instance ────────────────────────────
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

// ─── Create checkout session for Pro subscription ────────────
export async function createCheckoutSession(userId: string, email: string) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/pro`,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
  });

  return session;
}

// ─── Create billing portal session ──────────────────────────
export async function createBillingPortalSession(customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
  });
}
