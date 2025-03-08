
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

export const updateUserThemePreference = async (theme: 'light' | 'dark') => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error("No authenticated user found");
    }
    
    const { error } = await supabase.from("user_preferences").upsert({
      user_id: userData.user.id,
      theme: theme,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    
    if (error) {
      console.error("Error updating theme preference:", error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating theme preference:", error);
    throw error;
  }
};

export const getUserThemePreference = async (): Promise<'light' | 'dark' | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      return null;
    }
    
    const { data, error } = await supabase.from("user_preferences")
      .select("theme")
      .eq("user_id", userData.user.id)
      .single();
    
    if (error) {
      console.error("Error fetching theme preference:", error);
      return null;
    }
    
    return data?.theme as 'light' | 'dark' | null;
  } catch (error) {
    console.error("Error getting theme preference:", error);
    return null;
  }
};
