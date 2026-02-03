import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to verify the caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the caller is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { patient_code } = await req.json();

    if (!patient_code || typeof patient_code !== "string") {
      return new Response(
        JSON.stringify({ error: "Patient code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize the patient code (lowercase, trim)
    const normalizedCode = patient_code.toLowerCase().trim();

    if (normalizedCode.length < 4 || normalizedCode.length > 8) {
      return new Response(
        JSON.stringify({ error: "Patient code must be 4-8 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Looking up patient with code: ${normalizedCode}`);

    // Search for user_profile where user_id starts with the patient code
    // Using ILIKE for case-insensitive matching
    const { data: profiles, error: profileError } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, date_of_birth, gender")
      .ilike("user_id", `${normalizedCode}%`)
      .limit(1);

    if (profileError) {
      console.error("Error searching for patient:", profileError);
      return new Response(
        JSON.stringify({ error: "Failed to search for patient" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!profiles || profiles.length === 0) {
      console.log("No patient found with code:", normalizedCode);
      return new Response(
        JSON.stringify({ found: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const patient = profiles[0];

    // Calculate age if date_of_birth is available
    let age: number | null = null;
    if (patient.date_of_birth) {
      const birthDate = new Date(patient.date_of_birth);
      const today = new Date();
      age = Math.floor(
        (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
    }

    // Check if the doctor already has access to this patient
    const { data: existingAccess, error: accessError } = await supabase
      .from("doctor_patient_access")
      .select("id, is_active")
      .eq("doctor_id", user.id)
      .eq("patient_id", patient.user_id)
      .maybeSingle();

    if (accessError) {
      console.error("Error checking existing access:", accessError);
    }

    console.log("Patient found:", patient.user_id);

    return new Response(
      JSON.stringify({
        found: true,
        patient_id: patient.user_id,
        display_name: patient.display_name || "Unknown",
        gender: patient.gender,
        age,
        already_connected: existingAccess?.is_active === true,
        has_inactive_access: existingAccess && !existingAccess.is_active,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in lookup-patient-by-id:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
