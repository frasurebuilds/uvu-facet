
import { supabase } from "@/integrations/supabase/client";

export const createInitialUser = async () => {
  try {
    const { data, error } = await supabase.functions.invoke("create-initial-user");
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Error creating initial user:", error);
    throw error;
  }
};

// Get user's theme preference from the database
export const getUserThemePreference = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('theme')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no preference exists, create one with default 'light' theme
      if (error.code === 'PGRST116') {
        await createUserThemePreference(userId, 'light');
        return 'light';
      }
      throw error;
    }
    
    return data?.theme || 'light';
  } catch (error) {
    console.error("Error getting user theme preference:", error);
    return 'light'; // Default to light theme on error
  }
};

// Create a new user theme preference
export const createUserThemePreference = async (userId: string, theme: string) => {
  try {
    const { error } = await supabase
      .from('user_preferences')
      .insert({ user_id: userId, theme });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error creating user theme preference:", error);
    return false;
  }
};

// Update the user's theme preference
export const updateUserThemePreference = async (userId: string, theme: string) => {
  try {
    const { error } = await supabase
      .from('user_preferences')
      .update({ theme, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error("Error updating user theme preference:", error);
    return false;
  }
};
