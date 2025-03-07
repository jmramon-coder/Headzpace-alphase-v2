import React from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { SaveWorkspaceModal } from './SaveWorkspaceModal';
import { useAuthContext } from '../../context/AuthContext';
import { Tooltip } from '../ui/Tooltip';
import { useUser } from '../../context/UserContext';

interface Props {
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onSignIn: () => void;
}

export const SaveIndicator = ({ hasUnsavedChanges, onSave, onSignIn }: Props) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { user } = useUser();
  
  // Show for all users including guests
  if (!user) return null;

  return (
    <>
      <button
        onClick={onSave}
        className={`fixed top-4 left-4 z-50 group flex items-center gap-2 px-3 py-2 rounded-lg transition-all backdrop-blur-sm ${
          hasUnsavedChanges
            ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/20'
            : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20'
        }`}
      >
        <div className="relative">
          {hasUnsavedChanges ? (
            <AlertCircle className="w-4 h-4 animate-pulse" />
          ) : (
            <Save className="w-4 h-4" />
          )}
        </div>
        <span className="text-sm font-medium">
          {hasUnsavedChanges ? 'Unsaved Changes' : 'Workspace Saved'}
        </span>
        <Tooltip>
          Click to save your workspace
        </Tooltip>
      </button>
    </>
  );
};