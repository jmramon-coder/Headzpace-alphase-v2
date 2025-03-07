import React from 'react';
import { Twitter, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SocialBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white/80 dark:bg-black/30 backdrop-blur-sm border-t border-slate-200 dark:border-cyan-500/20 py-2">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Built by ramon.jm
          </p>
          <a
            href="https://x.com/DeepLensRJM"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors"
            aria-label="Follow on X (Twitter)"
          >
            <Twitter className="w-4 h-4" />
          </a>
        </div>
        <button
          onClick={() => navigate('/about')}
          className="flex items-center gap-2 px-3 py-1 text-sm text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
        >
          <Info className="w-4 h-4" />
          <span>About</span>
        </button>
      </div>
    </div>
  );
};