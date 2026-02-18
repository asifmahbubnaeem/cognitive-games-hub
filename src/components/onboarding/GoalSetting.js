import React, { useState } from 'react';
import { Target, Brain, Zap, Eye, Puzzle } from 'lucide-react';

const GOALS = [
  { id: 'memory', label: 'Memory', icon: Brain, description: 'Improve working memory and recall' },
  { id: 'speed', label: 'Processing Speed', icon: Zap, description: 'Think and react faster' },
  { id: 'attention', label: 'Attention & Focus', icon: Eye, description: 'Enhance concentration' },
  { id: 'logic', label: 'Logic & Reasoning', icon: Puzzle, description: 'Sharpen problem-solving' },
  { id: 'all', label: 'All Skills', icon: Target, description: 'Improve everything' },
];

export default function GoalSetting({ onComplete, assessmentResults }) {
  const [selectedGoals, setSelectedGoals] = useState([]);

  const toggleGoal = (goalId) => {
    if (goalId === 'all') {
      setSelectedGoals(selectedGoals.includes('all') ? [] : ['all']);
    } else {
      const newGoals = selectedGoals.includes(goalId)
        ? selectedGoals.filter((g) => g !== goalId && g !== 'all')
        : [...selectedGoals.filter((g) => g !== 'all'), goalId];
      setSelectedGoals(newGoals);
    }
  };

  const handleContinue = () => {
    const goals = selectedGoals.length === 0 ? ['all'] : selectedGoals;
    onComplete(goals);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <Target className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            What do you want to improve?
          </h2>
          <p className="text-gray-400 text-lg">
            Select your goals to personalize your training experience
          </p>
        </div>

        {assessmentResults && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-6">
            <p className="text-cyan-300 text-sm text-center">
              💡 Based on your assessment, we recommend focusing on{' '}
              <span className="font-semibold">
                {Object.keys(assessmentResults).length > 0
                  ? Object.keys(assessmentResults)
                      .map((k) => GOALS.find((g) => g.id === k)?.label)
                      .filter(Boolean)
                      .join(', ')
                  : 'all skills'}
              </span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {GOALS.map((goal) => {
            const Icon = goal.icon;
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-500/10 shadow-lg scale-105'
                    : 'border-slate-600 bg-slate-800/80 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg ${
                      isSelected ? 'bg-cyan-500/20' : 'bg-slate-700'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-lg mb-1 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {goal.label}
                    </h3>
                    <p className="text-sm text-gray-400">{goal.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleContinue}
          disabled={selectedGoals.length === 0}
          className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue →
        </button>

        {selectedGoals.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-4">
            Select at least one goal to continue
          </p>
        )}
      </div>
    </div>
  );
}
