// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret"
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const cronSecret = Deno.env.get("CRON_SYNC_SHARED_SECRET");
    if (cronSecret) {
      const received = req.headers.get("x-cron-secret");
      if (!received || received !== cronSecret) {
        return new Response(JSON.stringify({ error: "Unauthorized cron request" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const appBaseUrl = Deno.env.get("APP_BASE_URL");
    if (!appBaseUrl) {
      return new Response(JSON.stringify({ error: "APP_BASE_URL missing" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const response = await fetch(`${appBaseUrl}/api/sync/all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": cronSecret ?? ""
      },
      body: JSON.stringify({ source: "supabase-cron" })
    });
    const payload = await response.text();

    return new Response(payload, {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message ?? "Unexpected edge function error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
