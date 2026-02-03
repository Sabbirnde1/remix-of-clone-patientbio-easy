import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      console.error("No token provided");
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Validating token:", token.substring(0, 10) + "...");

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch token details
    const { data: tokenData, error: tokenError } = await supabase
      .from("access_tokens")
      .select("*")
      .eq("token", token)
      .single();

    if (tokenError || !tokenData) {
      console.error("Token not found:", tokenError);
      return new Response(
        JSON.stringify({ error: "invalid", message: "Token not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if revoked
    if (tokenData.is_revoked) {
      console.log("Token is revoked");
      return new Response(
        JSON.stringify({ error: "revoked", message: "Access has been revoked" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if expired
    if (new Date(tokenData.expires_at) < new Date()) {
      console.log("Token is expired");
      return new Response(
        JSON.stringify({
          error: "expired",
          message: "Token has expired",
          expires_at: tokenData.expires_at,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = tokenData.user_id;
    console.log("Token valid, fetching data for user:", userId);

    // Update access tracking
    await supabase
      .from("access_tokens")
      .update({
        accessed_at: new Date().toISOString(),
        access_count: (tokenData.access_count || 0) + 1,
      })
      .eq("id", tokenData.id);

    // Fetch patient data in parallel
    const [profileRes, healthRes, recordsRes] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("user_id", userId).single(),
      supabase.from("health_data").select("*").eq("user_id", userId).single(),
      supabase
        .from("health_records")
        .select("id, title, category, record_date, provider_name")
        .eq("user_id", userId)
        .order("record_date", { ascending: false })
        .limit(10),
    ]);

    console.log("Data fetched successfully");

    return new Response(
      JSON.stringify({
        expires_at: tokenData.expires_at,
        profile: profileRes.data,
        healthData: healthRes.data,
        records: recordsRes.data || [],
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "internal", message: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
