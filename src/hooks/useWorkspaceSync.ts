import { useState, useCallback, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import * as widgetService from '../services/widget.service';
import * as layoutService from '../services/layout.service';
import type { Widget } from '../types';

export const useWorkspaceSync = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's workspace data from Supabase
  const loadWorkspace = useCallback(async () => {
    if (!user || user.email === 'guest') return;

    try {
      setIsLoading(true);
      setError(null);

      // Load widgets
      const widgets = await widgetService.getWidgets(user.id);
      
      // Load layouts
      const layouts = await layoutService.getLayouts(user.id);

      return {
        widgets,
        layouts
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workspace');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Save current workspace state to Supabase
  const saveWorkspace = useCallback(async (widgets: Widget[]) => {
    if (!user || user.email === 'guest') return;

    try {
      setIsLoading(true);
      setError(null);

      // Save each widget
      await Promise.all(widgets.map(widget => 
        widgetService.saveWidget(widget, user.id)
      ));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workspace');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    isLoading,
    error,
    loadWorkspace,
    saveWorkspace
  };
};