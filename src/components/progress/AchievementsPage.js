import React, { useState, useMemo } from 'react';
import { Trophy, Lock, CheckCircle } from 'lucide-react';
import { ACHIEVEMENTS, getUnlockedAchievements, getAchievementsByCategory } from '../../utils/achievements';

const CATEGORIES = {
  first_steps: 'First Steps',
  consistency: 'Consistency',
  milestones: 'Milestones',
  mastery: 'Mastery',
};

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const unlocked = getUnlockedAchievements();

  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') {
      return Object.values(ACHIEVEMENTS);
    }
    return getAchievementsByCategory(selectedCategory);
  }, [selectedCategory]);

  const unlockedCount = unlocked.length;
  const totalCount = Object.keys(ACHIEVEMENTS).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-2">
            Achievements
          </h1>
          <p className="text-gray-400 text-lg">
            {unlockedCount} of {totalCount} unlocked
          </p>
          <div className="w-full max-w-md mx-auto bg-slate-800 rounded-full h-3 mt-4">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORIES).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === key
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => {
            const isUnlocked = unlocked.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`rounded-xl p-6 border-2 transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-yellow-500/50 shadow-lg'
                    : 'bg-slate-800/50 border-slate-600/30 opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`text-4xl flex-shrink-0 ${
                      isUnlocked ? '' : 'grayscale opacity-50'
                    }`}
                  >
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                        {achievement.name}
                      </h3>
                      {isUnlocked ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <p className={`text-sm ${isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No achievements in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
