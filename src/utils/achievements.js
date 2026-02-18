/**
 * Achievement system - tracks and unlocks achievements
 */

const STORAGE_KEY = 'cognitiveHub_achievements';
const STORAGE_KEY_UNLOCKED = 'cognitiveHub_achievementsUnlocked';

export const ACHIEVEMENTS = {
  // First Steps
  FIRST_GAME: {
    id: 'first_game',
    name: 'First Steps',
    description: 'Played your first game',
    icon: '🎮',
    category: 'first_steps',
    condition: (stats) => stats.totalGamesPlayed >= 1,
  },
  FIRST_HIGH_SCORE: {
    id: 'first_high_score',
    name: 'Rising Star',
    description: 'Achieved your first high score',
    icon: '🏆',
    category: 'first_steps',
    condition: (stats) => stats.highScoresCount >= 1,
  },
  FIRST_STREAK_3: {
    id: 'first_streak_3',
    name: 'Getting Started',
    description: 'Reached a 3-day streak',
    icon: '🔥',
    category: 'first_steps',
    condition: (stats) => stats.maxStreak >= 3,
  },

  // Consistency
  STREAK_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    icon: '📅',
    category: 'consistency',
    condition: (stats) => stats.currentStreak >= 7,
  },
  STREAK_30: {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintained a 30-day streak',
    icon: '📆',
    category: 'consistency',
    condition: (stats) => stats.currentStreak >= 30,
  },
  STREAK_100: {
    id: 'streak_100',
    name: 'Centurion',
    description: 'Maintained a 100-day streak',
    icon: '💯',
    category: 'consistency',
    condition: (stats) => stats.currentStreak >= 100,
  },

  // Milestones
  GAMES_10: {
    id: 'games_10',
    name: 'Getting Serious',
    description: 'Played 10 games',
    icon: '🎯',
    category: 'milestones',
    condition: (stats) => stats.totalGamesPlayed >= 10,
  },
  GAMES_100: {
    id: 'games_100',
    name: 'Century Club',
    description: 'Played 100 games',
    icon: '💯',
    category: 'milestones',
    condition: (stats) => stats.totalGamesPlayed >= 100,
  },
  GAMES_500: {
    id: 'games_500',
    name: 'Dedicated',
    description: 'Played 500 games',
    icon: '🌟',
    category: 'milestones',
    condition: (stats) => stats.totalGamesPlayed >= 500,
  },
  SCORE_1000: {
    id: 'score_1000',
    name: 'Thousand Club',
    description: 'Reached 1,000 total score',
    icon: '🎖️',
    category: 'milestones',
    condition: (stats) => stats.overallScore >= 1000,
  },
  SCORE_10000: {
    id: 'score_10000',
    name: 'Ten Thousand',
    description: 'Reached 10,000 total score',
    icon: '👑',
    category: 'milestones',
    condition: (stats) => stats.overallScore >= 10000,
  },

  // Mastery
  PERFECT_GAME: {
    id: 'perfect_game',
    name: 'Perfect Game',
    description: 'Completed a game with no mistakes',
    icon: '✨',
    category: 'mastery',
    condition: (stats) => stats.perfectGames >= 1,
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Average reaction time under 500ms',
    icon: '⚡',
    category: 'mastery',
    condition: (stats) => stats.avgReactionTime > 0 && stats.avgReactionTime < 500,
  },
  MEMORY_MASTER: {
    id: 'memory_master',
    name: 'Memory Master',
    description: '100% accuracy in memory games',
    icon: '🧠',
    category: 'mastery',
    condition: (stats) => stats.memoryAccuracy >= 100,
  },
};

export function getUnlockedAchievements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UNLOCKED);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function unlockAchievement(achievementId) {
  try {
    const unlocked = getUnlockedAchievements();
    if (!unlocked.includes(achievementId)) {
      const newUnlocked = [...unlocked, achievementId];
      localStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(newUnlocked));
      return true; // Newly unlocked
    }
    return false; // Already unlocked
  } catch (e) {
    console.warn('achievements.unlockAchievement failed', e);
    return false;
  }
}

export function checkAchievements(stats) {
  const unlocked = getUnlockedAchievements();
  const newlyUnlocked = [];

  Object.values(ACHIEVEMENTS).forEach((achievement) => {
    if (!unlocked.includes(achievement.id) && achievement.condition(stats)) {
      if (unlockAchievement(achievement.id)) {
        newlyUnlocked.push(achievement);
      }
    }
  });

  return newlyUnlocked;
}

export function getAchievementById(id) {
  return Object.values(ACHIEVEMENTS).find((a) => a.id === id) || null;
}

export function getAchievementsByCategory(category) {
  return Object.values(ACHIEVEMENTS).filter((a) => a.category === category);
}
