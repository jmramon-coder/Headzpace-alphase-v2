import React, { useState, useRef, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Trash2, Database, LayoutGrid, Image, Key, Download } from 'lucide-react';
import { useLayout } from '../../../context/LayoutContext';
import { ClearDataModal } from '../modals/ClearDataModal';
import { ImportWorkspaceModal } from '../../workspace/ImportWorkspaceModal';
import { useWorkspace } from '../../../hooks/useWorkspace';
import { StorageStats } from './StorageStats';

export const GeneralSettings = () => {
  const { defaultLayout } = useLayout();
  const [storageStats, setStorageStats] = React.useState<StorageStats | null>(null);
  const [showClearDataModal, setShowClearDataModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { loadWorkspace, saveWorkspaceToFile } = useWorkspace([], () => {});

  React.useEffect(() => {
    // Calculate storage stats
    const stats = {
      layouts: {
        count: Object.keys(localStorage)
          .filter(key => key.startsWith('custom_layouts')).length,
        size: new Blob([localStorage.getItem('custom_layouts') || '']).size
      },
      apiKeys: {
        count: Object.keys(localStorage)
          .filter(key => key === 'openai_api_keys').length,
        size: new Blob([localStorage.getItem('openai_api_keys') || '']).size
      },
      preferences: {
        count: Object.keys(localStorage)
          .filter(key => ['typography_theme', 'size_preset', 'startup_mode'].includes(key)).length,
        size: ['typography_theme', 'size_preset', 'startup_mode']
          .reduce((acc, key) => acc + new Blob([localStorage.getItem(key) || '']).size, 0)
      },
      totalSize: 0
    };
    stats.totalSize = stats.layouts.size + stats.apiKeys.size + stats.preferences.size;
    
    setStorageStats(stats);
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4">
        General Settings
      </h3>

      {/* Storage Information */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-500 dark:text-cyan-500" />
          <h4 className="text-sm font-medium text-slate-800 dark:text-white">Storage Usage</h4>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {storageStats && (
            <>
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <LayoutGrid className="w-4 h-4 text-indigo-500 dark:text-cyan-500" />
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">Layouts</h5>
                </div>
                <p className="text-2xl font-medium text-slate-800 dark:text-white">{storageStats.layouts.count}</p>
                <p className="text-xs text-slate-500">{(storageStats.layouts.size / 1024).toFixed(1)} KB</p>
              </div>
              
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-indigo-500 dark:text-cyan-500" />
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">API Keys</h5>
                </div>
                <p className="text-2xl font-medium text-slate-800 dark:text-white">{storageStats.apiKeys.count}</p>
                <p className="text-xs text-slate-500">{(storageStats.apiKeys.size / 1024).toFixed(1)} KB</p>
              </div>
              
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="w-4 h-4 text-indigo-500 dark:text-cyan-500" />
                  <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Storage</h5>
                </div>
                <p className="text-2xl font-medium text-slate-800 dark:text-white">{(storageStats.totalSize / 1024).toFixed(1)} KB</p>
                <p className="text-xs text-slate-500">of 5 MB limit</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Load Workspace */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-indigo-500 dark:text-cyan-500" />
          <h4 className="text-sm font-medium text-slate-800 dark:text-white">Workspace</h4>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-cyan-500/10 text-left transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <LayoutGrid className="w-4 h-4 text-indigo-500 dark:text-cyan-500" />
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">Import Workspace</h5>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Load a previously saved workspace configuration
            </p>
          </button>

          <button
            onClick={saveWorkspaceToFile}
            className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-cyan-500/10 text-left transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <Download className="w-4 h-4 text-indigo-500 dark:text-cyan-500" />
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300">Download Workspace</h5>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Save your workspace configuration for backup or transfer
            </p>
          </button>
        </div>
      </div>
      
      {/* Clear Data */}
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h4 className="text-base font-medium text-slate-800 dark:text-white">Danger Zone</h4>
        </div>
        
        <div className="p-4 rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/10 backdrop-blur-sm hover:bg-red-100/50 dark:hover:bg-red-500/20 transition-colors group space-y-4">
          <div>
            <h5 className="text-sm font-medium text-red-800 dark:text-red-200">Clear Local Storage</h5>
            <p className="text-sm text-red-600/80 dark:text-red-300/80 mt-1">
              This will remove all saved settings, layouts, and preferences
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setShowClearDataModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20 dark:shadow-red-500/10 group-hover:shadow-xl"
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-medium">Clear Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clear Data Modal */}
      <ClearDataModal
        isOpen={showClearDataModal}
        onClose={() => setShowClearDataModal(false)}
      />
      <ImportWorkspaceModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={loadWorkspace}
      />
    </div>
  );
};

interface StorageStats {
  layouts: { count: number; size: number };
  apiKeys: { count: number; size: number };
  preferences: { count: number; size: number };
  totalSize: number;
}