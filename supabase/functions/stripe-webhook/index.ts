import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");

serve(async (req) => {
  const { method } = req;

  if (method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { type, data } = body;

    console.log(`Receiving event: ${type}`);

    if (type === "checkout.session.completed") {
      const session = data.object;
      const email = session.customer_details?.email;
      const sessionId = session.id;

      if (!email) throw new Error("No email found in session");

      // 1. Check if user exists, if not create one
      // Since Edge Functions can't easily generate magic links and auto-login 
      // without a complex flow, we'll mark the email as premium.
      // In a real flow, we'd use Supabase Admin API to create the user.
      
      const { data: userList, error: listError } = await supabaseClient.auth.admin.listUsers();
      let user = userList?.users.find(u => u.email === email);

      if (!user) {
        const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { is_premium: true }
        });
        if (createError) throw createError;
        user = newUser.user;
      }

      // 2. Update profile to premium
      const { error: profileError } = await supabaseClient
        .from("profiles")
        .upsert({ 
          user_id: user.id, 
          is_premium: true,
          name: session.customer_details?.name || "Mente Ativa"
        }, { onConflict: 'user_id' });

      if (profileError) throw profileError;

      // 3. Log event
      await supabaseClient.from("payment_events").insert({
        external_id: sessionId,
        user_id: user.id,
        event_type: type,
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
