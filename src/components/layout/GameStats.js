import React from 'react';
import { Trophy, Clock, Heart } from 'lucide-react';

export default function GameStats({ score, timeLeft, lives, extra = null }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 py-3 px-4 rounded-xl bg-slate-800/90 border border-slate-600/50">
      {score !== undefined && (
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-xl font-bold text-white tabular-nums">{score}</span>
          <span className="text-sm text-gray-400">score</span>
        </div>
      )}
      {timeLeft !== undefined && (
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <span className={`text-xl font-bold tabular-nums ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {timeLeft}
          </span>
          <span className="text-sm text-gray-400">sec</span>
        </div>
      )}
      {lives !== undefined && (
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-400" />
          <span className="text-xl font-bold text-white tabular-nums">{lives}</span>
          <span className="text-sm text-gray-400">lives</span>
        </div>
      )}
      {extra}
    </div>
  );
}
