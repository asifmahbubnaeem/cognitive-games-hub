import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import OnboardingFlow from './onboarding/OnboardingFlow';
import { isOnboardingComplete } from '../utils/userProgress';

export default function OnboardingWrapper({ children }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Only show onboarding on home page
    if (location.pathname === '/') {
      const completed = isOnboardingComplete();
      setShowOnboarding(!completed);
    } else {
      setShowOnboarding(false);
    }
    setIsChecking(false);
  }, [location.pathname]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (isChecking) {
    return null; // Or a loading spinner
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return children;
}
