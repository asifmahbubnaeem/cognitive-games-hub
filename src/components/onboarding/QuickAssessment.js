import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, XCircle, Loader } from 'lucide-react';
import { games } from '../../config/games';

const ASSESSMENT_GAMES = [
  { id: 'number-chain', category: 'memory', name: 'Memory Test' },
  { id: 'speed-truth', category: 'speed', name: 'Speed Test' },
  { id: 'focus-flow', category: 'attention', name: 'Attention Test' },
];

export default function QuickAssessment({ onComplete, onSkip }) {
  const [currentTest, setCurrentTest] = useState(0);
  const [results, setResults] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [testComplete, setTestComplete] = useState(false);

  const currentGame = ASSESSMENT_GAMES[currentTest];
  const gameConfig = games.find((g) => g.id === currentGame.id);

  const handleTestComplete = (score) => {
    const newResults = {
      ...results,
      [currentGame.category]: score,
    };
    setResults(newResults);
    setTestComplete(true);
  };

  const handleNext = () => {
    if (currentTest < ASSESSMENT_GAMES.length - 1) {
      setCurrentTest(currentTest + 1);
      setTestScore(0);
      setTestComplete(false);
      setIsPlaying(false);
    } else {
      onComplete(results);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const startTest = () => {
    setIsPlaying(true);
    // Simulate a quick test - in real implementation, this would launch a mini version of the game
    setTimeout(() => {
      const simulatedScore = Math.floor(Math.random() * 50) + 30;
      handleTestComplete(simulatedScore);
    }, 3000);
  };

  if (isPlaying && !testComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <Loader className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-3xl font-bold text-white mb-4">
            {currentGame.name}
          </h2>
          <p className="text-gray-400 mb-8">
            Complete a quick round to assess your {currentGame.category} skills...
          </p>
          <div className="bg-slate-800/80 rounded-xl p-8 border border-slate-600/50">
            <div className="text-4xl font-bold text-cyan-400 mb-2">{testScore}</div>
            <p className="text-gray-400">Score</p>
          </div>
        </div>
      </div>
    );
  }

  if (testComplete) {
    const score = results[currentGame.category] || 0;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            {currentGame.name} Complete!
          </h2>
          <div className="bg-slate-800/80 rounded-xl p-6 mb-8 border border-slate-600/50">
            <p className="text-gray-400 mb-2">Your Score</p>
            <p className="text-5xl font-bold text-cyan-400">{score}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleNext}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              {currentTest < ASSESSMENT_GAMES.length - 1 ? 'Next Test →' : 'View Results'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Quick Assessment
          </h2>
          <p className="text-gray-400 text-lg">
            Take 2 minutes to assess your cognitive skills. We'll personalize your experience!
          </p>
        </div>

        <div className="bg-slate-800/80 rounded-2xl p-6 mb-6 border border-slate-600/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">Test {currentTest + 1} of {ASSESSMENT_GAMES.length}</span>
            <span className="text-cyan-400 font-semibold">{currentGame.name}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentTest + 1) / ASSESSMENT_GAMES.length) * 100}%` }}
            />
          </div>
        </div>

        {gameConfig && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 mb-6 border border-slate-600/50">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gameConfig.color} flex items-center justify-center mb-4`}>
              <gameConfig.icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{gameConfig.title}</h3>
            <p className="text-gray-400 mb-4">{gameConfig.description}</p>
            <div className="flex flex-wrap gap-2">
              {gameConfig.skills.slice(0, 2).map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-slate-700 text-cyan-400 text-sm rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={startTest}
            className="flex-1 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Start Test
          </button>
          <button
            onClick={handleSkip}
            className="px-8 py-4 bg-slate-700 text-gray-300 font-semibold rounded-xl hover:bg-slate-600 transition-colors"
          >
            Skip Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
