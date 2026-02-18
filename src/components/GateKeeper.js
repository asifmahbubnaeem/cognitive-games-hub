import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Award } from 'lucide-react';
import { recordPlayedGame } from '../utils/userProgress';

const SHAPES = ['circle', 'triangle', 'rectangle'];
const COLORS = ['red', 'blue', 'green'];
const COLOR_MAP = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981'
};

export default function GateKeeperGame() {
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [challengeType, setChallengeType] = useState('shape');
  
  const [leftRule, setLeftRule] = useState('');
  const [rightRule, setRightRule] = useState('');
  const [leftObject, setLeftObject] = useState(null);
  const [rightObject, setRightObject] = useState(null);
  const [leftObjectY, setLeftObjectY] = useState(0);
  const [rightObjectY, setRightObjectY] = useState(0);
  const [leftGateOpen, setLeftGateOpen] = useState(false);
  const [rightGateOpen, setRightGateOpen] = useState(false);
  const [leftCollision, setLeftCollision] = useState(false);
  const [rightCollision, setRightCollision] = useState(false);
  const [leftProcessed, setLeftProcessed] = useState(false);
  const [rightProcessed, setRightProcessed] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  const audioContext = useRef(null);
  const timerRef = useRef(null);
  const leftGateTimerRef = useRef(null);
  const rightGateTimerRef = useRef(null);
  const recordedRef = useRef(false);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [correctProcessed, setCorrectProcessed] = useState(0);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContext.current) audioContext.current.close();
      if (leftGateTimerRef.current) clearTimeout(leftGateTimerRef.current);
      if (rightGateTimerRef.current) clearTimeout(rightGateTimerRef.current);
    };
  }, []);

  const playSound = (type) => {
    if (!audioContext.current) return;
    const ctx = audioContext.current;
    
    if (type === 'success') {
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.3);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
      });
    } else if (type === 'collision') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'pass') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'slide') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  };

  const generateObject = () => {
    return {
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      id: Date.now() + Math.random()
    };
  };

  const generateRules = () => {
    if (challengeType === 'shape') {
      const leftShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const rightShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      setLeftRule(`Allow ${leftShape}s`);
      setRightRule(`Allow ${rightShape}s`);
      return { left: leftShape, right: rightShape };
    } else {
      const leftColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      const rightColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      setLeftRule(`Allow ${leftColor}`);
      setRightRule(`Allow ${rightColor}`);
      return { left: leftColor, right: rightColor };
    }
  };

  const startGame = () => {
    const type = Math.random() > 0.5 ? 'shape' : 'color';
    setChallengeType(type);
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    setLeftObject(null);
    setRightObject(null);
    setLeftObjectY(0);
    setRightObjectY(0);
    setLeftProcessed(false);
    setRightProcessed(false);
    setTotalProcessed(0);
    setCorrectProcessed(0);
    recordedRef.current = false;
  };

  const startNewObject = (side) => {
    const obj = generateObject();
    if (side === 'left') {
      setLeftObject(obj);
      setLeftObjectY(-10);
      setLeftGateOpen(false);
      setLeftCollision(false);
      setLeftProcessed(false);
    } else {
      setRightObject(obj);
      setRightObjectY(-10);
      setRightGateOpen(false);
      setRightCollision(false);
      setRightProcessed(false);
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && !leftObject && !rightObject) {
      generateRules();
      startNewObject('left');
      startNewObject('right');
    }
  }, [gameState]);

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

  useEffect(() => {
    if (gameState === 'playing') {
      const animation = setInterval(() => {
        if (leftObject && leftObjectY < 250) {
          setLeftObjectY(prev => prev + 0.5);
        }
        if (rightObject && rightObjectY < 250) {
          setRightObjectY(prev => prev + 0.5);
        }
      }, 30);

      return () => clearInterval(animation);
    }
  }, [gameState, leftObject, rightObject, leftObjectY, rightObjectY]);

  const shouldAllow = (obj, side) => {
    if (!obj) return false;
    const rule = side === 'left' ? leftRule : rightRule;
    if (challengeType === 'shape') {
      return rule.toLowerCase().includes(obj.shape);
    } else {
      return rule.toLowerCase().includes(obj.color);
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && leftObject && leftObjectY >= 45 && !leftProcessed) {
      setLeftProcessed(true);
      setTotalProcessed(prev => prev + 1);
      const shouldPass = shouldAllow(leftObject, 'left');
      
      if (shouldPass && !leftGateOpen) {
        setLeftCollision(true);
        playSound('collision');
        setScore(prev => Math.max(0, prev - 3));
        setFeedback('Left side blocked! 😓');
        setTimeout(() => {
          setFeedback(null);
          setLeftCollision(false);
        }, 800);
      } else if (!shouldPass && leftGateOpen) {
        setScore(prev => Math.max(0, prev - 3));
        setFeedback('Wrong object passed left! 😓');
        setTimeout(() => setFeedback(null), 1000);
      } else {
        setScore(prev => prev + 5);
        setCorrectProcessed(prev => prev + 1);
        playSound('pass');
      }
    }

    if (gameState === 'playing' && rightObject && rightObjectY >= 45 && !rightProcessed) {
      setRightProcessed(true);
      setTotalProcessed(prev => prev + 1);
      const shouldPass = shouldAllow(rightObject, 'right');
      
      if (shouldPass && !rightGateOpen) {
        setRightCollision(true);
        playSound('collision');
        setScore(prev => Math.max(0, prev - 3));
        setFeedback('Right side blocked! 😓');
        setTimeout(() => {
          setFeedback(null);
          setRightCollision(false);
        }, 800);
      } else if (!shouldPass && rightGateOpen) {
        setScore(prev => Math.max(0, prev - 3));
        setFeedback('Wrong object passed right! 😓');
        setTimeout(() => setFeedback(null), 1000);
      } else {
        setScore(prev => prev + 5);
        setCorrectProcessed(prev => prev + 1);
        playSound('pass');
      }
    }

    if (leftObject && leftObjectY >= 200) {
      setLeftObject(null);
      setTimeout(() => startNewObject('left'), 500);
    }
    if (rightObject && rightObjectY >= 200) {
      setRightObject(null);
      setTimeout(() => startNewObject('right'), 500);
    }
  }, [leftObjectY, rightObjectY, leftProcessed, rightProcessed, leftGateOpen, rightGateOpen]);

  useEffect(() => {
    if (leftProcessed && rightProcessed && !feedback) {
      const leftShouldPass = shouldAllow(leftObject, 'left');
      const rightShouldPass = shouldAllow(rightObject, 'right');
      const leftCorrect = (leftShouldPass && leftGateOpen) || (!leftShouldPass && !leftGateOpen);
      const rightCorrect = (rightShouldPass && rightGateOpen) || (!rightShouldPass && !rightGateOpen);

      if (leftCorrect && rightCorrect) {
        playSound('success');
        setFeedback('Perfect! Both sides correct! 🎉');
        setTimeout(() => setFeedback(null), 1000);
      }
    }
  }, [leftProcessed, rightProcessed]);

  const handleAction = (action) => {
    if (!leftObject && !rightObject) return;

    playSound('slide');

    if (leftGateTimerRef.current) clearTimeout(leftGateTimerRef.current);
    if (rightGateTimerRef.current) clearTimeout(rightGateTimerRef.current);

    if (action === 'left') {
      setLeftGateOpen(true);
      setRightGateOpen(false);
      leftGateTimerRef.current = setTimeout(() => {
        setLeftGateOpen(false);
      }, 500);
    } else if (action === 'right') {
      setLeftGateOpen(false);
      setRightGateOpen(true);
      rightGateTimerRef.current = setTimeout(() => {
        setRightGateOpen(false);
      }, 500);
    } else if (action === 'both') {
      setLeftGateOpen(true);
      setRightGateOpen(true);
      leftGateTimerRef.current = setTimeout(() => {
        setLeftGateOpen(false);
      }, 500);
      rightGateTimerRef.current = setTimeout(() => {
        setRightGateOpen(false);
      }, 500);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState === 'playing') {
        if (e.key === 'ArrowLeft') {
          handleAction('left');
        } else if (e.key === 'ArrowRight') {
          handleAction('right');
        } else if (e.key === 'ArrowUp') {
          handleAction('both');
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, leftObject, rightObject]);

  // Record game progress when game ends
  useEffect(() => {
    if (gameState === 'ended' && !recordedRef.current) {
      recordedRef.current = true;
      const accuracy = totalProcessed > 0 ? Math.round((correctProcessed / totalProcessed) * 100) : 0;
      const perfect = accuracy === 100 && totalProcessed > 0;
      recordPlayedGame('gate-keeper', score, { 
        difficulty: 'beginner', 
        accuracy,
        perfect
      });
    }
    if (gameState === 'menu') {
      recordedRef.current = false;
    }
  }, [gameState, score, totalProcessed, correctProcessed]);

  const renderShape = (obj) => {
    if (!obj) return null;
    
    const color = COLOR_MAP[obj.color];
    const size = 60;

    if (obj.shape === 'circle') {
      return (
        <div
          className="rounded-full transition-all duration-300"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}
        />
      );
    } else if (obj.shape === 'triangle') {
      return (
        <div
          className="transition-all duration-300"
          style={{
            width: 0,
            height: 0,
            borderLeft: `${size/2}px solid transparent`,
            borderRight: `${size/2}px solid transparent`,
            borderBottom: `${size}px solid ${color}`,
            filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))'
          }}
        />
      );
    } else {
      return (
        <div
          className="transition-all duration-300"
          style={{
            width: size,
            height: size * 0.6,
            backgroundColor: color,
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}
        />
      );
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-7xl mb-4">🚪</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Gate Keeper
            </h1>
            <p className="text-gray-600">Master the art of multitasking!</p>
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
            <p className="mb-1">• Watch rules for both sides</p>
            <p className="mb-1">• Open gates to allow correct objects</p>
            <p className="mb-1">• Use: ← Left | → Right | ↑ Both</p>
            <p>• Gates auto-close after opening</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Award className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Game Over!</h2>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl p-6 mb-6">
            <p className="text-center text-white text-lg mb-2 font-semibold">Final Score</p>
            <p className="text-7xl font-bold text-center text-white">{score}</p>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden">
      {feedback && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white bg-opacity-95 rounded-3xl px-8 py-6 shadow-2xl transform scale-110">
            <p className="text-3xl font-bold text-gray-800 text-center">{feedback}</p>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="bg-white bg-opacity-90 rounded-2xl px-6 py-3 shadow-lg">
          <p className="text-sm text-gray-600 font-semibold">SCORE</p>
          <p className="text-3xl font-bold text-indigo-600">{score}</p>
        </div>
        <div className="bg-white bg-opacity-90 rounded-2xl px-6 py-3 shadow-lg">
          <p className="text-sm text-gray-600 font-semibold">TIME</p>
          <p className="text-3xl font-bold text-purple-600">{timeLeft}s</p>
        </div>
      </div>

      <div className="h-screen flex">
        <div className="flex-1 relative border-r-4 border-gray-700">
          <div className="absolute top-20 left-0 right-0 text-center">
            <div className="bg-blue-500 text-white px-6 py-3 rounded-full inline-block font-bold text-lg shadow-lg">
              {leftRule}
            </div>
          </div>

          {leftObject && (
            <div className="absolute left-1/2 transform -translate-x-1/2 transition-all duration-300" style={{ top: `${leftObjectY}%` }}>
              {leftCollision ? (
                <div className="relative">
                  <div className="absolute inset-0 animate-ping text-7xl">💥</div>
                  <div className="text-7xl opacity-0">💥</div>
                  <div className="absolute top-0 left-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2">
                    <div className="absolute inset-0 bg-red-500 rounded-full opacity-75 animate-ping" />
                    <div className="absolute inset-0 bg-orange-500 rounded-full opacity-50 animate-pulse" />
                    <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-25" />
                  </div>
                </div>
              ) : (
                renderShape(leftObject)
              )}
            </div>
          )}

          <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 h-40 overflow-hidden">
            <div className={`absolute top-1/2 transform -translate-y-1/2 left-0 w-full h-24 transition-all duration-500 ${
              leftGateOpen ? '-translate-x-full' : 'translate-x-0'
            }`}>
              <div className="h-full bg-gradient-to-r from-green-700 via-green-600 to-green-700 border-y-4 border-yellow-400 shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-800 to-transparent opacity-50" />
                <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-300 shadow-lg" />
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-yellow-300 shadow-lg" />
                <div className="absolute inset-0 bg-green-500 opacity-20 blur-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="absolute top-20 left-0 right-0 text-center">
            <div className="bg-green-500 text-white px-6 py-3 rounded-full inline-block font-bold text-lg shadow-lg">
              {rightRule}
            </div>
          </div>

          {rightObject && (
            <div className="absolute left-1/2 transform -translate-x-1/2 transition-all duration-300" style={{ top: `${rightObjectY}%` }}>
              {rightCollision ? (
                <div className="relative">
                  <div className="absolute inset-0 animate-ping text-7xl">💥</div>
                  <div className="text-7xl opacity-0">💥</div>
                  <div className="absolute top-0 left-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2">
                    <div className="absolute inset-0 bg-red-500 rounded-full opacity-75 animate-ping" />
                    <div className="absolute inset-0 bg-orange-500 rounded-full opacity-50 animate-pulse" />
                    <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-25" />
                  </div>
                </div>
              ) : (
                renderShape(rightObject)
              )}
            </div>
          )}

          <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 h-40 overflow-hidden">
            <div className={`absolute top-1/2 transform -translate-y-1/2 right-0 w-full h-24 transition-all duration-500 ${
              rightGateOpen ? 'translate-x-full' : 'translate-x-0'
            }`}>
              <div className="h-full bg-gradient-to-l from-green-700 via-green-600 to-green-700 border-y-4 border-yellow-400 shadow-2xl relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-800 to-transparent opacity-50" />
                <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-300 shadow-lg" />
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-yellow-300 shadow-lg" />
                <div className="absolute inset-0 bg-green-500 opacity-20 blur-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-4">
        <button
          onClick={() => handleAction('left')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          ← LEFT
        </button>
        <button
          onClick={() => handleAction('both')}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          ↑ BOTH
        </button>
        <button
          onClick={() => handleAction('right')}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
        >
          RIGHT →
        </button>
      </div>
    </div>
  );
}