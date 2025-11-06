import { useState, useEffect } from 'react';

// Icon components
const Sparkles = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);

const Zap = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const Crown = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
  </svg>
);

const Home = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const Timer = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="8"/>
    <path d="M12 9v4l2 2"/>
    <path d="M5 3L3 5"/>
    <path d="m19 3 2 2"/>
  </svg>
);

const Trophy = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
  </svg>
);

const TILE_TYPES = {
  empty: { name: 'Empty', color: 'bg-gray-700', cost: 0, income: 0, icon: null },
  grass: { name: 'Grass', color: 'bg-green-600', cost: 15, income: 2, icon: null, level: 1 },
  forest: { name: 'Forest', color: 'bg-green-700', cost: 0, income: 5, icon: null, level: 2 },
  farm: { name: 'Farm', color: 'bg-yellow-600', cost: 0, income: 12, icon: null, level: 3 },
  village: { name: 'Village', color: 'bg-orange-500', cost: 0, income: 30, icon: null, level: 4 },
  city: { name: 'City', color: 'bg-red-500', cost: 0, income: 75, icon: null, level: 5 },
  castle: { name: 'Castle', color: 'bg-purple-600', cost: 0, income: 200, icon: null, level: 6 }
};

const MERGE_RULES = {
  grass: 'forest',
  forest: 'farm',
  farm: 'village',
  village: 'city',
  city: 'castle'
};

const getPerformanceFeedback = (score, merges, tiles) => {
  const castleCount = tiles.filter(t => t.type === 'castle').length;
  const cityCount = tiles.filter(t => t.type === 'city').length;
  const highTierCount = castleCount + cityCount;
  
  if (score >= 5000 && castleCount >= 3) {
    return {
      rank: 'LEGENDARY',
      message: 'Absolutely phenomenal! You\'re a strategic mastermind!',
      color: 'text-yellow-400',
      emoji: '👑'
    };
  } else if (score >= 3500 && highTierCount >= 4) {
    return {
      rank: 'MASTER',
      message: 'Outstanding performance! Your strategy is top-tier!',
      color: 'text-purple-400',
      emoji: '⭐'
    };
  } else if (score >= 2500 && merges >= 15) {
    return {
      rank: 'EXPERT',
      message: 'Excellent work! You\'ve mastered the merge mechanics!',
      color: 'text-blue-400',
      emoji: '🎯'
    };
  } else if (score >= 1500 && merges >= 10) {
    return {
      rank: 'SKILLED',
      message: 'Great job! You\'re getting the hang of it!',
      color: 'text-green-400',
      emoji: '✨'
    };
  } else if (score >= 800) {
    return {
      rank: 'NOVICE',
      message: 'Good start! Keep practicing your timing and strategy!',
      color: 'text-cyan-400',
      emoji: '🌟'
    };
  } else {
    return {
      rank: 'BEGINNER',
      message: 'Keep trying! Focus on merging quickly and managing resources!',
      color: 'text-gray-400',
      emoji: '🎮'
    };
  }
};

export default function MergeConquerGame() {
  const [gameState, setGameState] = useState('menu');
  const [gold, setGold] = useState(40);
  const [tiles, setTiles] = useState(() => 
    Array(49).fill(null).map((_, i) => ({
      id: i,
      type: i === 24 ? 'grass' : 'empty',
      lastClick: 0
    }))
  );
  const [selected, setSelected] = useState(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(90);
  const [mergeCount, setMergeCount] = useState(0);

  const playMergeSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(783.99, audioContext.currentTime + 0.1);
    oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioContext.currentTime + 0.2);
    
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  };

  const playErrorSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.15);
    
    oscillator.type = 'sawtooth';
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  };

  const playClickSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const income = tiles.reduce((sum, tile) => sum + TILE_TYPES[tile.type].income, 0);
    setTotalIncome(income);
  }, [tiles, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      setGold(g => g + totalIncome / 10);
    }, 100);
    return () => clearInterval(interval);
  }, [totalIncome, gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameState('gameover');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameState]);

  const handleTileClick = (index) => {
    if (gameState !== 'playing') return;
    
    const tile = tiles[index];
    const now = Date.now();

    if (tile.type !== 'empty' && now - tile.lastClick > 400) {
      const gathered = TILE_TYPES[tile.type].income * 2;
      setGold(g => g + gathered);
      setScore(s => s + gathered);
      
      const newTiles = [...tiles];
      newTiles[index] = { ...tile, lastClick: now };
      setTiles(newTiles);
      playClickSound();
      showMessage(`+${gathered} gold!`);
      return;
    }

    if (tile.type === 'empty') {
      const hasAdjacent = getAdjacentIndices(index).some(i => tiles[i].type !== 'empty');
      
      if (!hasAdjacent) {
        playErrorSound();
        showMessage('Must expand from existing tiles!');
        return;
      }

      if (gold >= TILE_TYPES.grass.cost) {
        setGold(g => g - TILE_TYPES.grass.cost);
        const newTiles = [...tiles];
        newTiles[index] = { ...tile, type: 'grass', lastClick: 0 };
        setTiles(newTiles);
        playClickSound();
        showMessage('New tile claimed!');
      } else {
        playErrorSound();
        showMessage('Not enough gold!');
      }
      return;
    }

    if (selected === null) {
      setSelected(index);
    } else if (selected === index) {
      setSelected(null);
    } else {
      const tile1 = tiles[selected];
      const tile2 = tiles[index];

      if (tile1.type === tile2.type && MERGE_RULES[tile1.type]) {
        const newType = MERGE_RULES[tile1.type];
        const newTiles = [...tiles];
        newTiles[selected] = { ...tile1, type: 'empty', lastClick: 0 };
        newTiles[index] = { ...tile2, type: newType, lastClick: 0 };
        setTiles(newTiles);
        
        const mergeBonus = 150 * TILE_TYPES[newType].level;
        setScore(s => s + mergeBonus);
        setMergeCount(m => m + 1);
        
        playMergeSound();
        showMessage(`Merged into ${TILE_TYPES[newType].name}! +${mergeBonus} pts`);
        setSelected(null);
      } else {
        playErrorSound();
        showMessage('Cannot merge these tiles!');
        setSelected(null);
      }
    }
  };

  const getAdjacentIndices = (index) => {
    const row = Math.floor(index / 7);
    const col = index % 7;
    const adjacent = [];

    if (col > 0) adjacent.push(index - 1);
    if (col < 6) adjacent.push(index + 1);
    if (row > 0) adjacent.push(index - 7);
    if (row < 6) adjacent.push(index + 7);

    return adjacent;
  };

  const startGame = () => {
    setGold(40);
    setTiles(Array(49).fill(null).map((_, i) => ({
      id: i,
      type: i === 24 ? 'grass' : 'empty',
      lastClick: 0
    })));
    setSelected(null);
    setScore(0);
    setTimeLeft(90);
    setMergeCount(0);
    setTotalIncome(0);
    setGameState('playing');
  };

  const backToMenu = () => {
    setGameState('menu');
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-6 flex items-center justify-center gap-3">
            <Sparkles className="text-yellow-400" />
            Merge & Conquer
            <Sparkles className="text-yellow-400" />
          </h1>
          
          <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-purple-500">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center gap-2">
              <Zap className="text-yellow-400" />
              How to Play
            </h2>
            <ul className="text-gray-300 space-y-2 text-left">
              <li>⏱️ You have 90 seconds to score as high as possible!</li>
              <li>💰 Click tiles to gather gold (2x income per click, 0.4s cooldown)</li>
              <li>🌱 Click empty tiles adjacent to your territory to expand (costs 15 gold)</li>
              <li>✨ Click two tiles of the same type to merge them into a higher tier</li>
              <li>📈 Higher tier tiles produce more passive income</li>
              <li>🎯 Merges give bonus points based on tier level!</li>
              <li>🏆 Build castles for maximum points and income!</li>
            </ul>
          </div>

          <button
            onClick={startGame}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-12 py-4 rounded-lg text-2xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-110 shadow-lg"
          >
            START GAME
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    const feedback = getPerformanceFeedback(score, mergeCount, tiles);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl font-bold text-red-400 mb-6">TIME'S UP!</h1>
          
          <div className="bg-slate-800 rounded-lg p-8 mb-6 border border-purple-500">
            <div className="mb-6">
              <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
              <div className={`text-5xl font-bold mb-2 ${feedback.color}`}>
                {feedback.emoji} {feedback.rank}
              </div>
              <div className="text-xl text-gray-300 mb-6">{feedback.message}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-yellow-400 text-4xl font-bold">{score}</div>
                <div className="text-gray-400">Final Score</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-purple-400 text-4xl font-bold">{mergeCount}</div>
                <div className="text-gray-400">Total Merges</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-green-400 text-4xl font-bold">{Math.floor(gold)}</div>
                <div className="text-gray-400">Gold Earned</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-cyan-400 text-4xl font-bold">{tiles.filter(t => t.type === 'castle').length}</div>
                <div className="text-gray-400">Castles Built</div>
              </div>
            </div>

            <div className="text-sm text-gray-400 space-y-1">
              <p>🏆 Highest Tier: {tiles.filter(t => t.type === 'castle').length > 0 ? 'Castle' : tiles.filter(t => t.type === 'city').length > 0 ? 'City' : tiles.filter(t => t.type === 'village').length > 0 ? 'Village' : tiles.filter(t => t.type === 'farm').length > 0 ? 'Farm' : tiles.filter(t => t.type === 'forest').length > 0 ? 'Forest' : 'Grass'}</p>
              <p>📊 Territory Size: {tiles.filter(t => t.type !== 'empty').length} tiles</p>
              <p>💎 Final Income Rate: +{totalIncome}/s</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-lg text-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105"
            >
              PLAY AGAIN
            </button>
            <button
              onClick={backToMenu}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg text-xl font-bold hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Home className="w-5 h-5" />
              MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  const timeColor = timeLeft <= 10 ? 'text-red-400 animate-pulse' : timeLeft <= 30 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800 rounded-lg p-6 mb-6 shadow-2xl border border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center gap-2">
              <Sparkles className="text-yellow-400" />
              Merge & Conquer
            </h1>
            <button
              onClick={backToMenu}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-slate-700 rounded p-3">
              <div className={`text-3xl font-bold flex items-center justify-center gap-1 ${timeColor}`}>
                <Timer className="w-6 h-6" />
                {timeLeft}s
              </div>
              <div className="text-gray-400 text-sm">Time Left</div>
            </div>
            <div className="bg-slate-700 rounded p-3">
              <div className="text-yellow-400 text-2xl font-bold">{Math.floor(gold)}</div>
              <div className="text-gray-400 text-sm">Gold</div>
            </div>
            <div className="bg-slate-700 rounded p-3">
              <div className="text-green-400 text-2xl font-bold">+{totalIncome}/s</div>
              <div className="text-gray-400 text-sm">Income</div>
            </div>
            <div className="bg-slate-700 rounded p-3">
              <div className="text-purple-400 text-2xl font-bold">{score}</div>
              <div className="text-gray-400 text-sm">Score</div>
            </div>
          </div>
        </div>

        <div className="h-10 mb-4">
          {message && (
            <div className="bg-purple-600 text-white text-center py-2 rounded shadow-lg animate-pulse">
              {message}
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-lg p-6 shadow-2xl border border-purple-500">
          <div className="grid grid-cols-7 gap-2">
            {tiles.map((tile, index) => {
              const tileType = TILE_TYPES[tile.type];
              const isSelected = selected === index;
              
              return (
                <button
                  key={index}
                  onClick={() => handleTileClick(index)}
                  className={`aspect-square rounded-lg transition-all duration-200 ${tileType.color} 
                    ${isSelected ? 'ring-4 ring-yellow-400 scale-105' : 'hover:scale-105'}
                    ${tile.type !== 'empty' ? 'shadow-lg hover:shadow-xl' : 'opacity-50'}
                    flex items-center justify-center font-bold text-white relative overflow-hidden`}
                >
                  {tile.type === 'castle' && <Crown className="w-4 h-4" />}
                  {tile.type !== 'empty' && (
                    <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-xs px-1 rounded-tl">
                      {tileType.level}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}