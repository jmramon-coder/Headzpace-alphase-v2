import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import type { Widget } from '../types';

type DbWidget = Database['public']['Tables']['widgets']['Row'];
type NewDbWidget = Database['public']['Tables']['widgets']['Insert'];

// Convert app widget to database format
const toDbWidget = (widget: Widget, userId: string): NewDbWidget => ({
  user_id: userId,
  type: widget.type,
  position_x: widget.position.x,
  position_y: widget.position.y,
  width: widget.size.width,
  height: widget.size.height
});

// Convert database widget to app format
const fromDbWidget = (dbWidget: DbWidget): Widget => ({
  id: dbWidget.id,
  type: dbWidget.type as Widget['type'],
  position: {
    x: dbWidget.position_x,
    y: dbWidget.position_y
  },
  size: {
    width: dbWidget.width,
    height: dbWidget.height
  }
});

export const getWidgets = async (userId: string): Promise<Widget[]> => {
  const { data, error } = await supabase
    .from('widgets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(fromDbWidget);
};

export const saveWidget = async (widget: Widget, userId: string): Promise<Widget> => {
  const { data, error } = await supabase
    .from('widgets')
    .insert([toDbWidget(widget, userId)])
    .select()
    .single();

  if (error) throw error;
  return fromDbWidget(data);
};

export const updateWidget = async (widget: Widget, userId: string): Promise<Widget> => {
  const { data, error } = await supabase
    .from('widgets')
    .update(toDbWidget(widget, userId))
    .eq('id', widget.id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return fromDbWidget(data);
};

export const deleteWidget = async (widgetId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('widgets')
    .delete()
    .eq('id', widgetId)
    .eq('user_id', userId);

  if (error) throw error;
};