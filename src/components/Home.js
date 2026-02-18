import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Flame, Trophy, Gamepad2, ChevronRight, BarChart3, Award, Lock } from 'lucide-react';
import { games, getGameById, GAME_CATEGORIES } from '../config/games';
import { getStreak, getOverallScore, getGamesPlayedToday, getRecentlyPlayed } from '../utils/userProgress';
import { getCurrentLevel } from '../utils/leveling';
import { getUnlockedAchievements } from '../utils/achievements';
import { usePremium } from '../contexts/PremiumContext';
import { canPlayGame } from '../utils/premium';
import PremiumBadge from './premium/PremiumBadge';
import PremiumGate from './premium/PremiumGate';
import BannerAd from './ads/BannerAd';

function GameCard({ game, compact = false }) {
  const { isPremium } = usePremium();
  const isLocked = !isPremium && !canPlayGame(game.id);

  const cardContent = (
    <div
      className={`bg-slate-800 rounded-2xl border-4 border-transparent hover:border-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl h-full flex flex-col relative ${compact ? 'p-5' : 'p-8'} ${isLocked ? 'opacity-75' : ''}`}
    >
      {isLocked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-5 h-5 text-yellow-400" />
        </div>
      )}
      <div className={`rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform ${compact ? 'w-14 h-14' : 'w-20 h-20 mb-6'}`}>
        <game.icon className={compact ? 'w-8 h-8 text-white' : 'w-12 h-12 text-white'} />
      </div>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h2 className={`font-bold bg-gradient-to-r ${game.color} bg-clip-text text-transparent ${compact ? 'text-xl' : 'text-3xl'}`}>
          {game.title}
        </h2>
        {isLocked && <PremiumBadge size="sm" />}
      </div>
      <p className={`text-gray-400 ${compact ? 'text-sm mb-2' : 'text-xl mb-4'}`}>{game.subtitle}</p>
      {!compact && (
        <>
          <p className="text-gray-300 mb-6 flex-grow line-clamp-2">{game.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {game.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-slate-700 text-cyan-400 text-sm rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </>
      )}
      <span className={`inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r ${game.color} text-white font-bold rounded-xl transition-shadow hover:shadow-lg ${compact ? 'py-2.5 text-sm' : 'py-4 text-lg'}`}>
        {isLocked ? 'PREMIUM REQUIRED' : compact ? 'Play' : 'PLAY NOW'}
        {!isLocked && <ChevronRight className="w-4 h-4" />}
      </span>
    </div>
  );

  if (isLocked) {
    return (
      <PremiumGate gameId={game.id}>
        <div className="group block cursor-pointer">
          {cardContent}
        </div>
      </PremiumGate>
    );
  }

  return (
    <Link to={game.path} className="group block">
      {cardContent}
    </Link>
  );
}

export default function Home() {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { isPremium, remainingGames } = usePremium();

  const streak = getStreak();
  const overallScore = getOverallScore();
  const gamesToday = getGamesPlayedToday();
  const recentlyPlayedIds = getRecentlyPlayed();
  const level = getCurrentLevel();
  const unlockedAchievements = getUnlockedAchievements();

  const recommendedGames = useMemo(() => games.slice(0, 3), []);
  const lastPlayedGame = useMemo(() => {
    const id = recentlyPlayedIds[0];
    return id ? getGameById(id) : null;
  }, [recentlyPlayedIds]);
  const recentGames = useMemo(() => {
    return recentlyPlayedIds
      .map((id) => getGameById(id))
      .filter(Boolean)
      .slice(0, 3);
  }, [recentlyPlayedIds]);

  const filteredGames = useMemo(() => {
    if (categoryFilter === 'all') return games;
    return games.filter((g) => g.category === categoryFilter);
  }, [categoryFilter]);

  const categories = useMemo(() => ['all', ...Object.keys(GAME_CATEGORIES)], []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 pt-6 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Banner Ad - Top */}
        <BannerAd position="top" />
        
        {/* Hero + Quick Stats */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Brain className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-400 animate-pulse flex-shrink-0" />
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              Cognitive Games Hub
            </h1>
          </div>
          <p className="text-lg sm:text-2xl text-gray-300 mb-6">
            Train Your Brain with Science-Backed Games
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-6">
            <Link
              to="/progress"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-600/50 hover:border-cyan-400/50 transition-colors cursor-pointer"
            >
              <span className="text-xs text-cyan-400 font-bold">Lv.{level}</span>
            </Link>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-600/50">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="text-white font-semibold tabular-nums">{streak}</span>
              <span className="text-gray-400 text-sm hidden sm:inline">day streak</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-600/50">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold tabular-nums">{overallScore.toLocaleString()}</span>
              <span className="text-gray-400 text-sm hidden sm:inline">score</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-600/50">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-semibold tabular-nums">{gamesToday}</span>
              <span className="text-gray-400 text-sm hidden sm:inline">today</span>
              {!isPremium && (
                <span className="text-xs text-orange-400 ml-1">
                  ({remainingGames} left)
                </span>
              )}
            </div>
            <Link
              to="/achievements"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-600/50 hover:border-yellow-400/50 transition-colors cursor-pointer"
            >
              <Award className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold tabular-nums">{unlockedAchievements.length}</span>
            </Link>
          </div>
        </div>

        {/* Recommended For You */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">Recommended for you</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        {/* Continue Training (last played) */}
        {lastPlayedGame && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Continue training</h2>
            <div className="max-w-sm">
              <GameCard game={lastPlayedGame} compact />
            </div>
          </section>
        )}

        {/* Recently Played (if more than one) */}
        {recentGames.length > 1 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Recently played</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentGames.slice(1).map((game) => game && <GameCard key={game.id} game={game} compact />)}
            </div>
          </section>
        )}

        {/* All Games + Filter */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-white">All games</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {cat === 'all' ? 'All' : GAME_CATEGORIES[cat]}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400">
          <p className="text-lg">Train daily for 10–15 minutes to see cognitive improvements.</p>
          <p className="text-sm mt-2">All games are designed based on cognitive science research.</p>
        </div>
        
        {/* Banner Ad - Bottom */}
        <BannerAd position="bottom" />
      </div>
    </div>
  );
}
