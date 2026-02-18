import React, { useState, useEffect, useRef } from 'react';
import { Brain, Zap, Trophy, Clock, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { recordPlayedGame } from '../utils/userProgress';

// ============================================
// FACTS DATABASE - Easy to Update!
// ============================================
// For React App: Replace this with: import factsData from './facts.json';
// For Artifact: Edit the facts array below directly
// const factsData = {
//   "facts": [
//     { "text": "Water boils at 100°C", "correct": true },
//     { "text": "There are 7 days in a week", "correct": true },
//     { "text": "The sun rises in the west", "correct": false },
//     { "text": "A square has 4 sides", "correct": true },
//     { "text": "February has 30 days", "correct": false },
//     { "text": "There are 12 months in a year", "correct": true },
//     { "text": "Humans have 8 fingers", "correct": false },
//     { "text": "A triangle has 3 corners", "correct": true },
//     { "text": "Ice is frozen water", "correct": true },
//     { "text": "The Earth is flat", "correct": false },
//     { "text": "Paris is the capital of France", "correct": true },
//     { "text": "Spiders have 6 legs", "correct": false },
//     { "text": "Gold is heavier than silver", "correct": true },
//     { "text": "Lightning never strikes twice", "correct": false },
//     { "text": "The Pacific is the largest ocean", "correct": true },
//     { "text": "Diamonds are made of carbon", "correct": true },
//     { "text": "Sound travels faster than light", "correct": false },
//     { "text": "A day has 24 hours", "correct": true },
//     { "text": "Cats are reptiles", "correct": false },
//     { "text": "The Great Wall is visible from space", "correct": false },
//     { "text": "Honey never spoils", "correct": true },
//     { "text": "Bananas grow on trees", "correct": false },
//     { "text": "The human body has 206 bones", "correct": true },
//     { "text": "Venus is the hottest planet", "correct": true },
//     { "text": "Penguins can fly", "correct": false },
//     { "text": "Mount Everest is the tallest mountain", "correct": true },
//     { "text": "Sharks are mammals", "correct": false },
//     { "text": "An octopus has three hearts", "correct": true },
//     { "text": "Tomatoes are vegetables", "correct": false },
//     { "text": "Bats are blind", "correct": false }
//   ]
// };
import factsData from './facts.json';
// ============================================

const DIFFICULTY_COLORS = {
  green: { bg: '#22c55e', name: 'GREEN', label: 'Think Carefully', time: 4000, emoji: '🟢' },
  yellow: { bg: '#eab308', name: 'YELLOW', label: 'Quick Decision', time: 2000, emoji: '🟡' },
  red: { bg: '#ef4444', name: 'RED', label: 'Instant Reflex!', time: 1000, emoji: '🔴' }
};

const generateStatement = () => {
  const types = [
    { 
      generator: () => {
        const a = Math.floor(Math.random() * 15) + 1;
        const b = Math.floor(Math.random() * 15) + 1;
        const op = ['+', '-', '×'][Math.floor(Math.random() * 3)];
        let result;
        if (op === '+') result = a + b;
        else if (op === '-') result = a - b;
        else result = a * b;
        
        const isCorrect = Math.random() > 0.5;
        const displayed = isCorrect ? result : result + (Math.random() > 0.5 ? 1 : -1);
        
        return {
          text: `${a} ${op} ${b} = ${displayed}`,
          correct: displayed===result //isCorrect
        };
      }
    },
    {
      generator: () => {
        const a = Math.floor(Math.random() * 20) + 1;
        const b = Math.floor(Math.random() * 20) + 1;
        const ops = ['>', '<', '='];
        const op = ops[Math.floor(Math.random() * ops.length)];
        
        let isCorrect;
        if (op === '>') isCorrect = a > b;
        else if (op === '<') isCorrect = a < b;
        else isCorrect = a === b;
        
        // const shouldBeWrong = Math.random() > 0.5;
        // if (shouldBeWrong) isCorrect = !isCorrect;
        
        return {
          text: `${a} ${op} ${b}`,
          correct: isCorrect
        };
      }
    },
    {
      generator: () => {
        return factsData.facts[Math.floor(Math.random() * factsData.facts.length)];
      }
    }
  ];
  
  const type = types[Math.floor(Math.random() * types.length)];
  return type.generator();
};

export default function SpeedTruth() {
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentStatement, setCurrentStatement] = useState(null);
  const [difficulty, setDifficulty] = useState('green');
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]);
  const [statementStartTime, setStatementStartTime] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [difficultyRamp, setDifficultyRamp] = useState(0);
  const [questionHistory, setQuestionHistory] = useState([]);

  const timeoutRef = useRef(null);
  const recordedRef = useRef(false);

  useEffect(() => {
    if (gameState === 'gameover' && !recordedRef.current) {
      recordedRef.current = true;
      recordPlayedGame('speed-truth', score);
    }
    if (gameState === 'menu') recordedRef.current = false;
  }, [gameState, score]);

  const playCorrectSound = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 800 + (streak * 30);
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
    osc.frequency.value = 300;
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.2);
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
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
    osc.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.2);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      const handleKeyPress = (e) => {
        if (e.key === 'ArrowLeft') {
          handleAnswer(true);
        } else if (e.key === 'ArrowRight') {
          handleAnswer(false);
        }
      };
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [gameState, currentStatement]);

  useEffect(() => {
    if (gameState === 'playing' && !currentStatement) {
      spawnStatement();
    }
  }, [gameState, currentStatement]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const spawnStatement = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    let newDifficulty;
    if (difficultyRamp < 5) {
      newDifficulty = 'green';
    } else if (difficultyRamp < 15) {
      const rand = Math.random();
      newDifficulty = rand < 0.6 ? 'green' : 'yellow';
    } else {
      const rand = Math.random();
      if (rand < 0.3) newDifficulty = 'green';
      else if (rand < 0.7) newDifficulty = 'yellow';
      else newDifficulty = 'red';
    }

    setDifficulty(newDifficulty);
    const statement = generateStatement();
    setCurrentStatement(statement);
    setStatementStartTime(Date.now());

    const timeLimit = DIFFICULTY_COLORS[newDifficulty].time;
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, timeLimit);
  };

  const handleTimeout = () => {
    console.log("time limit");
    
    // if (!currentStatement) return;
    
    playWrongSound();
    setStreak(0);
    setLives(l => {
      const newLives = l - 1;
      if (newLives <= 0) setGameState('gameover');
      return newLives;
    });
    setFeedback({ type: 'error', message: '⏱️ Too Slow!' });
    setTotalAnswers(t => t + 1);
    if (!currentStatement) return;
    // return;
    
    // Record question history
    // setQuestionHistory(prev => [...prev, {
    //   question: currentStatement.text,
    //   correctAnswer: currentStatement.correct,
    //   userAnswer: null,
    //   wasTimeout: true,
    //   difficulty: difficulty
    // }]);
    
    // setTimeout(() => {
    //   setFeedback(null);
    //   setCurrentStatement(null);
    // }, 800);
  };

  const handleAnswer = (userSaysTrue) => {
    if (!currentStatement) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const reactionTime = Date.now() - statementStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);

    const isCorrect = userSaysTrue === currentStatement.correct;
    setTotalAnswers(t => t + 1);

    // Record question history
    setQuestionHistory(prev => [...prev, {
      question: currentStatement.text,
      correctAnswer: currentStatement.correct,
      userAnswer: userSaysTrue,
      isCorrect: isCorrect,
      reactionTime: reactionTime,
      difficulty: difficulty
    }]);

    if (isCorrect) {
      playCorrectSound();
      
      const speedBonus = difficulty === 'red' ? 3 : difficulty === 'yellow' ? 2 : 1;
      const points = 10 * speedBonus * (streak + 1);
      
      setScore(s => s + points);
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        if (newStreak % 5 === 0) playStreakSound();
        return newStreak;
      });
      setCorrectAnswers(c => c + 1);
      setDifficultyRamp(d => d + 1);
      
      const timeBonus = reactionTime < 500 ? '⚡ LIGHTNING!' : reactionTime < 1000 ? '🔥 FAST!' : '';
      setFeedback({ 
        type: 'success', 
        message: `✓ Correct! +${points} ${timeBonus}` 
      });
    } else {
      playWrongSound();
      setStreak(0);
      setLives(l => {
        const newLives = l - 1;
        if (newLives <= 0) setGameState('gameover');
        return newLives;
      });
      setFeedback({ type: 'error', message: '✗ Wrong!' });
    }

    setTimeout(() => {
      setFeedback(null);
      setCurrentStatement(null);
    }, 600);
  };

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setLives(3);
    setTotalAnswers(0);
    setCorrectAnswers(0);
    setReactionTimes([]);
    setCurrentStatement(null);
    setFeedback(null);
    setDifficultyRamp(0);
    setQuestionHistory([]);
    setGameState('playing');
  };

  const getExpertAnalysis = () => {
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    const avgReaction = reactionTimes.length > 0 
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

    let analysis = {
      overall: '',
      strengths: [],
      weaknesses: [],
      cognitiveProfile: '',
      recommendation: ''
    };

    if (accuracy >= 90 && avgReaction < 1000) {
      analysis.overall = "Exceptional cognitive performance. Your processing speed and decision accuracy are in the top 5% of the population.";
      analysis.cognitiveProfile = "Elite Processor";
    } else if (accuracy >= 80 && avgReaction < 1200) {
      analysis.overall = "Strong cognitive abilities. You demonstrate above-average processing speed with good accuracy maintenance.";
      analysis.cognitiveProfile = "Advanced Thinker";
    } else if (accuracy >= 70 && avgReaction < 1500) {
      analysis.overall = "Solid cognitive performance. You show balanced processing with room for optimization in either speed or accuracy.";
      analysis.cognitiveProfile = "Competent Processor";
    } else if (accuracy >= 60) {
      analysis.overall = "Developing cognitive skills. Your brain shows potential but requires more training to build speed-accuracy balance.";
      analysis.cognitiveProfile = "Growing Learner";
    } else {
      analysis.overall = "Early stage development. Your cognitive processing needs focused training. Don't be discouraged - improvement comes rapidly with practice.";
      analysis.cognitiveProfile = "Beginner";
    }

    if (accuracy >= 85) {
      analysis.strengths.push("🎯 High Accuracy: Your error rate is low, indicating strong inhibition control and careful decision-making.");
    }
    
    if (avgReaction < 1000) {
      analysis.strengths.push("⚡ Fast Processing: Your reaction time is excellent, showing quick neural pathways and rapid information processing.");
    }
    
    if (maxStreak >= 10) {
      analysis.strengths.push("🔥 Sustained Focus: Your ability to maintain long streaks shows excellent concentration and consistency under pressure.");
    }

    if (accuracy >= 80 && avgReaction < 1200) {
      analysis.strengths.push("⚖️ Speed-Accuracy Balance: You've achieved the optimal trade-off between fast responses and maintaining precision.");
    }

    if (accuracy < 70) {
      analysis.weaknesses.push("❌ Accuracy Issues: You're making too many errors. This suggests impulse control needs work - you may be rushing decisions without full processing.");
    }

    if (avgReaction > 1500) {
      analysis.weaknesses.push("🐌 Processing Speed: Your reaction time is slower than average. This could indicate hesitation, over-thinking, or slower neural processing pathways.");
    }

    if (maxStreak < 5) {
      analysis.weaknesses.push("📉 Consistency Problems: Short streaks indicate difficulty maintaining focus or adapting to changing demands. Your attention may be wavering.");
    }

    if (accuracy < 85 && avgReaction < 1000) {
      analysis.weaknesses.push("🎲 Impulsive Responses: You're fast but inaccurate - classic impulsivity. Your brain is prioritizing speed over verification, leading to preventable errors.");
    }

    if (accuracy >= 90 && avgReaction > 1500) {
      analysis.weaknesses.push("🤔 Over-Cautious: High accuracy with slow speed suggests anxiety or perfectionism. You're over-analyzing - trust your initial judgment more.");
    }

    if (totalAnswers < 15) {
      analysis.weaknesses.push("⚠️ Limited Data: Small sample size. Play longer sessions for more accurate cognitive assessment.");
    }

    if (analysis.weaknesses.length === 0) {
      if (accuracy < 100) {
        analysis.weaknesses.push("🎯 Room for Perfection: While strong, you still make occasional errors. Target 100% accuracy to reach true mastery.");
      }
      if (avgReaction > 500) {
        analysis.weaknesses.push("⚡ Speed Ceiling: Your reactions, while good, can be faster. Elite performers respond in under 500ms consistently.");
      }
    }

    if (accuracy < 70) {
      analysis.recommendation = "Focus on ACCURACY first. Slow down deliberately on GREEN and YELLOW cards. Speed will come naturally as patterns become automatic. Practice mindful decision-making.";
    } else if (avgReaction > 1500) {
      analysis.recommendation = "Work on PROCESSING SPEED. Practice with GREEN cards only, gradually reducing your response time. Build confidence in quick decisions. Your accuracy shows you know the answers - trust yourself faster.";
    } else if (accuracy >= 85 && avgReaction < 1000) {
      analysis.recommendation = "You're operating at a high level. Challenge yourself with longer sessions and track improvement in RED card performance. Work on maintaining focus for 50+ consecutive correct answers.";
    } else {
      analysis.recommendation = "Balance training: alternate between accuracy-focused sessions (aiming for 90%+) and speed-focused sessions (target <1200ms average). Track both metrics separately to identify your natural tendency.";
    }

    return analysis;
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center max-w-3xl">
          <div className="flex items-center justify-center gap-4 mb-8">
            <Zap className="w-20 h-20 text-yellow-400 animate-pulse" />
            <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400">
              Speed Truth
            </h1>
          </div>
          
          <div className="bg-slate-900 bg-opacity-90 rounded-2xl p-8 mb-8 border-4 border-yellow-400 shadow-2xl">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">⚡ Test Your Processing Speed!</h2>
            
            <div className="text-left text-white space-y-4 text-lg mb-6">
              <p className="text-center text-xl">Statements flash with different colors - each requires different speed!</p>
              
              <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg border-2 border-green-400">
                <p className="font-bold text-green-300 mb-2">🟢 GREEN - Think Carefully (4 seconds)</p>
                <p className="text-gray-300">Take your time, ensure accuracy</p>
              </div>
              
              <div className="bg-yellow-900 bg-opacity-50 p-4 rounded-lg border-2 border-yellow-400">
                <p className="font-bold text-yellow-300 mb-2">🟡 YELLOW - Quick Decision (2 seconds)</p>
                <p className="text-gray-300">Balance speed with accuracy</p>
              </div>
              
              <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg border-2 border-red-400">
                <p className="font-bold text-red-300 mb-2">🔴 RED - Instant Reflex! (1 second)</p>
                <p className="text-gray-300">Trust your gut, react fast!</p>
              </div>

              <div className="bg-slate-800 p-4 rounded-lg mt-4">
                <p className="text-cyan-300 font-bold">Controls:</p>
                <p>← Left Arrow = TRUE | → Right Arrow = FALSE</p>
              </div>
            </div>
          </div>

          {highScore > 0 && (
            <div className="text-yellow-400 text-3xl mb-4 font-bold">
              Best Score: {highScore}
            </div>
          )}

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-20 py-6 rounded-2xl text-4xl font-bold hover:scale-105 transition-transform shadow-2xl animate-pulse"
          >
            START TRAINING
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    if (score > highScore) setHighScore(score);
    const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    const avgReaction = reactionTimes.length > 0 
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 0;

    const analysis = getExpertAnalysis();

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center p-4 overflow-y-auto">
        <div className="text-center max-w-4xl my-8">
          <h1 className="text-6xl font-bold text-red-400 mb-8">Training Complete!</h1>
          
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
                <Clock className="w-12 h-12 text-white mx-auto mb-2" />
                <div className="text-4xl font-bold text-white">{avgReaction}ms</div>
                <div className="text-white">Avg Reaction</div>
              </div>
            </div>

            {score > highScore && (
              <div className="mb-6 text-3xl text-green-400 font-bold animate-pulse">
                🎉 NEW HIGH SCORE! 🎉
              </div>
            )}

            <div className="bg-slate-800 rounded-xl p-6 text-left border-2 border-cyan-400">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-10 h-10 text-cyan-400" />
                <h2 className="text-3xl font-bold text-cyan-400">Expert Cognitive Analysis</h2>
              </div>

              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-3 rounded-lg mb-6 border-2 border-white">
                <div className="text-sm uppercase tracking-wider">Your Cognitive Profile</div>
                <div className="text-3xl font-bold">{analysis.cognitiveProfile}</div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  Overall Assessment
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">{analysis.overall}</p>
              </div>

              {analysis.strengths.length > 0 && (
                <div className="mb-6 bg-green-900 bg-opacity-30 p-4 rounded-lg border-2 border-green-500">
                  <h3 className="text-xl font-bold text-green-400 mb-3">💪 Your Strengths</h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="text-gray-200 text-base leading-relaxed">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.weaknesses.length > 0 && (
                <div className="mb-6 bg-red-900 bg-opacity-30 p-4 rounded-lg border-2 border-red-500">
                  <h3 className="text-xl font-bold text-red-400 mb-3">🎯 Areas for Improvement</h3>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-gray-200 text-base leading-relaxed">
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg border-2 border-blue-500">
                <h3 className="text-xl font-bold text-blue-400 mb-3">
                  <AlertCircle className="inline w-6 h-6 mr-2" />
                  Training Recommendation
                </h3>
                <p className="text-gray-200 text-base leading-relaxed">{analysis.recommendation}</p>
              </div>
            </div>

            {/* Question Review Section */}
            {questionHistory.length > 0 && (
              <div className="mt-8 bg-slate-800 rounded-xl p-6 border-2 border-purple-400">
                <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <Target className="w-8 h-8" />
                  Question Review ({questionHistory.length} questions)
                </h2>
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {questionHistory.map((item, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border-2 ${
                        item.isCorrect 
                          ? 'bg-green-900 bg-opacity-30 border-green-500' 
                          : 'bg-red-900 bg-opacity-30 border-red-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-white font-bold text-lg mb-1">
                            {index + 1}. {item.question}
                          </div>
                          <div className="text-sm text-gray-300">
                            <span className={`inline-block px-2 py-1 rounded ${
                              item.difficulty === 'red' ? 'bg-red-600' :
                              item.difficulty === 'yellow' ? 'bg-yellow-600' :
                              'bg-green-600'
                            }`}>
                              {item.difficulty.toUpperCase()}
                            </span>
                            {item.reactionTime && (
                              <span className="ml-2 text-cyan-400">
                                {item.reactionTime}ms
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-3xl ml-4">
                          {item.isCorrect ? '✓' : item.wasTimeout ? '⏱️' : '✗'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                        <div className="bg-slate-900 bg-opacity-50 p-2 rounded">
                          <div className="text-gray-400">Correct Answer:</div>
                          <div className={`font-bold ${item.correctAnswer ? 'text-green-400' : 'text-red-400'}`}>
                            {item.correctAnswer ? 'TRUE' : 'FALSE'}
                          </div>
                        </div>
                        <div className="bg-slate-900 bg-opacity-50 p-2 rounded">
                          <div className="text-gray-400">Your Answer:</div>
                          <div className={`font-bold ${
                            item.wasTimeout 
                              ? 'text-orange-400' 
                              : item.userAnswer 
                                ? 'text-green-400' 
                                : 'text-red-400'
                          }`}>
                            {item.wasTimeout ? 'TIMEOUT' : item.userAnswer ? 'TRUE' : 'FALSE'}
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
            className="bg-gradient-to-r from-yellow-500 to-red-500 text-white px-16 py-5 rounded-xl text-3xl font-bold hover:scale-105 transition-transform shadow-2xl"
          >
            TRAIN AGAIN
          </button>
        </div>
      </div>
    );
  }

  const diffColor = DIFFICULTY_COLORS[difficulty];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-5xl mx-auto mb-6">
        <div className="bg-slate-900 bg-opacity-90 rounded-xl p-4 border-4 border-yellow-400 flex justify-between items-center">
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
              <div className="text-gray-400 text-sm">Accuracy</div>
              <div className="text-white text-xl font-bold">
                {totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0}%
              </div>
            </div>
          </div>

          {streak > 0 && (
            <div className="flex items-center gap-2 animate-pulse">
              <Zap className="text-orange-400 w-10 h-10" />
              <span className="text-orange-400 text-4xl font-bold">{streak}x</span>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className="max-w-5xl mx-auto mb-6">
          <div className={`p-4 rounded-xl text-center text-2xl font-bold ${
            feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white animate-pulse border-4 border-white`}>
            {feedback.message}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div 
          className="rounded-3xl p-16 mb-8 shadow-2xl border-8 border-white flex items-center justify-center min-h-96 transition-all duration-300"
          style={{ backgroundColor: diffColor.bg }}
        >
          {currentStatement ? (
            <div className="text-center">
              <div className="text-6xl mb-6 animate-pulse">
                {diffColor.emoji}
              </div>
              <div className="text-white text-2xl font-bold mb-4 uppercase tracking-wider">
                {diffColor.label}
              </div>
              <div className="text-white text-6xl font-bold mb-8 animate-pulse">
                {currentStatement.text}
              </div>
            </div>
          ) : (
            <div className="text-white text-4xl font-bold animate-pulse">
              Get Ready...
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8">
          <button
            onClick={() => handleAnswer(true)}
            disabled={!currentStatement}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-12 rounded-2xl text-4xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-2xl border-4 border-green-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="text-6xl mb-4">✓</div>
            <div>TRUE</div>
            <div className="text-xl text-green-100 mt-3">(← Left Arrow)</div>
          </button>

          <button
            onClick={() => handleAnswer(false)}
            disabled={!currentStatement}
            className="bg-gradient-to-r from-red-500 to-rose-600 text-white py-12 rounded-2xl text-4xl font-bold hover:from-red-600 hover:to-rose-700 transition-all transform hover:scale-105 shadow-2xl border-4 border-red-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <div className="text-6xl mb-4">✗</div>
            <div>FALSE</div>
            <div className="text-xl text-red-100 mt-3">(→ Right Arrow)</div>
          </button>
        </div>

        <div className="mt-8 bg-slate-900 bg-opacity-70 rounded-xl p-4 border-2 border-yellow-400">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-green-400 font-bold">🟢 GREEN</div>
              <div className="text-gray-300">4 seconds</div>
            </div>
            <div>
              <div className="text-yellow-400 font-bold">🟡 YELLOW</div>
              <div className="text-gray-300">2 seconds</div>
            </div>
            <div>
              <div className="text-red-400 font-bold">🔴 RED</div>
              <div className="text-gray-300">1 second!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}