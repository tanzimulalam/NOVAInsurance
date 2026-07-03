import { supabase } from '../lib/supabase';

// Leads are stored in the Supabase "leads" table:
//   id (uuid) | type (text) | status (text) | data (jsonb) | created_at | updated_at
// Anonymous visitors can INSERT and UPDATE (so drafts save as they type),
// while only the authenticated owner can SELECT and DELETE (Row Level Security).
export const leadsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  create: async (type, data = {}, status = 'incomplete') => {
    // Generate the id client-side so we don't need SELECT permission to read it back.
    const id = crypto.randomUUID();
    const { error } = await supabase
      .from('leads')
      .insert({ id, type: type || 'unknown', status, data });
    if (error) throw new Error(error.message);
    return { id };
  },

  update: async (id, payload) => {
    const patch = { updated_at: new Date().toISOString() };
    if (payload.data !== undefined) patch.data = payload.data;
    if (payload.status) patch.status = payload.status;
    const { error } = await supabase.from('leads').update(patch).eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  delete: async (id) => {
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  // Public self-service lookup: a customer finds their own submission by
  // last name + phone. Backed by a SECURITY DEFINER Postgres function so it
  // only ever returns rows matching BOTH values (see SUPABASE_SETUP.md).
  searchMine: async (lastName, phone) => {
    const { data, error } = await supabase.rpc('search_my_leads', {
      p_last_name: lastName,
      p_phone: phone,
    });
    if (error) throw new Error(error.message);
    return data || [];
  },

  // Portal-only: approximate lead data size + daily counts (authenticated users).
  getUsageStats: async () => {
    const { data, error } = await supabase.rpc('get_portal_usage_stats');
    if (error) throw new Error(error.message);
    return data;
  },

  // Live updates: calls onChange whenever any lead is inserted/updated/deleted.
  // Returns an unsubscribe function.
  subscribe: (onChange) => {
    const channel = supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, onChange)
      .subscribe();
    return () => supabase.removeChannel(channel);
  },
};
