
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
