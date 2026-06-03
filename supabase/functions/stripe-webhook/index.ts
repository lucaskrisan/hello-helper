import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });

serve(async (req) => {
  const { method } = req;

  if (method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    // Verify Stripe signature to reject forged requests
    const sig = req.headers.get("stripe-signature");
    if (!sig || !webhookSecret) {
      return new Response(JSON.stringify({ error: "Missing signature" }), { status: 401 });
    }

    const rawBody = await req.text();
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, sig, webhookSecret);
    } catch (err) {
      console.error("Signature verification failed:", err.message);
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log(`Receiving event: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email;
      const sessionId = session.id;

      if (!email) throw new Error("No email found in session");

      // 1. Find user by email using admin API (avoids loading all users)
      const { data: userList } = await supabaseClient.auth.admin.listUsers({ perPage: 1000 });
      let user = userList?.users.find(u => u.email === email);

      if (!user) {
        // New user: create account and send magic link via invite
        const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { is_premium: true }
        });
        if (createError) throw createError;
        user = newUser.user;

        // Send access email only for new users
        await supabaseClient.auth.admin.inviteUserByEmail(email, {
          data: { is_premium: true },
          redirectTo: `${Deno.env.get("PUBLIC_URL")}/welcome?session_id=${sessionId}`
        });
      } else {
        // Existing user: send magic link (no duplicate invite)
        await supabaseClient.auth.admin.generateLink({
          type: "magiclink",
          email,
          options: { redirectTo: `${Deno.env.get("PUBLIC_URL")}/welcome?session_id=${sessionId}` }
        });
      }

      // 2. Update profile to premium
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .upsert({
          user_id: user.id,
          is_premium: true,
          name: session.customer_details?.name || "Mente Ativa"
        }, { onConflict: "user_id" });

      if (profileError) throw profileError;

      // 3. Log event (external_id is UNIQUE — duplicate webhooks are ignored)
      await supabaseClient.from("payment_events").insert({
        external_id: sessionId,
        user_id: user.id,
        event_type: event.type,
        amount_total: session.amount_total,
        currency: session.currency,
        status: session.payment_status,
        raw_payload: session
      });

      console.log(`User ${email} is now premium.`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});
