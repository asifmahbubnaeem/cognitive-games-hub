import React, { useState, useEffect, useRef } from 'react';
import { Brain, Clock, Trophy, Target, TrendingUp, Zap } from 'lucide-react';

const SHAPES = [
  { name: 'circle', color: '#ef4444', render: () => '●' },
  { name: 'triangle', color: '#3b82f6', render: () => '▲' },
  { name: 'square', color: '#22c55e', render: () => '■' }
];

export default function SpeedMatch() {
  const [gameState, setGameState] = useState('menu');
  const [currentShape, setCurrentShape] = useState(null);
  const [previousShape, setPreviousShape] = useState(null);
  const [position, setPosition] = useState('right');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const timerRef = useRef(null);

  const playSlideSound = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.3);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  };

  const playCorrectSound = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 800 + (streak * 50);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  };

  const playWrongSound = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 200;
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  };

  const playTickSound = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 1000;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  };

  const spawnNewShape = () => {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    setCurrentShape(shape);
    setPosition('right');
    
    setTimeout(() => {
      setPosition('center');
    }, 100);
  };

  const handleAnswer = (userSaysMatch) => {
    if (isAnimating || !currentShape) return;
    if (position !== 'center') return;

    setIsAnimating(true);
    setTotalAnswers(t => t + 1);

    const isFirstShape = previousShape === null;
    const actualMatch = !isFirstShape && currentShape.name === previousShape.name;
    const isCorrect = isFirstShape ? true : userSaysMatch === actualMatch;

    if (isCorrect) {
      playCorrectSound();
      const points = isFirstShape ? 0 : 10 + (streak * 2);
      setScore(s => s + points);
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        return newStreak;
      });
      if (!isFirstShape) setCorrectAnswers(c => c + 1);
      setFeedback({ type: 'success', message: isFirstShape ? 'First shape! 👀' : `✓ Correct! +${points}` });
    } else {
      playWrongSound();
      setStreak(0);
      setFeedback({ type: 'error', message: '✗ Wrong!' });
    }

    playSlideSound();
    setPosition('left');

    setTimeout(() => {
      setPreviousShape(currentShape);
      setFeedback(null);
      setIsAnimating(false);
      spawnNewShape();
    }, 500);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setGameState('gameover');
            return 0;
          }
          if (t <= 10) {
            playTickSound();
          }
          return t - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleAnswer(false);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleAnswer(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentShape, previousShape, isAnimating, position, streak, maxStreak]);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(60);
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setPreviousShape(null);
    setFeedback(null);
    setIsAnimating(false);
    setPosition('right');
    setCurrentShape(null);
    setGameState('playing');
    
    setTimeout(() => {
      spawnNewShape();
    }, 200);
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center max-w-3xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            <Brain className="w-20 h-20 text-pink-400 animate-pulse" />
            <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
              Speed Match
            </h1>
          </div>

          <div className="bg-slate-900 bg-opacity-90 rounded-2xl p-8 mb-8 border-4 border-pink-400 shadow-2xl">
            <h2 className="text-3xl font-bold text-pink-400 mb-6">🎯 Memory Challenge!</h2>
            
            <div className="text-left text-white space-y-4 text-lg mb-6">
              <p className="text-center text-xl">Remember shapes and match them as fast as you can!</p>
              
              <div className="bg-slate-800 p-6 rounded-lg border-2 border-purple-400">
                <p className="font-bold text-purple-300 mb-3">How to play:</p>
                <div className="space-y-2 text-gray-300">
                  <p>1️⃣ A shape slides from right to center</p>
                  <p>2️⃣ Remember if it matches the previous shape</p>
                  <p>3️⃣ Click MATCH if same, MISMATCH if different</p>
                  <p>4️⃣ Get as many correct in 60 seconds!</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4 rounded-lg">
                <p className="font-bold text-center">⌨️ Keyboard Shortcuts</p>
                <p className="text-center text-sm mt-2">← Left = MISMATCH | → Right = MATCH</p>
              </div>

              <div className="flex justify-center gap-4 mt-4">
                {SHAPES.map((shape, i) => (
                  <div key={i} className="text-6xl" style={{ color: shape.color }}>
                    {shape.render()}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {highScore > 0 && (
            <div className="text-yellow-400 text-3xl mb-4 font-bold">
              High Score: {highScore}
            </div>
          )}

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white px-20 py-6 rounded-2xl text-4xl font-bold hover:scale-105 transition-transform shadow-2xl animate-pulse"
          >
            START GAME
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    if (score > highScore) setHighScore(score);
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-3xl">
          <h1 className="text-6xl font-bold text-red-400 mb-8">Time's Up!</h1>

          <div className="bg-slate-900 bg-opacity-90 rounded-2xl p-8 mb-8 border-4 border-red-400">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-yellow-600 to-orange-600 p-6 rounded-xl">
                <Trophy className="w-12 h-12 text-white mx-auto mb-2" />
                <div className="text-4xl font-bold text-white">{score}</div>
                <div className="text-white">Final Score</div>
              </div>

              <div className="bg-gradient-to-br from-orange-600 to-red-600 p-6 rounded-xl">
                <Zap className="w-12 h-12 text-white mx-auto mb-2" />
                <div className="text-4xl font-bold text-white">{maxStreak}</div>
                <div className="text-white">Max Streak</div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-xl">
                <Target className="w-12 h-12 text-white mx-auto mb-2" />
                <div className="text-4xl font-bold text-white">{accuracy}%</div>
                <div className="text-white">Accuracy</div>
              </div>

              <div className="bg-gradient-to-br from-cyan-600 to-blue-600 p-6 rounded-xl">
                <TrendingUp className="w-12 h-12 text-white mx-auto mb-2" />
                <div className="text-4xl font-bold text-white">{totalAnswers}</div>
                <div className="text-white">Total Attempts</div>
              </div>
            </div>

            {score > highScore && (
              <div className="mb-6 text-3xl text-green-400 font-bold animate-pulse">
                🎉 NEW HIGH SCORE! 🎉
              </div>
            )}

            <div className="bg-slate-800 rounded-xl p-6 border-2 border-cyan-400">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4">Performance Rating</h2>
              <div className="text-2xl text-white">
                {accuracy >= 90 ? '🏆 Memory Master!' :
                 accuracy >= 75 ? '⭐ Sharp Mind!' :
                 accuracy >= 60 ? '📈 Good Focus!' :
                 '🌱 Keep Training!'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setGameState('menu')}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-16 py-5 rounded-xl text-3xl font-bold hover:scale-105 transition-transform shadow-2xl"
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Top Bar */}
        <div className="bg-slate-900 bg-opacity-90 rounded-xl p-4 mb-6 border-4 border-pink-400 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400 w-8 h-8" />
              <span className="text-white text-3xl font-bold">{score}</span>
            </div>

            {streak > 0 && (
              <div className="flex items-center gap-2 animate-pulse">
                <Zap className="text-orange-400 w-8 h-8" />
                <span className="text-orange-400 text-3xl font-bold">{streak}x</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Clock className={`w-10 h-10 ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
            <span className={`text-5xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="mb-6">
            <div className={`p-4 rounded-xl text-center text-2xl font-bold ${
              feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white animate-pulse border-4 border-white`}>
              {feedback.message}
            </div>
          </div>
        )}

        {/* Game Area */}
        <div className="relative bg-slate-800 rounded-3xl p-8 mb-6 shadow-2xl border-8 border-purple-500 overflow-hidden" style={{ height: '500px' }}>
          {/* Previous Shape Indicator */}
          {previousShape && (
            <div className="absolute top-8 left-8 bg-slate-700 rounded-xl p-4 border-2 border-gray-500">
              <div className="text-gray-400 text-sm mb-2">Previous:</div>
              <div className="text-6xl" style={{ color: previousShape.color }}>
                {previousShape.render()}
              </div>
            </div>
          )}

          {/* Current Shape */}
          {currentShape && (
            <div 
              className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-500 ease-in-out`}
              style={{
                left: position === 'right' ? '100%' : 
                      position === 'center' ? '50%' : 
                      '-200px',
                transform: position === 'center' ? 'translate(-50%, -50%)' : 'translateY(-50%)'
              }}
            >
              <div 
                className="text-9xl animate-pulse"
                style={{ 
                  color: currentShape.color,
                  filter: 'drop-shadow(0 0 20px currentColor)'
                }}
              >
                {currentShape.render()}
              </div>
            </div>
          )}

          {/* Center Indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-32 bg-purple-500 opacity-30"></div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => handleAnswer(false)}
            disabled={isAnimating || position !== 'center'}
            className="bg-gradient-to-r from-red-500 to-rose-600 text-white py-12 rounded-2xl text-4xl font-bold hover:from-red-600 hover:to-rose-700 transition-all transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="text-5xl mb-4">✗</div>
            <div>MISMATCH</div>
            <div className="text-xl text-red-100 mt-3">(← Left Arrow)</div>
          </button>

          <button
            onClick={() => handleAnswer(true)}
            disabled={isAnimating || position !== 'center'}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-12 rounded-2xl text-4xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="text-5xl mb-4">✓</div>
            <div>MATCH</div>
            <div className="text-xl text-green-100 mt-3">(→ Right Arrow)</div>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-slate-900 bg-opacity-70 rounded-xl p-4 text-center border-2 border-purple-400">
          <p className="text-gray-300">
            {!previousShape ? 
              '👀 Watch the first shape! No need to answer yet.' : 
              '🧠 Does this shape MATCH the previous one?'}
          </p>
        </div>
      </div>
    </div>
  );
}