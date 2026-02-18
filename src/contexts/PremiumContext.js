import React, { createContext, useContext, useState, useEffect } from 'react';
import { isPremium, hasUsedTrial, getRemainingGames } from '../utils/premium';

const PremiumContext = createContext();

export function PremiumProvider({ children }) {
  const [premium, setPremiumState] = useState(isPremium());
  const [remainingGames, setRemainingGames] = useState(getRemainingGames());

  useEffect(() => {
    const interval = setInterval(() => {
      setPremiumState(isPremium());
      setRemainingGames(getRemainingGames());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    isPremium: premium,
    hasUsedTrial: hasUsedTrial(),
    remainingGames,
    refresh: () => {
      setPremiumState(isPremium());
      setRemainingGames(getRemainingGames());
    },
  };

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
}
