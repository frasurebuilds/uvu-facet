
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the admin key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing environment variables for Supabase client");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const EMAIL = "10938050@uvu.edu";
    const PASSWORD = "Alumni-dgm25";
    
    // Check if user already exists
    const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
    
    const userExists = users.some(user => user.email === EMAIL);
    
    if (userExists) {
      return new Response(
        JSON.stringify({ success: true, message: "Initial user already exists" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create user if it doesn't exist
    const { data, error } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true // Skip email confirmation
    });
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Initial user created successfully", data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
