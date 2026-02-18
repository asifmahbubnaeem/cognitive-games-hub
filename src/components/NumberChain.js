//3rd Game Number Chain -- mental math trainer
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { Brain, Zap, Trophy, Target, Clock, TrendingUp, Award, Link } from 'lucide-react';
import { recordPlayedGame } from '../utils/userProgress';
import Tutorial, { createNumberChainTutorial } from './onboarding/Tutorial';
import { usePremium } from '../contexts/PremiumContext';
import { canPlayMoreGames } from '../utils/premium';
import DailyLimitModal from './premium/DailyLimitModal';

const OPERATIONS = [
  { symbol: '+', name: 'Add', fn: (a, b) => a + b },
  { symbol: '-', name: 'Subtract', fn: (a, b) => a - b },
  { symbol: '×', name: 'Multiply', fn: (a, b) => a * b },
  { symbol: '÷', name: 'Divide', fn: (a, b) => Math.floor(a / b) }
];

const DIFFICULTY_LEVELS = {
  beginner: { name: 'Beginner', chainLength: 3, range: [1, 10], color: 'from-green-500 to-emerald-600' },
  intermediate: { name: 'Intermediate', chainLength: 4, range: [1, 15], color: 'from-blue-500 to-cyan-600' },
  advanced: { name: 'Advanced', chainLength: 5, range: [1, 20], color: 'from-orange-500 to-red-600' },
  expert: { name: 'Expert', chainLength: 6, range: [1, 25], color: 'from-purple-500 to-pink-600' },
  master: { name: 'Master', chainLength: 7, range: [1, 30], color: 'from-yellow-500 to-red-600' }
};

export default function NumberChain() {

  const navigate = useNavigate();

  const [gameState, setGameState] = useState('menu');
  const [difficulty, setDifficulty] = useState('beginner');
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState({});
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  const [chain, setChain] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showingChain, setShowingChain] = useState(true);
  const [userAnswer, setUserAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalTime, setTotalTime] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [chainHistory, setChainHistory] = useState([]);
  const [perfectChains, setPerfectChains] = useState(0);

  const timerRef = useRef(null);
  const chainTimerRef = useRef(null);
  const timeoutTriggeredRef = useRef(false);
  const recordedRef = useRef(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDailyLimit, setShowDailyLimit] = useState(false);
  const { isPremium } = usePremium();

  useEffect(() => {
    // Check if user has seen tutorial before
    const tutorialKey = 'numberChain_tutorialSeen';
    const hasSeenTutorial = localStorage.getItem(tutorialKey) === 'true';
    if (!hasSeenTutorial && gameState === 'menu') {
      setShowTutorial(true);
    }
  }, [gameState]);

  const handleTutorialComplete = () => {
    localStorage.setItem('numberChain_tutorialSeen', 'true');
    setShowTutorial(false);
  };

  const handleTutorialSkip = () => {
    localStorage.setItem('numberChain_tutorialSeen', 'true');
    setShowTutorial(false);
  };

  useEffect(() => {
    if (gameState === 'gameover' && !recordedRef.current) {
      recordedRef.current = true;
      const accuracy = chainHistory.length > 0 
        ? Math.round((chainHistory.filter(c => c.isCorrect).length / chainHistory.length) * 100)
        : 0;
      const perfect = chainHistory.length > 0 && chainHistory.every(c => c.isCorrect);
      recordPlayedGame('number-chain', score, { difficulty, accuracy, perfect });
    }
    if (gameState === 'menu') recordedRef.current = false;
  }, [gameState, score, difficulty, chainHistory]);

  const playCorrectSound = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 800 + (streak * 40);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
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
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.25);
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  };

  const playPerfectSound = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 1000;
    osc.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.2);
    osc.frequency.exponentialRampToValueAtTime(2500, audioCtx.currentTime + 0.3);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  };

  const generateNewChain = () => {
    const config = DIFFICULTY_LEVELS[difficulty];
    const [min, max] = config.range;
    const startNum = Math.floor(Math.random() * (max - min + 1)) + min;
    
    const newChain = [{ type: 'start', value: startNum }];
    let current = startNum;

    for (let i = 0; i < config.chainLength; i++) {
      let op, operand, validOperation = false;
      let attempts = 0;

      while (!validOperation && attempts < 20) {
        op = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
        operand = Math.floor(Math.random() * (max - min + 1)) + min;

        if (op.symbol === '÷') {
          if (operand !== 0 && current % operand === 0) {
            validOperation = true;
          }
        } else if (op.symbol === '-') {
          if (current - operand >= 0) {
            validOperation = true;
          }
        } else {
          const result = op.fn(current, operand);
          if (result >= 0 && result <= 1000) {
            validOperation = true;
          }
        }
        attempts++;
      }

      if (validOperation) {
        newChain.push({ type: 'operation', operation: op, value: operand });
        current = op.fn(current, operand);
      }
    }

    setChain(newChain);
    setCorrectAnswer(current);
    setCurrentStep(0);
    setShowingChain(true);
    setUserAnswer('');
    setTimeLeft(30);
    timeoutTriggeredRef.current = false;
  };

  const handleChainTimeout = () => {
    if (timeoutTriggeredRef.current) return;
    timeoutTriggeredRef.current = true;

    playWrongSound();
    setStreak(0);
    
    setChainHistory(prev => [...prev, {
      chain: chain,
      userAnswer: null,
      correctAnswer: correctAnswer,
      isCorrect: false,
      wasTimeout: true
    }]);

    setFeedback({ type: 'error', message: `⏱️ Time's Up! Answer was ${correctAnswer}` });
    
    setLives(l => {
      const newLives = l - 1;
      if (newLives <= 0) {
        setTimeout(() => setGameState('gameover'), 1000);
      } else {
        setTimeout(() => {
          setFeedback(null);
          generateNewChain();
        }, 2000);
      }
      return newLives;
    });
  };

  useEffect(() => {
    if (gameState === 'playing' && !showingChain && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => Math.max(0, t - 1));
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState, showingChain, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && !showingChain && gameState === 'playing' && !timeoutTriggeredRef.current) {
      handleChainTimeout();
    }
  }, [timeLeft, showingChain, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && showingChain && chain.length > 0) {
      const displayTime = 2000 + (chain.length * 800);
      chainTimerRef.current = setTimeout(() => {
        setShowingChain(false);
      }, displayTime);

      return () => {
        if (chainTimerRef.current) clearTimeout(chainTimerRef.current);
      };
    }
  }, [gameState, showingChain, chain]);

  const startGame = () => {
    // Check daily limit for free users
    if (!isPremium && !canPlayMoreGames()) {
      setShowDailyLimit(true);
      return;
    }

    setScore(0);
    setLives(3);
    setStreak(0);
    setMaxStreak(0);
    setTotalTime(0);
    setChainHistory([]);
    setPerfectChains(0);
    setGameState('playing');
    setTimeout(() => generateNewChain(), 100);
  };

  const handleSubmit = () => {
    if (userAnswer === '' || timeoutTriggeredRef.current) return;

    const answer = parseInt(userAnswer);
    const isCorrect = answer === correctAnswer;
    const timeTaken = 30 - timeLeft;

    setChainHistory(prev => [...prev, {
      chain: chain,
      userAnswer: answer,
      correctAnswer: correctAnswer,
      isCorrect: isCorrect,
      timeTaken: timeTaken
    }]);

    if (isCorrect) {
      playCorrectSound();
      
      const basePoints = 50;
      const speedBonus = Math.max(0, (30 - timeTaken) * 2);
      const chainBonus = chain.length * 10;
      const streakBonus = streak * 5;
      const totalPoints = basePoints + speedBonus + chainBonus + streakBonus;

      setScore(s => s + totalPoints);
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        if (newStreak % 3 === 0) playPerfectSound();
        return newStreak;
      });

      if (timeTaken < 10) {
        setPerfectChains(p => p + 1);
        setFeedback({ type: 'perfect', message: `🔥 PERFECT! +${totalPoints} (${timeTaken}s)` });
      } else {
        setFeedback({ type: 'success', message: `✓ Correct! +${totalPoints}` });
      }

      setTimeout(() => {
        setFeedback(null);
        generateNewChain();
      }, 1500);
    } else {
      playWrongSound();
      setStreak(0);

      setFeedback({ type: 'error', message: `✗ Wrong! Answer was ${correctAnswer}` });

      setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) {
          setTimeout(() => setGameState('gameover'), 1000);
        } else {
          setTimeout(() => {
            setFeedback(null);
            generateNewChain();
          }, 2000);
        }
        return newLives;
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showingChain) {
      handleSubmit();
    }
  };

  const renderChainDisplay = () => {
    if (chain.length === 0) return null;

    return (
      <div className="flex items-center justify-center flex-wrap gap-4 text-white">
        {chain.map((item, index) => (
          <React.Fragment key={index}>
            {item.type === 'start' && (
              <div className="text-6xl font-bold text-cyan-400 animate-bounce">
                {item.value}
              </div>
            )}
            {item.type === 'operation' && (
              <>
                <div className="text-5xl font-bold text-yellow-400">
                  {item.operation.symbol}
                </div>
                <div className="text-6xl font-bold text-purple-400 animate-bounce" style={{ animationDelay: `${index * 0.1}s` }}>
                  {item.value}
                </div>
              </>
            )}
          </React.Fragment>
        ))}
        {!showingChain && (
          <>
            <div className="text-5xl font-bold text-yellow-400">=</div>
            <div className="text-6xl font-bold text-green-400">?</div>
          </>
        )}
      </div>
    );
  };

  if (gameState === 'menu') {
    return (
      <>
        {showTutorial && (
          <Tutorial
            steps={createNumberChainTutorial()}
            onComplete={handleTutorialComplete}
            onSkip={handleTutorialSkip}
          />
        )}
        {showDailyLimit && (
          <DailyLimitModal
            onClose={() => setShowDailyLimit(false)}
            onUpgrade={() => setShowDailyLimit(false)}
          />
        )}
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="text-center max-w-4xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            <Link className="w-20 h-20 text-cyan-400 animate-pulse" />
            <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              Number Chain
            </h1>
          </div>

          <div className="bg-slate-900 bg-opacity-90 rounded-2xl p-8 mb-8 border-4 border-cyan-400 shadow-2xl">
            <h2 className="text-3xl font-bold text-cyan-400 mb-6">🧠 Master Mental Math!</h2>
            
            <div className="text-left text-white space-y-4 text-lg mb-6">
              <p className="text-center text-xl">Calculate chains of operations in your head!</p>
              
              <div className="bg-slate-800 p-6 rounded-lg border-2 border-purple-400">
                <p className="font-bold text-purple-300 mb-3">How it works:</p>
                <div className="space-y-2 text-gray-300">
                  <p>1️⃣ A starting number appears</p>
                  <p>2️⃣ Operations flash one by one (+ - × ÷)</p>
                  <p>3️⃣ Calculate mentally as you go</p>
                  <p>4️⃣ Enter the final answer!</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-4 rounded-lg">
                <p className="font-bold text-center">Example: 5 → +3 → ×2 → -4 = ?</p>
                <p className="text-center text-sm mt-2">Answer: 12 (5+3=8, 8×2=16, 16-4=12)</p>
              </div>
            </div>
          </div>

          <h3 className="text-3xl font-bold text-white mb-6">Select Difficulty</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {Object.entries(DIFFICULTY_LEVELS).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                className={`bg-gradient-to-r ${config.color} text-white p-6 rounded-xl hover:scale-105 transition-transform shadow-2xl border-4 ${
                  difficulty === key ? 'border-white ring-4 ring-yellow-400' : 'border-transparent'
                }`}
              >
                <div className="text-3xl font-bold mb-2">{config.name}</div>
                <div className="text-lg">{config.chainLength} Operations</div>
                <div className="text-sm mt-2 opacity-90">Numbers: {config.range[0]}-{config.range[1]}</div>
              </button>
            ))}
          </div>

          {highScores[difficulty] && (
            <div className="text-yellow-400 text-2xl mb-4 font-bold">
              Best ({DIFFICULTY_LEVELS[difficulty].name}): {highScores[difficulty]}
            </div>
          )}

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white px-20 py-6 rounded-2xl text-4xl font-bold hover:scale-105 transition-transform shadow-2xl animate-pulse"
          >
            START TRAINING
          </button>
        </div>
      </div>
      </>
    );
  }

  if (gameState === 'gameover') {
    const newHighScore = !highScores[difficulty] || score > highScores[difficulty];
    if (newHighScore) {
      setHighScores(prev => ({ ...prev, [difficulty]: score }));
    }

    const accuracy = chainHistory.length > 0 
      ? Math.round((chainHistory.filter(c => c.isCorrect).length / chainHistory.length) * 100)
      : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center p-4 overflow-y-auto">
        <div className="text-center max-w-5xl my-8">
          <h1 className="text-6xl font-bold text-red-400 mb-8">Training Complete!</h1>

          <div className="bg-slate-900 bg-opacity-90 rounded-2xl p-8 mb-8 border-4 border-red-400">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
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
                <Award className="w-12 h-12 text-white mx-auto mb-2" />
                <div className="text-4xl font-bold text-white">{perfectChains}</div>
                <div className="text-white">Perfect Chains</div>
              </div>
            </div>

            {newHighScore && (
              <div className="mb-6 text-3xl text-green-400 font-bold animate-pulse">
                🎉 NEW HIGH SCORE! 🎉
              </div>
            )}

            <div className="bg-slate-800 rounded-xl p-6 text-left border-2 border-cyan-400">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <Brain className="w-8 h-8" />
                Performance Analysis
              </h2>

              <div className="space-y-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="text-white font-bold mb-2">Mental Math Level:</div>
                  <div className="text-2xl text-cyan-400">
                    {accuracy >= 90 ? '🏆 Elite Calculator' :
                     accuracy >= 75 ? '⭐ Advanced Thinker' :
                     accuracy >= 60 ? '📈 Developing Skills' :
                     '🌱 Keep Practicing!'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Chains Attempted</div>
                    <div className="text-white text-2xl font-bold">{chainHistory.length}</div>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <div className="text-gray-400 text-sm">Difficulty Level</div>
                    <div className="text-white text-2xl font-bold">{DIFFICULTY_LEVELS[difficulty].name}</div>
                  </div>
                </div>
              </div>
            </div>

            {chainHistory.length > 0 && (
              <div className="mt-8 bg-slate-800 rounded-xl p-6 border-2 border-purple-400">
                <h2 className="text-2xl font-bold text-purple-400 mb-4">Chain Review</h2>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {chainHistory.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        item.isCorrect
                          ? 'bg-green-900 bg-opacity-30 border-green-500'
                          : 'bg-red-900 bg-opacity-30 border-red-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="text-white font-mono text-lg">
                            {item.chain.map((step, i) => (
                              <span key={i}>
                                {step.type === 'start' && step.value}
                                {step.type === 'operation' && ` ${step.operation.symbol} ${step.value}`}
                              </span>
                            ))}
                            {' = '}
                            <span className="text-cyan-400">{item.correctAnswer}</span>
                          </div>
                          {item.timeTaken && (
                            <div className="text-sm text-gray-400 mt-1">
                              Solved in {item.timeTaken}s
                            </div>
                          )}
                        </div>
                        <div className="text-3xl ml-4">
                          {item.isCorrect ? '✓' : item.wasTimeout ? '⏱️' : '✗'}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="bg-slate-900 bg-opacity-50 p-2 rounded text-sm">
                          <div className="text-gray-400">Correct Answer:</div>
                          <div className="text-green-400 font-bold">{item.correctAnswer}</div>
                        </div>
                        <div className="bg-slate-900 bg-opacity-50 p-2 rounded text-sm">
                          <div className="text-gray-400">Your Answer:</div>
                          <div className={`font-bold ${
                            item.wasTimeout ? 'text-orange-400' : 
                            item.isCorrect ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {item.wasTimeout ? 'TIMEOUT' : item.userAnswer}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setGameState('menu')}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-16 py-5 rounded-xl text-3xl font-bold hover:scale-105 transition-transform shadow-2xl"
          >
            TRAIN AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-900 bg-opacity-90 rounded-xl p-4 mb-6 border-4 border-cyan-400 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Trophy className="text-yellow-400 w-8 h-8" />
              <span className="text-white text-3xl font-bold">{score}</span>
            </div>

            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full ${
                    i < lives ? 'bg-red-500 shadow-lg' : 'bg-gray-700'
                  } flex items-center justify-center text-2xl`}
                >
                  ❤
                </div>
              ))}
            </div>

            <div className="bg-slate-800 px-4 py-2 rounded-lg">
              <div className="text-gray-400 text-sm">Chain Length</div>
              <div className="text-white text-xl font-bold">{DIFFICULTY_LEVELS[difficulty].chainLength}</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {streak > 0 && (
              <div className="flex items-center gap-2 animate-pulse">
                <Zap className="text-orange-400 w-10 h-10" />
                <span className="text-orange-400 text-4xl font-bold">{streak}x</span>
              </div>
            )}

            {!showingChain && (
              <div className="flex items-center gap-2">
                <Clock className={`w-10 h-10 ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
                <span className={`text-4xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
            )}
          </div>
        </div>

        {feedback && (
          <div className="mb-6">
            <div className={`p-4 rounded-xl text-center text-2xl font-bold ${
              feedback.type === 'perfect' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white animate-pulse border-4 border-white`}>
              {feedback.message}
            </div>
          </div>
        )}

        <div className="bg-slate-800 rounded-3xl p-12 mb-6 shadow-2xl border-8 border-purple-500 min-h-96 flex flex-col items-center justify-center">
          {showingChain ? (
            <div className="text-center">
              <div className="text-3xl text-cyan-400 font-bold mb-8 animate-pulse">
                Memorize the Chain!
              </div>
              {renderChainDisplay()}
            </div>
          ) : (
            <div className="text-center w-full">
              <div className="text-2xl text-white font-bold mb-6">
                What's the final answer?
              </div>
              {renderChainDisplay()}
              <div className="mt-8">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter answer..."
                  autoFocus
                  className="text-6xl font-bold text-center bg-slate-700 text-white p-6 rounded-2xl border-4 border-cyan-400 focus:border-pink-400 focus:outline-none w-96"
                />
              </div>
            </div>
          )}
        </div>

        {!showingChain && (
          <button
            onClick={handleSubmit}
            disabled={userAnswer === ''}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 rounded-2xl text-3xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            SUBMIT ANSWER
          </button>
        )}
      </div>
    </div>
  );
}