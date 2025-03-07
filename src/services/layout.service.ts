import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import type { Widget } from '../types';

type DbLayout = Database['public']['Tables']['layouts']['Row'];
type NewDbLayout = Database['public']['Tables']['layouts']['Insert'];

export const getLayouts = async (userId: string) => {
  const { data, error } = await supabase
    .from('layouts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const saveLayout = async (
  userId: string,
  name: string,
  widgets: Widget[]
) => {
  const { data, error } = await supabase
    .from('layouts')
    .insert([{
      user_id: userId,
      name,
      widgets: widgets.map(w => ({
        ...w,
        position: { ...w.position },
        size: { ...w.size }
      }))
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const applyLayout = async (layoutId: string, userId: string) => {
  const { data, error } = await supabase
    .from('layouts')
    .select('widgets')
    .eq('id', layoutId)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data.widgets as Widget[];
};

export const deleteLayout = async (layoutId: string, userId: string) => {
  const { error } = await supabase
    .from('layouts')
    .delete()
    .eq('id', layoutId)
    .eq('user_id', userId);

  if (error) throw error;
};