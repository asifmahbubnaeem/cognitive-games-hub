/**
 * Skill tracking system - tracks performance per cognitive skill
 */

const STORAGE_KEY_SKILLS = 'cognitiveHub_skills';

const SKILL_CATEGORIES = {
  memory: ['number-chain', 'water-bubble'],
  speed: ['speed-truth', 'speed-match'],
  attention: ['focus-flow', 'gate-keeper'],
  logic: ['logic-lattice', 'glyph-walker', 'symbol-seeker', 'mind-fold'],
  reaction: ['color-match', 'neon-defender'],
  strategy: ['quick-decision', 'merge-conquer'],
};

export function getSkillScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SKILLS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function recordSkillPerformance(gameId, score, accuracy = 0) {
  try {
    const skills = getSkillScores();
    
    // Find which skill category this game belongs to
    let category = null;
    for (const [cat, games] of Object.entries(SKILL_CATEGORIES)) {
      if (games.includes(gameId)) {
        category = cat;
        break;
      }
    }
    
    if (!category) return;

    if (!skills[category]) {
      skills[category] = {
        totalScore: 0,
        totalGames: 0,
        totalAccuracy: 0,
        bestScore: 0,
        games: [],
      };
    }

    const skill = skills[category];
    skill.totalScore += score;
    skill.totalGames += 1;
    skill.totalAccuracy = (skill.totalAccuracy * (skill.totalGames - 1) + accuracy) / skill.totalGames;
    skill.bestScore = Math.max(skill.bestScore, score);
    skill.games.push({ gameId, score, accuracy, timestamp: Date.now() });

    // Keep only last 50 games per skill
    if (skill.games.length > 50) {
      skill.games = skill.games.slice(-50);
    }

    localStorage.setItem(STORAGE_KEY_SKILLS, JSON.stringify(skills));
  } catch (e) {
    console.warn('skills.recordSkillPerformance failed', e);
  }
}

export function getSkillScore(category) {
  const skills = getSkillScores();
  const skill = skills[category];
  if (!skill || skill.totalGames === 0) return 0;
  
  // Calculate skill score (0-100) based on average performance
  const avgScore = skill.totalScore / skill.totalGames;
  const avgAccuracy = skill.totalAccuracy || 0;
  
  // Normalize to 0-100 scale (assuming max game score is ~500)
  const normalizedScore = Math.min(100, (avgScore / 500) * 100);
  const accuracyWeight = avgAccuracy;
  
  return Math.round((normalizedScore * 0.6 + accuracyWeight * 0.4));
}

export function getAllSkillScores() {
  const categories = Object.keys(SKILL_CATEGORIES);
  return categories.reduce((acc, cat) => {
    acc[cat] = getSkillScore(cat);
    return acc;
  }, {});
}

export function getOverallCognitiveScore() {
  const skillScores = getAllSkillScores();
  const values = Object.values(skillScores);
  if (values.length === 0) return 0;
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(average * 10); // Scale to 0-1000
}
