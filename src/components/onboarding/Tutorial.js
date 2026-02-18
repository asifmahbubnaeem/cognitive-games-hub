import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

/**
 * Interactive Tutorial Component
 * Shows step-by-step guidance for games
 * 
 * @param {Array} steps - Array of tutorial steps: { title, content, highlight?, action? }
 * @param {Function} onComplete - Called when tutorial is finished
 * @param {Function} onSkip - Called when user skips tutorial
 * @param {boolean} showSkip - Whether to show skip button
 */
export default function Tutorial({ steps = [], onComplete, onSkip, showSkip = true }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || steps.length === 0) return null;

  const current = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      setIsVisible(false);
      if (onComplete) onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    if (onSkip) onSkip();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl border-2 border-cyan-400 max-w-lg w-full p-6 relative">
        {showSkip && (
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            aria-label="Skip tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentStep ? 'bg-cyan-400 w-6' : 'bg-slate-600 w-1.5'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-3">{current.title}</h3>
          <div className="text-gray-300 leading-relaxed">{current.content}</div>
          {current.highlight && (
            <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-cyan-300 text-sm">{current.highlight}</p>
            </div>
          )}
        </div>

        {current.action && (
          <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-600/50">
            <p className="text-sm text-gray-400 mb-2">Try it:</p>
            <div className="text-white">{current.action}</div>
          </div>
        )}

        <div className="flex gap-3">
          {!isFirst && (
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            {isLast ? 'Get Started!' : 'Next'}
            {!isLast && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to create tutorial steps for Number Chain game
 */
export function createNumberChainTutorial() {
  return [
    {
      title: 'Welcome to Number Chain!',
      content: (
        <div>
          <p className="mb-3">
            Number Chain trains your <strong>mental math</strong> and <strong>working memory</strong> by having you calculate chains of operations in your head.
          </p>
          <p>You'll see a starting number, then operations flash one by one. Calculate mentally as you go!</p>
        </div>
      ),
    },
    {
      title: 'How It Works',
      content: (
        <div>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>A starting number appears (e.g., <strong>5</strong>)</li>
            <li>Operations flash one by one: <strong>+3</strong>, then <strong>×2</strong>, then <strong>-4</strong></li>
            <li>Calculate mentally: 5 + 3 = 8, 8 × 2 = 16, 16 - 4 = <strong>12</strong></li>
            <li>Enter the final answer when the chain finishes!</li>
          </ol>
        </div>
      ),
      highlight: '💡 Tip: Keep the running total in your head as each operation appears.',
    },
    {
      title: 'Scoring',
      content: (
        <div>
          <p className="mb-3">You earn points based on:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Speed:</strong> Faster answers = more points</li>
            <li><strong>Chain length:</strong> Longer chains = bonus points</li>
            <li><strong>Streak:</strong> Consecutive correct answers multiply your score</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Ready to Play?',
      content: (
        <div>
          <p className="mb-3">You have <strong>3 lives</strong>. Make a mistake and you lose a life.</p>
          <p>Start with <strong>Beginner</strong> difficulty to get comfortable, then work your way up!</p>
        </div>
      ),
      action: 'Select a difficulty level and click "START TRAINING"',
    },
  ];
}
