import { supabase } from '../lib/supabase';

/**
 * Bootstrap function to create the first admin user
 * This should only be used once to create the initial admin
 */
export const createFirstAdmin = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { data, error } = await supabase.rpc('rpc_make_admin', {
      target_email: email
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating admin:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create admin'
    };
  }
};

/**
 * Check if the current user is an admin
 */
export const checkAdminStatus = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get admin user details
 */
export const getAdminDetails = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching admin details:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching admin details:', error);
    return null;
  }
};