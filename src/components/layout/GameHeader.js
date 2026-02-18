import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Settings } from 'lucide-react';

export default function GameHeader({ gameTitle, onSettings, showHome = true }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between py-3 px-2 mb-2">
      {showHome ? (
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/90 text-white hover:bg-slate-700 border border-slate-600/50 transition-colors"
          aria-label="Back to home"
        >
          <Home className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Home</span>
        </button>
      ) : (
        <div />
      )}
      <h1 className="text-lg sm:text-xl font-bold text-white truncate max-w-[50%] text-center">
        {gameTitle}
      </h1>
      <div className="w-[100px] flex justify-end">
        {onSettings ? (
          <button
            type="button"
            onClick={onSettings}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </div>
    </div>
  );
}
