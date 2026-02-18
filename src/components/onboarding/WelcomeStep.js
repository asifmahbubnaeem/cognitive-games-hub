import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

export default function WelcomeStep({ onNext, onSkip }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="relative mb-8">
          <Brain className="w-32 h-32 text-cyan-400 mx-auto animate-pulse" />
          <Sparkles className="w-8 h-8 text-yellow-400 absolute top-0 right-0 animate-bounce" />
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-6">
          Welcome to Cognitive Games Hub!
        </h1>
        
        <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
          Train your brain with <span className="text-cyan-400 font-semibold">science-backed games</span> designed to improve your cognitive abilities.
        </p>
        
        <div className="bg-slate-800/80 rounded-2xl p-6 mb-8 border border-slate-600/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🧠</div>
              <div>
                <h3 className="font-bold text-white mb-1">Memory</h3>
                <p className="text-sm text-gray-400">Enhance working memory</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚡</div>
              <div>
                <h3 className="font-bold text-white mb-1">Speed</h3>
                <p className="text-sm text-gray-400">Boost processing speed</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="font-bold text-white mb-1">Focus</h3>
                <p className="text-sm text-gray-400">Improve attention span</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onNext}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-opacity shadow-lg"
          >
            Get Started →
          </button>
          <button
            onClick={onSkip}
            className="px-8 py-4 bg-slate-700 text-gray-300 font-semibold text-lg rounded-xl hover:bg-slate-600 transition-colors"
          >
            Skip for Now
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          Just 10-15 minutes daily can make a difference
        </p>
      </div>
    </div>
  );
}
