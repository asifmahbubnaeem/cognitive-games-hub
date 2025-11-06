import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Award } from 'lucide-react';

const FRUITS = {
  apple: { emoji: '🍎', name: 'Apple' },
  orange: { emoji: '🍊', name: 'Orange' },
  kiwi: { emoji: '🥝', name: 'Kiwi' },
  watermelon: { emoji: '🍉', name: 'Watermelon' }
};

export default function QuickDecisionGame() {
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [weights, setWeights] = useState({});
  const [relationships, setRelationships] = useState([]);
  const [leftFruits, setLeftFruits] = useState([]);
  const [rightFruits, setRightFruits] = useState([]);
  const [scaleRotation, setScaleRotation] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isAnswering, setIsAnswering] = useState(false);
  
  const audioContext = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContext.current) audioContext.current.close();
    };
  }, []);

  const playSound = (type) => {
    if (!audioContext.current) return;
    
    const ctx = audioContext.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    if (type === 'correct') {
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime);
      oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } else if (type === 'wrong') {
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } else if (type === 'tick') {
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    }
  };

  const generateWeights = () => {
    const fruitKeys = Object.keys(FRUITS);
    const selectedFruits = fruitKeys.sort(() => Math.random() - 0.5).slice(0, Math.random() > 0.5 ? 3 : 2);
    
    const newWeights = {};
    selectedFruits.forEach((fruit, idx) => {
      newWeights[fruit] = (idx + 1) * 10 + Math.random() * 5;
    });
    
    return { weights: newWeights, fruits: selectedFruits };
  };

  const generateRelationships = (weights, fruits) => {
    const relationships = [];
    const sortedFruits = fruits.sort((a, b) => weights[b] - weights[a]);
    
    const numRelationships = fruits.length === 2 ? 1 : Math.random() > 0.5 ? 2 : 3;
    
    for (let i = 0; i < Math.min(numRelationships, sortedFruits.length - 1); i++) {
      relationships.push({
        heavier: sortedFruits[i],
        lighter: sortedFruits[i + 1]
      });
    }
    
    return relationships.sort(() => Math.random() - 0.5);
  };

  const generateScale = (weights, fruits) => {
    let left = [];
    let right = [];
    let leftWeight = 0;
    let rightWeight = 0;
    
    // Keep generating until we get unequal weights
    let attempts = 0;
    while (Math.abs(leftWeight - rightWeight) < 0.1 && attempts < 100) {
      left = [];
      right = [];
      
      const leftCount = Math.floor(Math.random() * 4) + 1;
      const rightCount = Math.floor(Math.random() * 4) + 1;
      
      for (let i = 0; i < leftCount; i++) {
        const fruit = fruits[Math.floor(Math.random() * fruits.length)];
        left.push(fruit);
      }
      
      for (let i = 0; i < rightCount; i++) {
        const fruit = fruits[Math.floor(Math.random() * fruits.length)];
        right.push(fruit);
      }
      
      leftWeight = left.reduce((sum, fruit) => sum + weights[fruit], 0);
      rightWeight = right.reduce((sum, fruit) => sum + weights[fruit], 0);
      attempts++;
    }
    
    return { left, right };
  };

  const generateNewRound = () => {
    const { weights, fruits } = generateWeights();
    const relationships = generateRelationships(weights, fruits);
    const { left, right } = generateScale(weights, fruits);
    
    setWeights(weights);
    setRelationships(relationships);
    setLeftFruits(left);
    setRightFruits(right);
    setScaleRotation(0);
    setShowAnswer(false);
    setIsAnswering(false);
    playSound('tick');
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    generateNewRound();
  };

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
      if (timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const calculateWeight = (fruits) => {
    return fruits.reduce((sum, fruit) => sum + weights[fruit], 0);
  };

  const handleAnswer = (side) => {
    if (isAnswering || gameState !== 'playing') return;
    
    setIsAnswering(true);
    const leftWeight = calculateWeight(leftFruits);
    const rightWeight = calculateWeight(rightFruits);
    const correctSide = leftWeight > rightWeight ? 'left' : rightWeight > leftWeight ? 'right' : 'equal';
    const isCorrect = side === correctSide;
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setFeedback('correct');
      playSound('correct');
    } else {
      setScore(prev => Math.max(0, prev - 5));
      setFeedback('wrong');
      playSound('wrong');
    }
    
    // Animate scale
    setShowAnswer(true);
    if (leftWeight > rightWeight) {
      setScaleRotation(-15);
    } else if (rightWeight > leftWeight) {
      setScaleRotation(15);
    }
    
    setTimeout(() => {
      setFeedback(null);
      generateNewRound();
    }, 2000);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState === 'playing' && !isAnswering) {
        if (e.key === 'ArrowLeft') {
          handleAnswer('left');
        } else if (e.key === 'ArrowRight') {
          handleAnswer('right');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, isAnswering, leftFruits, rightFruits, weights]);

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform hover:scale-105 transition-transform">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚖️</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Quick Decision
            </h1>
            <p className="text-gray-600">Weigh the fruits and decide!</p>
          </div>
          
          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2 mb-6"
          >
            <Play size={24} />
            Start Game
          </button>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 text-sm text-gray-700">
            <p className="font-semibold mb-2">How to Play:</p>
            <p className="mb-1">• Learn fruit weights from comparisons</p>
            <p className="mb-1">• Choose the heavier side of the scale</p>
            <p className="mb-1">• Use Arrow Keys: ← Left | → Right</p>
            <p>• 60 seconds | +10 correct | -5 wrong</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    const getFeedback = (score) => {
      if (score >= 150) {
        return {
          title: "🏆 Outstanding!",
          message: "You're a genius at quick thinking! Your decision-making speed and accuracy are exceptional. You've mastered the art of mental calculation!",
          emoji: "🌟",
          color: "from-yellow-400 to-orange-500"
        };
      } else if (score >= 100) {
        return {
          title: "🎉 Excellent Work!",
          message: "Impressive performance! You've got great analytical skills and quick reflexes. Keep playing to reach even higher scores!",
          emoji: "🔥",
          color: "from-green-400 to-emerald-500"
        };
      } else if (score >= 60) {
        return {
          title: "👍 Good Job!",
          message: "You're getting the hang of it! Your logic is solid and you're making smart decisions. A few more rounds and you'll be unstoppable!",
          emoji: "💪",
          color: "from-blue-400 to-cyan-500"
        };
      } else if (score >= 30) {
        return {
          title: "🌱 Nice Start!",
          message: "You're on the right track! Take your time to study the weight relationships carefully. Practice makes perfect - you've got this!",
          emoji: "🎯",
          color: "from-purple-400 to-pink-500"
        };
      } else if (score >= 10) {
        return {
          title: "💫 Keep Going!",
          message: "Everyone starts somewhere! Focus on understanding the weight comparisons first, then work on your speed. You're learning and that's what matters!",
          emoji: "🌈",
          color: "from-indigo-400 to-purple-500"
        };
      } else {
        return {
          title: "🚀 Ready to Improve!",
          message: "Don't give up! This game takes practice. Try focusing on one fruit at a time and building your understanding. Every expert was once a beginner!",
          emoji: "✨",
          color: "from-pink-400 to-rose-500"
        };
      }
    };

    const feedback = getFeedback(score);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4 animate-bounce">{feedback.emoji}</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-2">{feedback.title}</h2>
          </div>
          <div className={`bg-gradient-to-r ${feedback.color} rounded-2xl p-6 mb-6`}>
            <p className="text-center text-white text-lg mb-2 font-semibold">Final Score</p>
            <p className="text-7xl font-bold text-center text-white mb-2">
              {score}
            </p>
            <p className="text-center text-white text-sm opacity-90">
              {score >= 0 ? `${Math.floor(score / 10)} correct answers` : 'Keep practicing!'}
            </p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 mb-6">
            <p className="text-gray-700 text-center leading-relaxed">
              {feedback.message}
            </p>
          </div>
          <button
            onClick={() => setGameState('menu')}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={24} />
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col items-center justify-center p-4">
      {feedback && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none`}>
          <div className={`text-8xl font-bold ${
            feedback === 'correct' ? 'text-green-400 animate-bounce' : 'text-red-400 animate-pulse'
          }`}>
            {feedback === 'correct' ? '✓' : '✗'}
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl mb-6 flex justify-between items-center">
        <div className="bg-white rounded-2xl px-6 py-3 shadow-lg">
          <p className="text-sm text-gray-600 font-semibold">SCORE</p>
          <p className="text-3xl font-bold text-indigo-600">{score}</p>
        </div>
        <div className="bg-white rounded-2xl px-6 py-3 shadow-lg">
          <p className="text-sm text-gray-600 font-semibold">TIME</p>
          <p className="text-3xl font-bold text-pink-600">{timeLeft}s</p>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 mb-6">
        {/* Weight Relationships */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Weight Guide</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {relationships.map((rel, idx) => (
              <div key={idx} className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl px-6 py-3 flex items-center gap-3 shadow-md">
                <span className="text-4xl">{FRUITS[rel.heavier].emoji}</span>
                <span className="text-2xl font-bold text-purple-600">&gt;</span>
                <span className="text-4xl">{FRUITS[rel.lighter].emoji}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scale */}
        <div className="relative mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-24 bg-gradient-to-b from-gray-600 to-gray-800 rounded-lg shadow-lg" />
          </div>
          
          <div 
            className="relative transition-transform duration-700"
            style={{ transform: `rotate(${scaleRotation}deg)` }}
          >
            {/* Balance Beam */}
            <div className="h-4 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded-full shadow-lg mx-auto" style={{ width: '80%' }} />
            
            <div className="flex justify-between" style={{ marginTop: '-0.5rem' }}>
              {/* Left Pan */}
              <div className="flex flex-col items-center" style={{ width: '40%' }}>
                <div className="w-4 h-16 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full shadow-lg mb-2" />
                <div className={`w-full bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-4 shadow-xl border-4 border-amber-700 min-h-32 flex flex-wrap items-center justify-center gap-2 transition-all duration-700 ${
                  showAnswer && scaleRotation < 0 ? 'scale-110' : showAnswer && scaleRotation > 0 ? 'scale-90' : ''
                }`}>
                  {leftFruits.map((fruit, idx) => (
                    <span key={idx} className="text-5xl">{FRUITS[fruit].emoji}</span>
                  ))}
                </div>
              </div>
              
              {/* Right Pan */}
              <div className="flex flex-col items-center" style={{ width: '40%' }}>
                <div className="w-4 h-16 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full shadow-lg mb-2" />
                <div className={`w-full bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-4 shadow-xl border-4 border-amber-700 min-h-32 flex flex-wrap items-center justify-center gap-2 transition-all duration-700 ${
                  showAnswer && scaleRotation > 0 ? 'scale-110' : showAnswer && scaleRotation < 0 ? 'scale-90' : ''
                }`}>
                  {rightFruits.map((fruit, idx) => (
                    <span key={idx} className="text-5xl">{FRUITS[fruit].emoji}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="w-full max-w-4xl flex gap-6">
        <button
          onClick={() => handleAnswer('left')}
          disabled={isAnswering}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-6 rounded-2xl font-bold text-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← LEFT
        </button>
        <button
          onClick={() => handleAnswer('right')}
          disabled={isAnswering}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-6 rounded-2xl font-bold text-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          RIGHT →
        </button>
      </div>
    </div>
  );
}