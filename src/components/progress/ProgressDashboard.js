import React from 'react';
import { Trophy, TrendingUp, Brain, Zap, Eye, Puzzle, Target, Crosshair } from 'lucide-react';
import { getOverallScore, getStreak, getTotalGamesPlayed } from '../../utils/userProgress';
import { getCurrentLevel, getCurrentXP, getXPProgress, getLevelTitle } from '../../utils/leveling';
import { getAllSkillScores, getOverallCognitiveScore } from '../../utils/skills';

const SKILL_ICONS = {
  memory: Brain,
  speed: Zap,
  attention: Eye,
  logic: Puzzle,
  reaction: Crosshair,
  strategy: Target,
};

const SKILL_LABELS = {
  memory: 'Memory',
  speed: 'Processing Speed',
  attention: 'Attention',
  logic: 'Logic & Reasoning',
  reaction: 'Reaction',
  strategy: 'Strategy',
};

export default function ProgressDashboard() {
  const overallScore = getOverallScore();
  const cognitiveScore = getOverallCognitiveScore();
  const streak = getStreak();
  const totalGames = getTotalGamesPlayed();
  const level = getCurrentLevel();
  const xp = getCurrentXP();
  const xpProgress = getXPProgress(level, xp);
  const skillScores = getAllSkillScores();
  const levelTitle = getLevelTitle(level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-8 text-center">
          Your Progress
        </h1>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-600/50">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <h3 className="text-gray-400 text-sm">Overall Score</h3>
            </div>
            <p className="text-4xl font-bold text-white">{overallScore.toLocaleString()}</p>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-600/50">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-cyan-400" />
              <h3 className="text-gray-400 text-sm">Cognitive Score</h3>
            </div>
            <p className="text-4xl font-bold text-white">{cognitiveScore}/1000</p>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${(cognitiveScore / 1000) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-600/50">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <h3 className="text-gray-400 text-sm">Total Games</h3>
            </div>
            <p className="text-4xl font-bold text-white">{totalGames}</p>
          </div>
        </div>

        {/* Level & XP */}
        <div className="bg-slate-800/80 rounded-2xl p-6 mb-8 border border-slate-600/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Level {level} - {levelTitle}
              </h2>
              <p className="text-gray-400 text-sm">Keep playing to level up!</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-cyan-400">{xp.toLocaleString()}</p>
              <p className="text-gray-400 text-sm">Total XP</p>
            </div>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-4 rounded-full transition-all flex items-center justify-end pr-2"
              style={{ width: `${xpProgress.progress}%` }}
            >
              {xpProgress.progress > 10 && (
                <span className="text-xs font-semibold text-white">
                  {Math.round(xpProgress.progress)}%
                </span>
              )}
            </div>
          </div>
          {xpProgress.required && (
            <p className="text-sm text-gray-400 mt-2 text-center">
              {xpProgress.current.toLocaleString()} / {xpProgress.required.toLocaleString()} XP to Level {level + 1}
            </p>
          )}
        </div>

        {/* Skill Breakdown */}
        <div className="bg-slate-800/80 rounded-2xl p-6 mb-8 border border-slate-600/50">
          <h2 className="text-2xl font-bold text-white mb-6">Skill Breakdown</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(skillScores).map(([skill, score]) => {
              const Icon = SKILL_ICONS[skill];
              return (
                <div key={skill} className="bg-slate-900/50 rounded-xl p-4 border border-slate-600/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className="w-5 h-5 text-cyan-400" />}
                      <h3 className="font-semibold text-white text-sm">{SKILL_LABELS[skill]}</h3>
                    </div>
                    <span className="text-lg font-bold text-cyan-400">{score}/100</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">🔥 {streak} Day Streak</h2>
              <p className="text-gray-300">Keep training daily to maintain your streak!</p>
            </div>
            <div className="text-right">
              {streak >= 7 && <p className="text-green-400 font-semibold">Week Warrior! 🎉</p>}
              {streak >= 30 && <p className="text-yellow-400 font-semibold">Monthly Master! 🌟</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
