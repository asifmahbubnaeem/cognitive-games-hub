/**
 * User progress utilities - localStorage-based (Phase 1)
 * Used for streak, overall score, recently played, and games played today.
 */

const STORAGE_KEYS = {
  STREAK: 'cognitiveHub_streak',
  LAST_PLAY_DATE: 'cognitiveHub_lastPlayDate',
  OVERALL_SCORE: 'cognitiveHub_overallScore',
  RECENTLY_PLAYED: 'cognitiveHub_recentlyPlayed',
  GAMES_PLAYED_TODAY: 'cognitiveHub_gamesPlayedToday',
  LAST_GAMES_DATE: 'cognitiveHub_lastGamesDate',
  TOTAL_GAMES_PLAYED: 'cognitiveHub_totalGamesPlayed',
  ONBOARDING_COMPLETE: 'cognitiveHub_onboardingComplete',
  USER_GOALS: 'cognitiveHub_userGoals',
  ASSESSMENT_RESULTS: 'cognitiveHub_assessmentResults',
};

const MAX_RECENTLY_PLAYED = 5;

function getTodayKey() {
  return new Date().toDateString();
}

export function getStreak() {
  try {
    const last = localStorage.getItem(STORAGE_KEYS.LAST_PLAY_DATE);
    const streak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0', 10);
    if (!last) return 0;
    const lastDate = new Date(last);
    const todayDate = new Date();
    const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return streak; // already played today
    if (diffDays === 1) return streak + 1; // played yesterday, continue streak
    return 0; // streak broken
  } catch {
    return 0;
  }
}

export function recordPlayedGame(gameId, score = 0, options = {}) {
  try {
    const { difficulty = 'beginner', accuracy = 0, perfect = false } = options;
    const today = getTodayKey();
    const lastDateKey = localStorage.getItem(STORAGE_KEYS.LAST_GAMES_DATE);
    let gamesToday = parseInt(localStorage.getItem(STORAGE_KEYS.GAMES_PLAYED_TODAY) || '0', 10);
    let streak = parseInt(localStorage.getItem(STORAGE_KEYS.STREAK) || '0', 10);

    if (lastDateKey !== today) {
      gamesToday = 0;
      if (lastDateKey) {
        const lastDate = new Date(lastDateKey);
        const todayDate = new Date();
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) streak += 1;
        else if (diffDays > 1) streak = 0;
      } else {
        streak = 1;
      }
    }
    gamesToday += 1;
    streak = streak || 1;

    localStorage.setItem(STORAGE_KEYS.LAST_PLAY_DATE, new Date().toISOString());
    localStorage.setItem(STORAGE_KEYS.LAST_GAMES_DATE, today);
    localStorage.setItem(STORAGE_KEYS.GAMES_PLAYED_TODAY, String(gamesToday));
    localStorage.setItem(STORAGE_KEYS.STREAK, String(streak));
    
    // Track max streak
    const maxStreak = parseInt(localStorage.getItem('cognitiveHub_maxStreak') || '0', 10);
    if (streak > maxStreak) {
      localStorage.setItem('cognitiveHub_maxStreak', String(streak));
    }
    
    // Track perfect games
    if (perfect) {
      const perfectCount = parseInt(localStorage.getItem('cognitiveHub_perfectGames') || '0', 10) + 1;
      localStorage.setItem('cognitiveHub_perfectGames', String(perfectCount));
    }

    const total = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_GAMES_PLAYED) || '0', 10) + 1;
    localStorage.setItem(STORAGE_KEYS.TOTAL_GAMES_PLAYED, String(total));

    const overall = parseInt(localStorage.getItem(STORAGE_KEYS.OVERALL_SCORE) || '0', 10) + Math.min(score, 500);
    localStorage.setItem(STORAGE_KEYS.OVERALL_SCORE, String(overall));

    const recent = getRecentlyPlayed();
    const filtered = recent.filter((id) => id !== gameId);
    filtered.unshift(gameId);
    localStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(filtered.slice(0, MAX_RECENTLY_PLAYED)));

    // Award XP (imported dynamically to avoid circular dependency)
    import('./leveling').then(({ addXP, calculateXPFromGame }) => {
      const xpGained = calculateXPFromGame(score, difficulty, perfect);
      addXP(xpGained);
    });

    // Record skill performance (imported dynamically)
    import('./skills').then(({ recordSkillPerformance }) => {
      recordSkillPerformance(gameId, score, accuracy);
    });

    // Check achievements (imported dynamically)
    import('./achievements').then(({ checkAchievements }) => {
      const stats = {
        totalGamesPlayed: total,
        currentStreak: streak,
        maxStreak: Math.max(streak, parseInt(localStorage.getItem('cognitiveHub_maxStreak') || '0', 10)),
        overallScore: overall,
        highScoresCount: Object.keys(JSON.parse(localStorage.getItem('cognitiveHub_highScores') || '{}')).length,
        perfectGames: perfect ? 1 : 0,
        avgReactionTime: 0, // Would need to track this separately
        memoryAccuracy: accuracy,
      };
      checkAchievements(stats);
    });
  } catch (e) {
    console.warn('userProgress.recordPlayedGame failed', e);
  }
}

export function getOverallScore() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEYS.OVERALL_SCORE) || '0', 10);
  } catch {
    return 0;
  }
}

export function getGamesPlayedToday() {
  try {
    const today = getTodayKey();
    const last = localStorage.getItem(STORAGE_KEYS.LAST_GAMES_DATE);
    if (last !== today) return 0;
    return parseInt(localStorage.getItem(STORAGE_KEYS.GAMES_PLAYED_TODAY) || '0', 10);
  } catch {
    return 0;
  }
}

export function getRecentlyPlayed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getTotalGamesPlayed() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_GAMES_PLAYED) || '0', 10);
  } catch {
    return 0;
  }
}

export function isOnboardingComplete() {
  try {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE) === 'true';
  } catch {
    return false;
  }
}

export function setOnboardingComplete() {
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
  } catch (e) {
    console.warn('userProgress.setOnboardingComplete failed', e);
  }
}

export function getUserGoals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_GOALS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setUserGoals(goals) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_GOALS, JSON.stringify(goals));
  } catch (e) {
    console.warn('userProgress.setUserGoals failed', e);
  }
}

export function getAssessmentResults() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSESSMENT_RESULTS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAssessmentResults(results) {
  try {
    localStorage.setItem(STORAGE_KEYS.ASSESSMENT_RESULTS, JSON.stringify(results));
  } catch (e) {
    console.warn('userProgress.setAssessmentResults failed', e);
  }
}
