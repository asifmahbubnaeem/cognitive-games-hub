import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Flame, Trophy, Settings, BarChart3, Award } from 'lucide-react';
import { getStreak, getOverallScore } from '../utils/userProgress';
import { getCurrentLevel } from '../utils/leveling';
import { usePremium } from '../contexts/PremiumContext';
import PremiumBadge from './premium/PremiumBadge';

export default function NavigationBar() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { isPremium } = usePremium();

  const streak = getStreak();
  const overallScore = getOverallScore();
  const level = getCurrentLevel();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-white hover:text-cyan-400 transition-colors"
          aria-label="Home"
        >
          <Brain className="w-8 h-8 text-cyan-400 flex-shrink-0" />
          <span className="text-xl font-bold hidden sm:inline">Cognitive Hub</span>
          {isPremium && <PremiumBadge size="sm" />}
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {!isHome && (
            <>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-600/50"
                title="Level"
              >
                <span className="text-xs text-cyan-400 font-bold">Lv.{level}</span>
              </div>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-600/50"
                title="Overall score"
              >
                <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-white tabular-nums hidden sm:inline">
                  {overallScore.toLocaleString()}
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-600/50"
                title="Day streak"
              >
                <Flame className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-white tabular-nums">
                  {streak}
                </span>
                <span className="text-xs text-gray-400 hidden md:inline">day{streak !== 1 ? 's' : ''}</span>
              </div>
            </>
          )}
          <Link
            to="/progress"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            aria-label="Progress"
            title="View Progress"
          >
            <BarChart3 className="w-5 h-5" />
          </Link>
          <Link
            to="/achievements"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            aria-label="Achievements"
            title="View Achievements"
          >
            <Award className="w-5 h-5" />
          </Link>
          <Link
            to="/"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            aria-label="Home"
            title="Home"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
