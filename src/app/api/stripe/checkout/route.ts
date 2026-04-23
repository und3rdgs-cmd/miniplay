import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Allow checkout even without login — Stripe collects email
    const userId = user?.id ?? "anonymous";
    const email  = user?.email ?? "";

    const session = await createCheckoutSession(userId, email);

    return NextResponse.redirect(session.url!, { status: 303 });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
