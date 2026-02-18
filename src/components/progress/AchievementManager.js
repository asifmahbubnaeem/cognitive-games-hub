import React, { useState, useEffect, useRef } from 'react';
import AchievementNotification from './AchievementNotification';
import LevelUpNotification from './LevelUpNotification';
import { checkAchievements } from '../../utils/achievements';
import { getTotalGamesPlayed, getOverallScore, getStreak } from '../../utils/userProgress';
import { getCurrentLevel } from '../../utils/leveling';

export default function AchievementManager() {
  const [newAchievements, setNewAchievements] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [levelUp, setLevelUp] = useState(null);
  const lastLevelRef = useRef(getCurrentLevel());

  useEffect(() => {
    // Check level ups
    const checkLevel = () => {
      const currentLevel = getCurrentLevel();
      if (currentLevel > lastLevelRef.current) {
        setLevelUp(currentLevel);
        lastLevelRef.current = currentLevel;
      }
    };

    // Check achievements and level periodically
    const checkInterval = setInterval(() => {
      checkLevel();
      
      const stats = {
        totalGamesPlayed: getTotalGamesPlayed(),
        currentStreak: getStreak(),
        maxStreak: parseInt(localStorage.getItem('cognitiveHub_maxStreak') || '0', 10),
        overallScore: getOverallScore(),
        highScoresCount: Object.keys(JSON.parse(localStorage.getItem('cognitiveHub_highScores') || '{}')).length,
        perfectGames: parseInt(localStorage.getItem('cognitiveHub_perfectGames') || '0', 10),
        avgReactionTime: parseInt(localStorage.getItem('cognitiveHub_avgReactionTime') || '0', 10),
        memoryAccuracy: parseInt(localStorage.getItem('cognitiveHub_memoryAccuracy') || '0', 10),
      };

      const newlyUnlocked = checkAchievements(stats);
      if (newlyUnlocked.length > 0) {
        setNewAchievements((prev) => [...prev, ...newlyUnlocked]);
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, []);

  useEffect(() => {
    if (newAchievements.length > 0 && !currentNotification) {
      setCurrentNotification(newAchievements[0]);
      setNewAchievements((prev) => prev.slice(1));
    }
  }, [newAchievements, currentNotification]);

  const handleAchievementClose = () => {
    setCurrentNotification(null);
  };

  const handleLevelUpClose = () => {
    setLevelUp(null);
  };

  return (
    <>
      {levelUp && (
        <LevelUpNotification level={levelUp} onClose={handleLevelUpClose} />
      )}
      {currentNotification && !levelUp && (
        <AchievementNotification achievement={currentNotification} onClose={handleAchievementClose} />
      )}
    </>
  );
}
