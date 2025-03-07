import { useState, useCallback } from 'react';
import * as layoutService from '../services/layout.service';
import { useUser } from '../context/UserContext';
import type { Widget } from '../types';

export const useLayouts = (onLayoutApplied: (widgets: Widget[]) => void) => {
  const { user } = useUser();
  const [layouts, setLayouts] = useState<Array<{id: string; name: string}>>([]);
  const [activeLayoutId, setActiveLayoutId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLayouts = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await layoutService.getLayouts(user.id);
      setLayouts(data.map(({ id, name }) => ({ id, name })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load layouts');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveCurrentLayout = useCallback(async (name: string, widgets: Widget[]) => {
    if (!user) return;

    try {
      setError(null);
      const layout = await layoutService.saveLayout(user.id, name, widgets);
      setLayouts(prev => [{ id: layout.id, name: layout.name }, ...prev]);
      setActiveLayoutId(layout.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save layout');
    }
  }, [user]);

  const applyLayout = useCallback(async (layoutId: string) => {
    if (!user) return;

    try {
      setError(null);
      const widgets = await layoutService.applyLayout(layoutId, user.id);
      setActiveLayoutId(layoutId);
      onLayoutApplied(widgets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply layout');
    }
  }, [user, onLayoutApplied]);

  const deleteLayout = useCallback(async (layoutId: string) => {
    if (!user) return;

    try {
      setError(null);
      await layoutService.deleteLayout(layoutId, user.id);
      setLayouts(prev => prev.filter(l => l.id !== layoutId));
      if (activeLayoutId === layoutId) {
        setActiveLayoutId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete layout');
    }
  }, [user, activeLayoutId]);

  return {
    layouts,
    activeLayoutId,
    isLoading,
    error,
    loadLayouts,
    saveCurrentLayout,
    applyLayout,
    deleteLayout
  };
};