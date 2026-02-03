import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.log("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client with user auth to verify access
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Validate JWT using getClaims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.log("Invalid JWT claims:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    console.log("Authenticated user:", userId);

    // Get patient_id from request body
    const { patient_id } = await req.json();
    if (!patient_id) {
      return new Response(
        JSON.stringify({ error: "Missing patient_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the doctor has access to this patient
    const { data: access, error: accessError } = await supabaseUser
      .from("doctor_patient_access")
      .select("id")
      .eq("doctor_id", userId)
      .eq("patient_id", patient_id)
      .eq("is_active", true)
      .maybeSingle();

    if (accessError || !access) {
      return new Response(
        JSON.stringify({ error: "No access to this patient" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to fetch patient data
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch patient profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("display_name, date_of_birth, gender, location, phone, avatar_url")
      .eq("user_id", patient_id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }

    // Fetch health data
    const { data: healthData, error: healthError } = await supabaseAdmin
      .from("health_data")
      .select("*")
      .eq("user_id", patient_id)
      .maybeSingle();

    if (healthError) {
      console.error("Error fetching health data:", healthError);
    }

    // Fetch health records
    const { data: records, error: recordsError } = await supabaseAdmin
      .from("health_records")
      .select("id, title, category, record_date, provider_name, file_type, disease_category")
      .eq("user_id", patient_id)
      .order("record_date", { ascending: false })
      .limit(20);

    if (recordsError) {
      console.error("Error fetching records:", recordsError);
    }

    // Update last accessed timestamp
    await supabaseAdmin
      .from("doctor_patient_access")
      .update({ last_accessed_at: new Date().toISOString() })
      .eq("doctor_id", userId)
      .eq("patient_id", patient_id);

    return new Response(
      JSON.stringify({
        profile: profile || null,
        healthData: healthData || null,
        records: records || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-patient-data-for-doctor:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
