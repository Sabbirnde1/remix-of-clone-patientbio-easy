import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to verify they're authenticated
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user and get their ID
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Claims error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log("Authenticated user:", userId);

    // Check if user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await userClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      console.error("Role check failed:", roleError, "isAdmin:", isAdmin);
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client for auth.users access
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";

    if (req.method === "GET" && action === "list") {
      // List all users with their roles
      console.log("Listing users...");
      
      const { data: authUsers, error: usersError } = await adminClient.auth.admin.listUsers();
      
      if (usersError) {
        console.error("Error listing users:", usersError);
        return new Response(
          JSON.stringify({ error: "Failed to list users" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get all roles
      const { data: roles, error: rolesError } = await adminClient
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
      }

      // Map roles to users
      const rolesMap = new Map<string, string>();
      roles?.forEach((r) => rolesMap.set(r.user_id, r.role));

      const users = authUsers.users.map((user) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        role: rolesMap.get(user.id) || "user",
        email_confirmed_at: user.email_confirmed_at,
      }));

      console.log(`Found ${users.length} users`);
      
      return new Response(
        JSON.stringify({ users }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET" && action === "stats") {
      // Get user signup statistics
      console.log("Fetching user stats...");
      
      const { data: authUsers, error: usersError } = await adminClient.auth.admin.listUsers();
      
      if (usersError) {
        console.error("Error listing users:", usersError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch user stats" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return signup dates for all users
      const signups = authUsers.users.map((user) => ({
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
      }));

      console.log(`Returning stats for ${signups.length} users`);
      
      return new Response(
        JSON.stringify({ signups, totalUsers: signups.length }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "POST" && action === "set-role") {
      const body = await req.json();
      const { targetUserId, role } = body;

      if (!targetUserId || !role) {
        return new Response(
          JSON.stringify({ error: "Missing targetUserId or role" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!["admin", "user"].includes(role)) {
        return new Response(
          JSON.stringify({ error: "Invalid role. Must be 'admin' or 'user'" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Setting role for user ${targetUserId} to ${role}`);

      if (role === "admin") {
        // Add admin role (upsert to handle existing entries)
        const { error: insertError } = await adminClient
          .from("user_roles")
          .upsert(
            { user_id: targetUserId, role: "admin" },
            { onConflict: "user_id,role" }
          );

        if (insertError) {
          console.error("Error setting admin role:", insertError);
          return new Response(
            JSON.stringify({ error: "Failed to set role" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } else {
        // Remove admin role (user is the default)
        const { error: deleteError } = await adminClient
          .from("user_roles")
          .delete()
          .eq("user_id", targetUserId);

        if (deleteError) {
          console.error("Error removing role:", deleteError);
          return new Response(
            JSON.stringify({ error: "Failed to update role" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
