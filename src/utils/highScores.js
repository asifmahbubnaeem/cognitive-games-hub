const STORAGE_KEY = 'cognitiveHub_highScores';

function getStoredHighScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getHighScore(gameId) {
  try {
    const scores = getStoredHighScores();
    const value = scores[gameId];
    return typeof value === 'number' ? value : parseInt(value || '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function setHighScore(gameId, score) {
  try {
    if (typeof score !== 'number' || Number.isNaN(score) || score <= 0) return false;
    const scores = getStoredHighScores();
    const current = typeof scores[gameId] === 'number'
      ? scores[gameId]
      : parseInt(scores[gameId] || '0', 10) || 0;
    if (score <= current) return false;

    const updated = { ...scores, [gameId]: score };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export function getAllHighScores() {
  return getStoredHighScores();
}

