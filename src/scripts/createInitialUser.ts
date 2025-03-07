
import { supabase } from "../integrations/supabase/client";

const EMAIL = "10938050@uvu.edu";
const PASSWORD = "Alumni-dgm25";

export const createInitialUser = async () => {
  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
      email: EMAIL,
      password: PASSWORD,
    });

    if (existingUser?.user) {
      console.log("Initial user already exists");
      return { success: true, message: "Initial user already exists" };
    }

    // Create the user if it doesn't exist
    const { data, error } = await supabase.auth.signUp({
      email: EMAIL,
      password: PASSWORD,
    });

    if (error) {
      console.error("Error creating initial user:", error.message);
      return { success: false, message: error.message };
    }

    console.log("Initial user created successfully:", data);
    return { success: true, message: "Initial user created successfully" };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, message: String(error) };
  }
};
