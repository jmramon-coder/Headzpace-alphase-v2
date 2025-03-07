import { useState, useCallback } from 'react';
import * as widgetService from '../services/widget.service';
import { useUser } from '../context/UserContext';
import type { Widget } from '../types';

export const useWidgets = () => {
  const { user } = useUser();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWidgets = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const loadedWidgets = await widgetService.getWidgets(user.id);
      setWidgets(loadedWidgets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load widgets');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveWidget = useCallback(async (widget: Widget) => {
    if (!user) return;

    try {
      setError(null);
      const savedWidget = await widgetService.saveWidget(widget, user.id);
      setWidgets(prev => [...prev, savedWidget]);
      return savedWidget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save widget');
    }
  }, [user]);

  const updateWidget = useCallback(async (widget: Widget) => {
    if (!user) return;

    try {
      setError(null);
      const updatedWidget = await widgetService.updateWidget(widget, user.id);
      setWidgets(prev => prev.map(w => w.id === widget.id ? updatedWidget : w));
      return updatedWidget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update widget');
    }
  }, [user]);

  const deleteWidget = useCallback(async (widgetId: string) => {
    if (!user) return;

    try {
      setError(null);
      await widgetService.deleteWidget(widgetId, user.id);
      setWidgets(prev => prev.filter(w => w.id !== widgetId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete widget');
    }
  }, [user]);

  return {
    widgets,
    isLoading,
    error,
    loadWidgets,
    saveWidget,
    updateWidget,
    deleteWidget
  };
};