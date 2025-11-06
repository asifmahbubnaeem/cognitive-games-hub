import React, { useState, useEffect, useRef } from 'react';
import { Brain, Target, Zap, Trophy, Clock, Users, Medal } from 'lucide-react';

const COLORS = [
  { name: 'RED', value: '#ef4444', letters: 3 },
  { name: 'BLUE', value: '#3b82f6', letters: 4 },
  { name: 'GREEN', value: '#22c55e', letters: 5 },
  { name: 'PINK', value: '#ec4899', letters: 4 }
];

export default function FocusFlow() {
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [health, setHealth] = useState(3);
  const [combo, setCombo] = useState(0);
  const [currentCircle, setCurrentCircle] = useState(null);
  const [focusTime, setFocusTime] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [correctClicks, setCorrectClicks] = useState(0);
  const [message, setMessage] = useState('');

  const timerRef = useRef(null);
  const circleTimerRef = useRef(null);

  const playCorrectSound = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 800 + (combo * 50);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  };

  const playWrongSound = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 200;
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  };

  const playStreakSound = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 1000;
    osc.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 0.15);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setFocusTime(t => t + 1);
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      const handleKeyPress = (e) => {
        if (e.key === 'ArrowLeft') {
          handleResponse(true);
        } else if (e.key === 'ArrowRight') {
          handleResponse(false);
        }
      };
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameState, currentCircle]);

  useEffect(() => {
    if (gameState === 'playing' && !currentCircle) {
      spawnCircle();
    }
  }, [gameState, currentCircle]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const spawnCircle = () => {
    if (circleTimerRef.current) clearTimeout(circleTimerRef.current);

    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const number = Math.floor(Math.random() * 6) + 1;
    const isMatch = number === color.letters;

    setCurrentCircle({ color, number, isMatch });

    circleTimerRef.current = setTimeout(() => {
      handleTimeout();
    }, 3000);
  };

  const handleTimeout = () => {
    if (!currentCircle) return;

    if (currentCircle.isMatch) {
      playWrongSound();
      setCombo(0);
      setHealth(h => {
        const newHealth = h - 1;
        if (newHealth <= 0) setGameState('gameover');
        return newHealth;
      });
      showMessage('Timeout! Missed match');
    } else {
      playCorrectSound();
      const points = 10 * (combo + 1);
      setScore(s => s + points);
      setCombo(c => c + 1);
      setCorrectClicks(cc => cc + 1);
      showMessage(`+${points} points (timeout correct)`);
    }

    setCurrentCircle(null);
  };

  const handleResponse = (userSaysMatch) => {
    if (!currentCircle) return;

    if (circleTimerRef.current) clearTimeout(circleTimerRef.current);

    setTotalClicks(t => t + 1);

    const isCorrect = userSaysMatch === currentCircle.isMatch;

    if (isCorrect) {
      playCorrectSound();
      const points = 10 * (combo + 1);
      setScore(s => s + points);
      setCombo(c => {
        const newCombo = c + 1;
        if (newCombo % 5 === 0) playStreakSound();
        return newCombo;
      });
      setCorrectClicks(cc => cc + 1);
      showMessage(`+${points} points!`);
    } else {
      playWrongSound();
      setCombo(0);
      setHealth(h => {
        const newHealth = h - 1;
        if (newHealth <= 0) setGameState('gameover');
        return newHealth;
      });
      showMessage('Wrong!');
    }

    setCurrentCircle(null);
  };

  const startGame = () => {
    setScore(0);
    setCombo(0);
    setHealth(3);
    setFocusTime(0);
    setTotalClicks(0);
    setCorrectClicks(0);
    setCurrentCircle(null);
    setMessage('');
    setGameState('playing');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="w-16 h-16 text-cyan-400 animate-pulse" />
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
              Focus Flow
            </h1>
          </div>
          
          <div className="bg-slate-900 bg-opacity-80 rounded-xl p-8 mb-8 border-2 border-cyan-400">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">🎯 How to Play</h2>
            <div className="text-left text-white space-y-3 text-lg">
              <p>• Circles appear with a COLOR and a NUMBER</p>
              <p>• Click <span className="text-green-400 font-bold">MATCH</span> if NUMBER = color's letter count</p>
              <p className="text-cyan-300 font-bold pl-4">
                ✓ RED (3 letters) with "3" = MATCH<br/>
                ✓ BLUE (4 letters) with "4" = MATCH<br/>
                ✓ GREEN (5 letters) with "5" = MATCH<br/>
                ✓ PINK (4 letters) with "4" = MATCH
              </p>
              <p>• Click <span className="text-red-400 font-bold">MISMATCH</span> if they don't match</p>
              <p>• Keyboard: <span className="text-cyan-400">← Left = MATCH</span> | <span className="text-red-400">→ Right = MISMATCH</span></p>
            </div>
          </div>

          {highScore > 0 && (
            <div className="text-yellow-400 text-3xl mb-4 font-bold">
              Best Score: {highScore}
            </div>
          )}

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white px-16 py-5 rounded-xl text-3xl font-bold hover:from-cyan-600 hover:to-pink-600 transition-all transform hover:scale-110 shadow-2xl"
          >
            START TRAINING
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    if (score > highScore) setHighScore(score);
    const accuracy = totalClicks > 0 ? Math.round((correctClicks / totalClicks) * 100) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-red-900 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl font-bold text-red-400 mb-8">Session Complete</h1>
          
          <div className="bg-slate-900 bg-opacity-90 rounded-xl p-8 mb-8 border-2 border-red-400">
            <div className="grid grid-cols-2 gap-6 text-white">
              <div className="bg-slate-800 p-4 rounded-lg">
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-yellow-400">{score}</div>
                <div className="text-gray-400">Final Score</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <Zap className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-orange-400">{combo}</div>
                <div className="text-gray-400">Max Combo</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-cyan-400">{formatTime(focusTime)}</div>
                <div className="text-gray-400">Focus Time</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-400">{accuracy}%</div>
                <div className="text-gray-400">Accuracy</div>
              </div>
            </div>

            {score > highScore && (
              <div className="mt-6 text-3xl text-green-400 font-bold animate-pulse">
                🎉 NEW HIGH SCORE! 🎉
              </div>
            )}
          </div>

          <button
            onClick={() => setGameState('menu')}
            className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white px-12 py-4 rounded-lg text-2xl font-bold hover:from-cyan-600 hover:to-pink-600 transition-all transform hover:scale-110"
          >
            TRAIN AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Stats Bar */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="bg-slate-900 bg-opacity-90 rounded-lg p-4 flex justify-between items-center border-2 border-cyan-400">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400 w-6 h-6" />
              <span className="text-white text-2xl font-bold">{score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-cyan-400 w-6 h-6" />
              <span className="text-white text-xl">{formatTime(focusTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${
                    i < health ? 'bg-red-500' : 'bg-gray-700'
                  } flex items-center justify-center text-white font-bold`}
                >
                  ❤
                </div>
              ))}
            </div>
          </div>
          {combo > 0 && (
            <div className="flex items-center gap-2 animate-pulse">
              <Zap className="text-orange-400 w-8 h-8" />
              <span className="text-orange-400 text-3xl font-bold">
                {combo}x COMBO!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="max-w-4xl mx-auto h-10 mb-4">
        {message && (
          <div className="bg-purple-600 text-white text-center py-2 rounded shadow-lg animate-pulse">
            {message}
          </div>
        )}
      </div>

      {/* Circle Display */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-lg p-12 mb-6 shadow-2xl border-4 border-purple-500 flex items-center justify-center min-h-96">
          {currentCircle ? (
            <div className="text-center">
              <div
                className="w-64 h-64 rounded-full flex items-center justify-center text-9xl shadow-2xl mx-auto mb-6 border-8 border-white animate-pulse"
                style={{ backgroundColor: currentCircle.color.value }}
              >
                <span className="text-white font-bold">{currentCircle.number}</span>
              </div>
              <div className="text-white text-4xl font-bold">
                {currentCircle.color.name}
              </div>
            </div>
          ) : (
            <div className="text-cyan-400 text-3xl font-bold animate-pulse">
              Get ready...
            </div>
          )}
        </div>

        {/* Match/Mismatch Buttons */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <button
            onClick={() => handleResponse(true)}
            disabled={!currentCircle}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-10 rounded-2xl text-3xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-2xl border-4 border-green-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="text-5xl mb-3">✓</div>
            <div>MATCH</div>
            <div className="text-lg text-green-100 mt-3">(← Left Arrow)</div>
          </button>

          <button
            onClick={() => handleResponse(false)}
            disabled={!currentCircle}
            className="bg-gradient-to-r from-red-500 to-rose-600 text-white py-10 rounded-2xl text-3xl font-bold hover:from-red-600 hover:to-rose-700 transition-all transform hover:scale-105 shadow-2xl border-4 border-red-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="text-5xl mb-3">✗</div>
            <div>MISMATCH</div>
            <div className="text-lg text-red-100 mt-3">(→ Right Arrow)</div>
          </button>
        </div>

        {/* Reminder */}
        <div className="bg-slate-900 bg-opacity-70 rounded-lg p-4 text-center border-2 border-purple-400">
          <div className="text-gray-300 text-lg mb-2">
            <span className="text-cyan-400 font-bold">Reminder:</span> RED=3 | BLUE=4 | GREEN=5 | PINK=4
          </div>
          <div className="text-purple-300 text-sm">
            Click MATCH if number = color letters | Click MISMATCH if they don't match
          </div>
        </div>
      </div>
    </div>
  );
}