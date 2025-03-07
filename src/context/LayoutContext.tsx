import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { DEFAULT_LAYOUT } from '../utils/layouts';
import { useWorkspace } from '../hooks/useWorkspace';
import type { CustomLayout, Widget } from '../types';

interface LayoutContextType {
  customLayouts: CustomLayout[];
  currentLayout: CustomLayout | null;
  defaultLayout: CustomLayout;
  hasUnsavedChanges: boolean;
  saveCurrentLayout: (name: string, widgets: Widget[]) => void;
  deleteLayout: (id: string) => void;
  applyLayout: (layout: CustomLayout) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [customLayouts, setCustomLayouts] = useState<CustomLayout[]>(() => {
    try {
      // Run cleanup before loading layouts
      storage.cleanup();
      
      const stored = storage.get<CustomLayout[]>('custom_layouts');
      return stored ? [DEFAULT_LAYOUT, ...stored] : [DEFAULT_LAYOUT];
    } catch (error) {
      console.error('Failed to load layouts:', error);
      return [DEFAULT_LAYOUT];
    }
  });
  
  const [currentLayout, setCurrentLayout] = useState<CustomLayout | null>(() => {
    // Try to load last used layout from storage
    try {
      const stored = storage.get<CustomLayout>('last_used_layout');
      return stored || DEFAULT_LAYOUT;
    } catch (error) {
      console.error('Failed to load last used layout:', error);
      return DEFAULT_LAYOUT;
    }
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { saveWorkspace } = useWorkspace([], () => {});

  // Auto-save when changes occur
  useEffect(() => {
    if (hasUnsavedChanges) {
      const saveTimer = setTimeout(() => {
        saveWorkspace();
        setHasUnsavedChanges(false);
      }, 1000); // Debounce saves by 1 second

      return () => clearTimeout(saveTimer);
    }
  }, [hasUnsavedChanges, saveWorkspace]);

  useEffect(() => {
    // Only save custom layouts (exclude default)
    const layoutsToSave = customLayouts.filter(layout => layout.id !== 'default');
    if (!storage.set('custom_layouts', layoutsToSave)) {
      console.warn('Failed to save layouts due to storage limits');
      // Optionally show a user notification here
    }
  }, [customLayouts]);

  const saveCurrentLayout = (name: string, widgets: Widget[]) => {
    const layout: CustomLayout = {
      id: crypto.randomUUID(),
      name,
      description: `Layout saved on ${new Date().toLocaleDateString()}`,
      widgets: widgets.map(widget => ({
        ...widget,
        position: { ...widget.position },
        size: { ...widget.size },
        defaultImages: widget.defaultImages ? [...widget.defaultImages] : undefined
      })),
      createdAt: Date.now()
    };

    setCustomLayouts(prev => {
      const withoutDefault = prev.filter(layout => layout.id !== 'default');
      return [DEFAULT_LAYOUT, ...withoutDefault, layout];
    });
    
    setCurrentLayout(layout);
    storage.set('last_used_layout', layout);
    
    // Save to custom layouts storage
    const updatedLayouts = storage.get<CustomLayout[]>('custom_layouts') || [];
    storage.set('custom_layouts', [...updatedLayouts, layout]);
    
    setHasUnsavedChanges(false);
  };

  const deleteLayout = (id: string) => {
    if (id === 'default') return;
    setCustomLayouts(prev => prev.filter(layout => layout.id !== id));
    if (currentLayout?.id === id) {
      setCurrentLayout(DEFAULT_LAYOUT);
      setHasUnsavedChanges(true);
    }
  };

  const applyLayout = (layout: CustomLayout) => {
    setCurrentLayout({
      ...layout,
      widgets: layout.widgets.map(widget => ({
        ...widget,
        id: crypto.randomUUID(),
        position: { ...widget.position },
        size: { ...widget.size }
      }))
    });
    setHasUnsavedChanges(true);
    
    // Save as last used layout
    storage.set('last_used_layout', layout);
  };

  return (
    <LayoutContext.Provider value={{
      customLayouts,
      currentLayout,
      defaultLayout: DEFAULT_LAYOUT,
      hasUnsavedChanges,
      saveCurrentLayout,
      deleteLayout,
      applyLayout
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}