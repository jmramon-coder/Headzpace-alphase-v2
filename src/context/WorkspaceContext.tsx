import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWorkspaceSync } from '../hooks/useWorkspaceSync';
import { useUser } from './UserContext';
import type { Widget } from '../types';

interface WorkspaceContextType {
  widgets: Widget[];
  isLoading: boolean;
  error: string | null;
  saveWorkspace: () => Promise<void>;
  setWidgets: (widgets: Widget[]) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const { isLoading, error, loadWorkspace, saveWorkspace: syncWorkspace } = useWorkspaceSync();

  // Load workspace when user logs in
  useEffect(() => {
    const initWorkspace = async () => {
      if (!user || user.email === 'guest') return;
      
      const workspace = await loadWorkspace();
      if (workspace) {
        setWidgets(workspace.widgets);
      }
    };

    initWorkspace();
  }, [user, loadWorkspace]);

  const saveWorkspace = async () => {
    await syncWorkspace(widgets);
  };

  return (
    <WorkspaceContext.Provider value={{
      widgets,
      isLoading,
      error,
      saveWorkspace,
      setWidgets
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}