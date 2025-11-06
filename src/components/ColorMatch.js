import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

const COLORS = ['red', 'blue', 'green', 'yellow'];
const COLOR_MAP = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#F59E0B'
};

export default function ColorMatchGame() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, ended
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameDuration, setGameDuration] = useState(60);
  const [showSettings, setShowSettings] = useState(false);
  
  const [topColor, setTopColor] = useState('red');
  const [bottomText, setBottomText] = useState('red');
  const [bottomTextColor, setBottomTextColor] = useState('red');
  const [isSliding, setIsSliding] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  const audioContext = useRef(null);
  const timerRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  // Play sound effects
  const playSound = (type) => {
    if (!audioContext.current) return;
    
    const ctx = audioContext.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'correct') {
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } else if (type === 'wrong') {
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } else if (type === 'slide') {
      oscillator.frequency.setValueAtTime(440, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    }
  };

  // Generate new round
  const generateNewRound = () => {
    const newTopColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newBottomText = COLORS[Math.floor(Math.random() * COLORS.length)];
    const newBottomTextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    setTopColor(newTopColor);
    setBottomText(newBottomText);
    setBottomTextColor(newBottomTextColor);
    setIsSliding(true);
    playSound('slide');
    
    setTimeout(() => {
      setIsSliding(false);
    }, 600);
  };

  // Start game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(gameDuration);
    generateNewRound();
  };

  // Timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('ended');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState]);

  // Handle answer
  const handleAnswer = (isMatch) => {
    if (isSliding || gameState !== 'playing') return;
    
    const correctAnswer = topColor === bottomText;
    const isCorrect = isMatch === correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setFeedback('correct');
      playSound('correct');
    } else {
      setScore(prev => Math.max(0, prev - 5));
      setFeedback('wrong');
      playSound('wrong');
    }
    
    setTimeout(() => {
      setFeedback(null);
      generateNewRound();
    }, 400);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState === 'playing') {
        if (e.key === 'ArrowLeft') {
          handleAnswer(false);
        } else if (e.key === 'ArrowRight') {
          handleAnswer(true);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, isSliding, topColor, bottomText]);

  // Menu Screen
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform hover:scale-105 transition-transform">
          <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Color Match
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Match the rectangle color with the text color!
          </p>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Game Duration
            </label>
            <div className="flex gap-2">
              {[30, 60, 90, 120].map(duration => (
                <button
                  key={duration}
                  onClick={() => setGameDuration(duration)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    gameDuration === duration
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {duration}s
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Play size={24} />
            Start Game
          </button>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-gray-700">
            <p className="font-semibold mb-2">How to Play:</p>
            <p className="mb-1">• Match rectangle color with the TEXT WORD</p>
            <p className="mb-1">• Ignore the text color - only read the word!</p>
            <p className="mb-1">• Use Arrow Keys: ← Mismatch | → Match</p>
            <p>• Correct: +10 | Wrong: -5</p>
          </div>
        </div>
      </div>
    );
  }

  // Game Over Screen
  if (gameState === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">Game Over!</h2>
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6">
            <p className="text-center text-gray-600 text-lg mb-2">Final Score</p>
            <p className="text-6xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {score}
            </p>
          </div>
          <button
            onClick={() => setGameState('menu')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={24} />
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // Playing Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8 flex justify-between items-center">
        <div className="bg-white rounded-2xl px-6 py-3 shadow-lg">
          <p className="text-sm text-gray-600 font-semibold">SCORE</p>
          <p className="text-3xl font-bold text-purple-600">{score}</p>
        </div>
        <div className="bg-white rounded-2xl px-6 py-3 shadow-lg">
          <p className="text-sm text-gray-600 font-semibold">TIME</p>
          <p className="text-3xl font-bold text-pink-600">{timeLeft}s</p>
        </div>
      </div>

      {/* Game Area */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 mb-8 relative overflow-hidden">
        {feedback && (
          <div className={`absolute inset-0 flex items-center justify-center z-20 ${
            feedback === 'correct' ? 'bg-green-500' : 'bg-red-500'
          } bg-opacity-50 animate-pulse`}>
            <p className="text-6xl font-bold text-white">
              {feedback === 'correct' ? '✓' : '✗'}
            </p>
          </div>
        )}
        
        {/* Top Rectangle - slides from right */}
        <div className="mb-8 h-32 relative overflow-hidden">
          <div
            className={`h-full rounded-2xl shadow-lg transition-transform duration-500 ${
              isSliding ? 'translate-x-full' : 'translate-x-0'
            }`}
            style={{ backgroundColor: COLOR_MAP[topColor] }}
          />
        </div>

        {/* Bottom Rectangle - slides from left */}
        <div className="h-32 relative overflow-hidden">
          <div
            className={`h-full rounded-2xl shadow-lg flex items-center justify-center transition-transform duration-500 bg-gray-100 ${
              isSliding ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
            <p
              className="text-6xl font-bold uppercase"
              style={{ color: COLOR_MAP[bottomTextColor] }}
            >
              {bottomText}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-2xl flex gap-4">
        <button
          onClick={() => handleAnswer(false)}
          disabled={isSliding}
          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-6 rounded-2xl font-bold text-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← MISMATCH
        </button>
        <button
          onClick={() => handleAnswer(true)}
          disabled={isSliding}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-6 rounded-2xl font-bold text-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          MATCH →
        </button>
      </div>

      {/* Pause Button */}
      <button
        onClick={() => setGameState('menu')}
        className="mt-4 bg-white text-gray-700 px-6 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
      >
        Exit Game
      </button>
    </div>
  );
}