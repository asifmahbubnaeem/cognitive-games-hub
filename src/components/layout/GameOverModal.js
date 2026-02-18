import React from 'react';
import { Trophy, RotateCcw, Home, Share2 } from 'lucide-react';

export default function GameOverModal({
  score,
  isNewHighScore = false,
  stats = null,
  achievementMessage = null,
  onPlayAgain,
  onHome,
  onShare,
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-600 max-w-md w-full p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Game Over!</h2>
          <p className="text-gray-400 text-sm">Here’s how you did</p>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-5 mb-5 border border-slate-600/50">
          <p className="text-center text-gray-400 text-sm mb-1">Final Score</p>
          <p className="text-center text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            {score}
          </p>
          {isNewHighScore && (
            <p className="text-center text-yellow-400 font-semibold mt-2 text-sm">New high score!</p>
          )}
        </div>

        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-5">
            {stats.map(({ label, value }, i) => (
              <div key={i} className="bg-slate-900/60 rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        )}

        {achievementMessage && (
          <div className="mb-5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-sm text-amber-200 text-center">{achievementMessage}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {onPlayAgain && (
            <button
              type="button"
              onClick={onPlayAgain}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold hover:opacity-90 transition-opacity"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
          )}
          {onHome && (
            <button
              type="button"
              onClick={onHome}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-colors"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
          )}
          {onShare && (
            <button
              type="button"
              onClick={onShare}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-colors"
              aria-label="Share score"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
