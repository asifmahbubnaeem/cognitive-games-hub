import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeStep from './WelcomeStep';
import QuickAssessment from './QuickAssessment';
import GoalSetting from './GoalSetting';
import { setOnboardingComplete, setUserGoals, setAssessmentResults } from '../../utils/userProgress';
import { games } from '../../config/games';

const STEPS = {
  WELCOME: 'welcome',
  ASSESSMENT: 'assessment',
  GOALS: 'goals',
  COMPLETE: 'complete',
};

export default function OnboardingFlow({ onComplete }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [assessmentResults, setAssessmentResultsState] = useState(null);
  const [skippedAssessment, setSkippedAssessment] = useState(false);

  const handleWelcomeNext = () => {
    setCurrentStep(STEPS.ASSESSMENT);
  };

  const handleWelcomeSkip = () => {
    // Skip entire onboarding
    setOnboardingComplete();
    onComplete();
  };

  const handleAssessmentComplete = (results) => {
    setAssessmentResultsState(results);
    setAssessmentResults(results);
    setCurrentStep(STEPS.GOALS);
  };

  const handleAssessmentSkip = () => {
    setSkippedAssessment(true);
    setCurrentStep(STEPS.GOALS);
  };

  const handleGoalsComplete = (goals) => {
    setUserGoals(goals);
    setOnboardingComplete();
    
    // Recommend first game based on goals
    const recommendedGame = getRecommendedGame(goals, assessmentResults);
    
    // Show completion screen briefly, then navigate
    setCurrentStep(STEPS.COMPLETE);
    setTimeout(() => {
      onComplete();
      if (recommendedGame) {
        navigate(recommendedGame.path);
      }
    }, 2000);
  };

  const getRecommendedGame = (goals, assessment) => {
    if (!goals || goals.length === 0 || goals.includes('all')) {
      return games[0]; // Default to first game
    }

    // Find game matching primary goal
    const primaryGoal = goals[0];
    const matchingGame = games.find((g) => g.category === primaryGoal);
    return matchingGame || games[0];
  };

  if (currentStep === STEPS.WELCOME) {
    return <WelcomeStep onNext={handleWelcomeNext} onSkip={handleWelcomeSkip} />;
  }

  if (currentStep === STEPS.ASSESSMENT) {
    return (
      <QuickAssessment
        onComplete={handleAssessmentComplete}
        onSkip={handleAssessmentSkip}
      />
    );
  }

  if (currentStep === STEPS.GOALS) {
    return (
      <GoalSetting
        onComplete={handleGoalsComplete}
        assessmentResults={assessmentResults}
      />
    );
  }

  if (currentStep === STEPS.COMPLETE) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-4xl font-bold text-white mb-4">
            You're All Set!
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Let's start training your brain...
          </p>
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
