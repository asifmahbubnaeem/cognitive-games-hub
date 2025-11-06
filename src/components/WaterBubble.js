import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Brain } from 'lucide-react';

const OPERATIONS = ['+', '-', '*', '/'];
const BUBBLE_COLORS = [
  'rgba(102, 204, 255, 0.7)',
  'rgba(153, 204, 255, 0.7)',
  'rgba(204, 229, 255, 0.7)',
  'rgba(153, 255, 204, 0.7)',
  'rgba(204, 255, 229, 0.7)',
  'rgba(255, 204, 229, 0.7)',
];

export default function WaterBubbleGame() {
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [bubbles, setBubbles] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [burstingBubbles, setBurstingBubbles] = useState([]);
  
  const audioContext = useRef(null);
  const timerRef = useRef(null);
  const bubbleTimerRef = useRef(null);
  const backgroundSoundRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContext.current) audioContext.current.close();
    };
  }, []);

  const playBubbleSound = () => {
    if (!audioContext.current) return;
    const ctx = audioContext.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(400 + Math.random() * 200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600 + Math.random() * 200, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  };

  const playWaterDropSound = () => {
    if (!audioContext.current) return;
    const ctx = audioContext.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  };

  const playBurstSound = () => {
    if (!audioContext.current) return;
    const ctx = audioContext.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  };

  const playCorrectSound = () => {
    if (!audioContext.current) return;
    const ctx = audioContext.current;
    
    // Play a triumphant chord progression
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.08 + 0.4);
      
      oscillator.start(ctx.currentTime + index * 0.08);
      oscillator.stop(ctx.currentTime + index * 0.08 + 0.4);
    });
  };

  const startBackgroundSound = () => {
    if (backgroundSoundRef.current) return;
    
    const playBubble = () => {
      if (gameState === 'playing') {
        playBubbleSound();
        backgroundSoundRef.current = setTimeout(playBubble, 2000 + Math.random() * 2000);
      }
    };
    playBubble();
  };

  const stopBackgroundSound = () => {
    if (backgroundSoundRef.current) {
      clearTimeout(backgroundSoundRef.current);
      backgroundSoundRef.current = null;
    }
  };

  const generateProblem = (difficulty) => {
    let num1, num2, operation, answer;
    
    if (difficulty === 'easy') {
      num1 = Math.floor(Math.random() * 15) + 1;
      num2 = Math.floor(Math.random() * 15) + 1;
      operation = Math.random() > 0.5 ? '+' : '-';
      
      if (operation === '-' && num1 < num2) {
        [num1, num2] = [num2, num1];
      }
    } else if (difficulty === 'intermediate') {
      num1 = Math.floor(Math.random() * 25) + 5;
      num2 = Math.floor(Math.random() * 25) + 5;
      operation = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
      
      if (operation === '-' && num1 < num2) {
        [num1, num2] = [num2, num1];
      }
      
      // For division, ensure no fractional result
      if (operation === '/') {
        num2 = Math.floor(Math.random() * 5) + 2;
        num1 = num2 * (Math.floor(Math.random() * 5) + 2);
      }
      
      // For multiplication, keep result <= 30
      if (operation === '*') {
        num1 = Math.floor(Math.random() * 5) + 2;
        num2 = Math.floor(Math.random() * Math.min(5, Math.floor(30 / num1))) + 1;
      }
    } else {
      num1 = Math.floor(Math.random() * 20) + 10;
      num2 = Math.floor(Math.random() * 20) + 10;
      operation = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
      
      if (operation === '-' && num1 < num2) {
        [num1, num2] = [num2, num1];
      }
      
      // For division, ensure no fractional result
      if (operation === '/') {
        num2 = Math.floor(Math.random() * 5) + 2;
        num1 = num2 * (Math.floor(Math.random() * 5) + 2);
      }
      
      // For multiplication, keep result <= 30
      if (operation === '*') {
        num1 = Math.floor(Math.random() * 5) + 2;
        num2 = Math.floor(Math.random() * Math.min(5, Math.floor(30 / num1))) + 1;
      }
    }
    
    switch (operation) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case '*':
        answer = num1 * num2;
        break;
      case '/':
        answer = num1 / num2;
        break;
    }
    
    // Ensure all numbers are <= 30
    if (num1 > 30 || num2 > 30 || answer > 30) {
      return generateProblem(difficulty);
    }
    
    return {
      num1,
      num2,
      operation,
      answer: Math.round(answer),
      display: `${num1} ${operation} ${num2}`
    };
  };

  const createBubble = () => {
    const rand = Math.random();
    let difficulty;
    
    if (rand < 0.2) {
      difficulty = 'easy';
    } else if (rand < 0.85) {
      difficulty = 'intermediate';
    } else {
      difficulty = 'expert';
    }
    
    const problem = generateProblem(difficulty);
    
    const newBubble = {
      id: Date.now() + Math.random(),
      ...problem,
      x: Math.random() * 80 + 10,
      y: -10,
      size: 60 + Math.random() * 40,
      speed: 0.3 + Math.random() * 0.4,
      color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
      wobble: Math.random() * Math.PI * 2,
      difficulty
    };
    
    setBubbles(prev => [...prev, newBubble]);
    playWaterDropSound();
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    setBubbles([]);
    setBurstingBubbles([]);
    setInputValue('');
    startBackgroundSound();
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('ended');
            stopBackgroundSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      bubbleTimerRef.current = setInterval(() => {
        createBubble();
      }, 2000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bubbleTimerRef.current) clearInterval(bubbleTimerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bubbleTimerRef.current) clearInterval(bubbleTimerRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      const animationFrame = setInterval(() => {
        setBubbles(prev => 
          prev.map(bubble => ({
            ...bubble,
            y: bubble.y + bubble.speed,
            wobble: bubble.wobble + 0.05,
            x: bubble.x + Math.sin(bubble.wobble) * 0.2
          })).filter(bubble => bubble.y < 250)
        );
      }, 16);
      
      return () => clearInterval(animationFrame);
    }
  }, [gameState]);

  const checkAnswer = (value) => {
    if (!value.trim() || gameState !== 'playing') return;
    
    const answer = parseInt(value);
    if (isNaN(answer)) return;
    
    const matchingBubble = bubbles.find(bubble => bubble.answer === answer);
    
    if (matchingBubble) {
      playBurstSound();
      playCorrectSound();
      
      const points = matchingBubble.difficulty === 'easy' ? 5 : 
                     matchingBubble.difficulty === 'intermediate' ? 10 : 15;
      setScore(prev => prev + points);
      
      setBurstingBubbles(prev => [...prev, matchingBubble.id]);
      
      setInputValue('');
      
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== matchingBubble.id));
        setBurstingBubbles(prev => prev.filter(id => id !== matchingBubble.id));
      }, 300);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Only allow numeric values
    if (value === '' || /^\d+$/.test(value)) {
      setInputValue(value);
      checkAnswer(value);
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 via-blue-300 to-cyan-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform hover:scale-105 transition-transform">
          <div className="text-center mb-6">
            <div className="text-7xl mb-4">💧</div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Water Bubble Math
            </h1>
            <p className="text-gray-600">Pop bubbles with correct answers!</p>
          </div>
          
          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2 mb-6"
          >
            <Play size={24} />
            Start Game
          </button>
          
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 text-sm text-gray-700">
            <p className="font-semibold mb-2">How to Play:</p>
            <p className="mb-1">• Bubbles fall down with math problems</p>
            <p className="mb-1">• Type the answer - bubbles pop instantly!</p>
            <p className="mb-1">• Pop bubbles before they disappear!</p>
            <p>• Easy: 5pts | Medium: 10pts | Hard: 15pts</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'ended') {
    const getMathTip = (score) => {
      if (score >= 150) {
        return "💡 Master Tip: Try mental math strategies like breaking numbers into parts (e.g., 47 + 28 = 47 + 20 + 8 = 75). You're already excellent!";
      } else if (score >= 100) {
        return "💡 Pro Tip: For quick multiplication, use the distributive property (e.g., 23 × 4 = 20 × 4 + 3 × 4 = 92). Keep it up!";
      } else if (score >= 60) {
        return "💡 Practice Tip: Master your times tables up to 12. It's the foundation for faster mental math. You're doing great!";
      } else if (score >= 30) {
        return "💡 Learning Tip: Count in groups for addition (e.g., 7 + 8 = 7 + 7 + 1 = 15). Practice makes perfect!";
      } else {
        return "💡 Beginner Tip: Start with smaller numbers and basic operations. Use your fingers if needed—everyone starts somewhere!";
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-400 via-blue-300 to-cyan-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <Brain className="w-20 h-20 mx-auto mb-4 text-blue-500" />
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Time's Up!</h2>
          </div>
          
          <div className="bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl p-6 mb-4">
            <p className="text-center text-white text-lg mb-2 font-semibold">Final Score</p>
            <p className="text-7xl font-bold text-center text-white mb-2">{score}</p>
            <p className="text-center text-white text-sm opacity-90">
              {Math.floor(score / 10)} problems solved
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-gray-700 text-sm leading-relaxed">
              {getMathTip(score)}
            </p>
          </div>
          
          <button
            onClick={() => setGameState('menu')}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-4 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={24} />
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-blue-300 to-cyan-200 relative overflow-hidden">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="bg-white bg-opacity-90 rounded-2xl px-6 py-3 shadow-lg">
          <p className="text-sm text-gray-600 font-semibold">SCORE</p>
          <p className="text-3xl font-bold text-blue-600">{score}</p>
        </div>
        <div className="bg-white bg-opacity-90 rounded-2xl px-6 py-3 shadow-lg">
          <p className="text-sm text-gray-600 font-semibold">TIME</p>
          <p className="text-3xl font-bold text-cyan-600">{timeLeft}s</p>
        </div>
      </div>

      <div className="absolute inset-0 flex items-start justify-center pt-8 pointer-events-none">
        {bubbles.map(bubble => (
          <div
            key={bubble.id}
            className={`absolute transition-all duration-300 ${
              burstingBubbles.includes(bubble.id) ? 'scale-150 opacity-0' : ''
            }`}
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
            }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center shadow-lg border-2 border-white"
              style={{
                background: bubble.color,
                backdropFilter: 'blur(10px)',
              }}
            >
              <span className={`font-bold text-white ${
                bubble.size > 80 ? 'text-lg' : 'text-sm'
              }`} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                {bubble.display}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center">
        <div className="w-full max-w-md">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type answer..."
            className="w-full px-6 py-4 rounded-2xl text-2xl text-center font-bold bg-white bg-opacity-95 shadow-2xl border-4 border-blue-400 focus:outline-none focus:border-cyan-500 transition-all"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}