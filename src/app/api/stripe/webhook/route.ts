import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

// Use service role for webhook — bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId  = session.metadata?.userId;
      if (!userId || userId === "anonymous") break;

      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_tier: "pro",
          stripe_customer_id: session.customer,
          subscription_end: null, // active subscription
        })
        .eq("id", userId);
      break;
    }

    case "customer.subscription.deleted": {
      const sub    = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (!userId) break;

      await supabaseAdmin
        .from("profiles")
        .update({
          subscription_tier: "free",
          subscription_end: new Date().toISOString(),
        })
        .eq("id", userId);
      break;
    }

    case "invoice.payment_failed": {
      // Optionally email the user — for now just log
      console.warn("Payment failed for:", event.data.object);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
