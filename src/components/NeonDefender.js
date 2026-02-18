import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { recordPlayedGame } from '../utils/userProgress';

// Icon components (or import from lucide-react if available)
const Zap = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const Heart = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const Award = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

export default function NeonDefenderGame() {
  const navigate = useNavigate();
  const Home = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [gameSpeed, setGameSpeed] = useState(1);
  const recordedRef = useRef(false);

  const gameRef = useRef({
    player: { x: 400, y: 300, radius: 15, speed: 6 },
    bullets: [],
    enemies: [],
    particles: [],
    lastShot: 0,
    mouseX: 400,
    mouseY: 300,
    keys: {},
    spawnTimer: 0
  });

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const game = gameRef.current;

    let animationId;

    const shootSound = () => {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 800;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    };

    const hitSound = () => {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 200;
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    };

    const spawnEnemy = () => {
      const side = Math.floor(Math.random() * 4);
      let x, y;
      
      if (side === 0) { x = Math.random() * 800; y = -20; }
      else if (side === 1) { x = 820; y = Math.random() * 600; }
      else if (side === 2) { x = Math.random() * 800; y = 620; }
      else { x = -20; y = Math.random() * 600; }

      const enemy = {
        x, y,
        radius: 15,
        speed: 2 * gameSpeed,
        color: '#ff3366'
      };
      
      game.enemies.push(enemy);
    };

    const createParticles = (x, y, color, count = 15) => {
      for (let i = 0; i < count; i++) {
        game.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 1,
          color
        });
      }
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      game.mouseX = e.clientX - rect.left;
      game.mouseY = e.clientY - rect.top;
    };

    const handleMouseDown = () => {
      const now = Date.now();
      
      if (now - game.lastShot > 200) {
        const angle = Math.atan2(game.mouseY - game.player.y, game.mouseX - game.player.x);
        game.bullets.push({
          x: game.player.x,
          y: game.player.y,
          vx: Math.cos(angle) * 10,
          vy: Math.sin(angle) * 10,
          radius: 5
        });
        game.lastShot = now;
        shootSound();
      }
    };

    const handleKeyDown = (e) => {
      game.keys[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e) => {
      game.keys[e.key.toLowerCase()] = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, 800, 600);

      // Move player
      if (game.keys['w'] || game.keys['arrowup']) game.player.y -= game.player.speed;
      if (game.keys['s'] || game.keys['arrowdown']) game.player.y += game.player.speed;
      if (game.keys['a'] || game.keys['arrowleft']) game.player.x -= game.player.speed;
      if (game.keys['d'] || game.keys['arrowright']) game.player.x += game.player.speed;

      game.player.x = Math.max(15, Math.min(785, game.player.x));
      game.player.y = Math.max(15, Math.min(585, game.player.y));

      // Draw player
      ctx.beginPath();
      ctx.arc(game.player.x, game.player.y, game.player.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#00ff88';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw crosshair
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(game.mouseX - 10, game.mouseY);
      ctx.lineTo(game.mouseX + 10, game.mouseY);
      ctx.moveTo(game.mouseX, game.mouseY - 10);
      ctx.lineTo(game.mouseX, game.mouseY + 10);
      ctx.stroke();

      // Update and draw bullets
      game.bullets = game.bullets.filter(b => {
        b.x += b.vx;
        b.y += b.vy;
        
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffff';
        ctx.fill();
        
        return b.x > 0 && b.x < 800 && b.y > 0 && b.y < 600;
      });

      // Update and draw enemies
      game.enemies = game.enemies.filter(e => {
        const dx = game.player.x - e.x;
        const dy = game.player.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        e.x += (dx / dist) * e.speed;
        e.y += (dy / dist) * e.speed;

        // Check collision with player
        if (dist < game.player.radius + e.radius) {
          setHealth(h => {
            const newHealth = h - 1;
            if (newHealth <= 0) {
              setGameState('gameover');
            }
            return newHealth;
          });
          createParticles(e.x, e.y, e.color, 15);
          return false;
        }

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        return true;
      });

      // Check bullet-enemy collisions
      game.bullets.forEach((b, bi) => {
        game.enemies.forEach((e, ei) => {
          const dx = b.x - e.x;
          const dy = b.y - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < b.radius + e.radius) {
            game.bullets.splice(bi, 1);
            setScore(s => s + 10);
            createParticles(e.x, e.y, e.color, 20);
            game.enemies.splice(ei, 1);
            hitSound();
          }
        });
      });

      // Update particles
      game.particles = game.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1;
        
        return p.life > 0;
      });

      // Spawn enemies
      game.spawnTimer++;
      const spawnRate = Math.max(30, 100 - score / 10);
      if (game.spawnTimer > spawnRate / gameSpeed) {
        spawnEnemy();
        game.spawnTimer = 0;
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, gameSpeed, score]);

  const startGame = () => {
    gameRef.current = {
      player: { x: 400, y: 300, radius: 15, speed: 6 },
      bullets: [],
      enemies: [],
      particles: [],
      lastShot: 0,
      mouseX: 400,
      mouseY: 300,
      keys: {},
      spawnTimer: 0
    };
    setScore(0);
    setHealth(3);
    setGameState('playing');
    recordedRef.current = false;
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <button
          onClick={() => navigate('/')}
          className="fixed top-4 left-4 bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 z-50"
        > 
          <Home className="w-5 h-5" />
              Home
        </button>
        <div className="text-center">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-8 animate-pulse">
            NEON DEFENDER
          </h1>
          <div className="mb-8 text-cyan-300 text-lg space-y-3">
            <p className="text-2xl font-bold">🎮 Simple Rules:</p>
            <p>🎯 Click to shoot enemies</p>
            <p>⌨️ WASD or Arrow Keys to move</p>
            <p>💀 Don't let enemies touch you!</p>
            <p>🏆 Survive as long as you can</p>
          </div>
          
          <div className="mb-8">
            <label className="text-cyan-300 text-xl block mb-3">Game Speed:</label>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={gameSpeed}
              onChange={(e) => setGameSpeed(parseFloat(e.target.value))}
              className="w-64 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-yellow-400 text-2xl mt-2 font-bold">{gameSpeed}x</div>
          </div>

          {highScore > 0 && (
            <div className="text-yellow-400 text-2xl mb-4">
              High Score: {highScore}
            </div>
          )}
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-12 py-4 rounded-lg text-2xl font-bold hover:from-cyan-600 hover:to-purple-600 transition-all transform hover:scale-110"
          >
            START GAME
          </button>
        </div>
      </div>
    );
  }

  // Record game progress when game ends
  useEffect(() => {
    if (gameState === 'gameover' && !recordedRef.current) {
      recordedRef.current = true;
      recordPlayedGame('neon-defender', score, { 
        difficulty: 'beginner', 
        accuracy: 0,
        perfect: false
      });
    }
    if (gameState === 'menu') {
      recordedRef.current = false;
    }
  }, [gameState, score]);

  if (gameState === 'gameover') {
    if (score > highScore) {
      setHighScore(score);
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-400 mb-8">GAME OVER</h1>
          <div className="text-4xl text-white mb-8">Score: {score}</div>
          {score > highScore && (
            <div className="text-3xl text-green-400 mb-4 animate-pulse">NEW HIGH SCORE!</div>
          )}
          <button
            onClick={() => setGameState('menu')}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-12 py-4 rounded-lg text-2xl font-bold hover:from-cyan-600 hover:to-purple-600 transition-all transform hover:scale-110"
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 p-4 rounded-lg mb-4 flex gap-8 text-white">
        <div className="flex items-center gap-2">
          <Award className="text-yellow-400" />
          <span className="text-xl font-bold">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="text-cyan-400" />
          <span className="text-xl font-bold">Speed: {gameSpeed}x</span>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="text-red-400" />
          <span className="text-xl font-bold">{health}</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border-4 border-cyan-400 rounded-lg shadow-2xl shadow-cyan-500/50"
      />
    </div>
  );
}