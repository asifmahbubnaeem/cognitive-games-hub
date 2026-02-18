import React from 'react';
import GameHeader from './GameHeader';
import GameStats from './GameStats';
import GameOverModal from './GameOverModal';

/**
 * Standard layout wrapper for game screens.
 * Use for consistent header, stats bar, and game-over modal across games.
 *
 * @param {string} gameTitle - Title shown in header
 * @param {React.ReactNode} children - Main game content
 * @param {object} stats - { score, timeLeft, lives } for GameStats (optional)
 * @param {object} gameOver - { show, score, isNewHighScore, stats[], achievementMessage, onPlayAgain, onHome, onShare }
 * @param {function} onSettings - Optional settings callback
 */
export default function GameLayout({
  gameTitle,
  children,
  stats = null,
  gameOver = null,
  onSettings = null,
}) {
  const showGameOver = gameOver && gameOver.show;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900 pt-14 pb-6 px-4">
      <div className="max-w-4xl mx-auto">
        <GameHeader gameTitle={gameTitle} onSettings={onSettings} />
        {stats && (
          <div className="mb-4">
            <GameStats {...stats} />
          </div>
        )}
        <div className="min-h-[320px] flex flex-col">
          {children}
        </div>
      </div>

      {showGameOver && (
        <GameOverModal
          score={gameOver.score}
          isNewHighScore={gameOver.isNewHighScore}
          stats={gameOver.stats}
          achievementMessage={gameOver.achievementMessage}
          onPlayAgain={gameOver.onPlayAgain}
          onHome={gameOver.onHome}
          onShare={gameOver.onShare}
        />
      )}
    </div>
  );
}

export { GameHeader, GameStats, GameOverModal };
