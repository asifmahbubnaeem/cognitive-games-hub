import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Zap, Target, Link as LinkIcon, Crosshair, Grid3x3 } from 'lucide-react';

const games = [
  {
    id: 'number-chain',
    title: 'Number Chain',
    subtitle: 'Mental Math Trainer',
    description: 'Calculate chains of operations in your head. Master sequential processing and working memory.',
    icon: LinkIcon,
    color: 'from-cyan-500 to-purple-500',
    skills: ['Mental Math', 'Working Memory', 'Sequential Processing'],
    path: '/number-chain'
  },
  {
    id: 'speed-truth',
    title: 'Speed Truth',
    subtitle: 'Processing Speed Trainer',
    description: 'Make split-second decisions under time pressure. Different colors demand different speeds.',
    icon: Zap,
    color: 'from-yellow-500 to-red-500',
    skills: ['Processing Speed', 'Decision Making', 'Impulse Control'],
    path: '/speed-truth'
  },
  {
    id: 'focus-flow',
    title: 'Focus Flow',
    subtitle: 'Attention Trainer',
    description: 'Match numbers with color letter counts. Train selective attention and impulse control.',
    icon: Target,
    color: 'from-green-500 to-cyan-500',
    skills: ['Selective Attention', 'Working Memory', 'Impulse Control'],
    path: '/focus-flow'
  },
  {
    id: 'speed-match',
    title: 'Speed Match',
    subtitle: 'Processing Speed Trainer',
    description: 'Make split-second decisions under time pressure. Different shapes should be checked if matched/mismatched.',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    skills: ['Working Memory', 'Pattern Recognition', 'Focus'],
    path: '/speed-match'
  },
  {
    id: 'color-match',
    title: 'Color Match',
    subtitle: 'Reaction & Processing Speed',
    description: 'Fast-paced game. Improve hand-eye coordination and reaction time.',
    icon: Crosshair,
    color: 'from-blue-500 to-purple-500',
    skills: ['Reaction Time', 'Pattern Recognition', 'Focus'],
    path: '/color-match'
  },
  {
    id: 'quick-decision',
    title: 'Quick Decision',
    subtitle: 'Strategy & Planning',
    description: 'Merge tiles strategically. Build planning skills and strategic thinking.',
    icon: Grid3x3,
    color: 'from-orange-500 to-red-500',
    skills: ['Strategic Planning', 'Resource Management', 'Pattern Recognition'],
    path: '/quick-decision'
  },
  {
    id: 'water-bubble',
    title: 'Water Bubble',
    subtitle: 'Reaction & Math calculation',
    description: 'Quick Math calculation. Improve mental calculation reaction time.',
    icon: Grid3x3,
    color: 'from-blue-500 to-purple-500',
    skills: ['Mental calculation', 'logical thinking'],
    path: '/water-bubble'
  },
  {
    id: 'logic-lattice',
    title: 'Sherlock, learn theory of deduction',
    subtitle: 'Attention & Logical reasoning Trainer',
    description: 'Catch the Culprit. Solve the problem using logical reasoning & attention.',
    icon: Target,
    color: 'from-green-500 to-cyan-500',
    skills: ['Selective Attention', 'Working Memory', 'Logical reasoning'],
    path: '/logic-lattice'
  },
  {
    id: 'glyph-walker',
    title: 'Glyph Walker',
    subtitle: 'Spatial Imagination Trainer',
    description: 'Make split-second decisions under time pressure. Different shapes should be checked if matched/mismatched.',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    skills: ['Working Memory', 'Spatial analysis', 'Critcal Thinking', 'Puzzle solve'],
    path: '/glyph-walker'
  },
  {
    id: 'gate-keeper',
    title: 'Gate Keeper',
    subtitle: 'Multi tasking Trainer',
    description: 'Enhance multi tasking capability, force to think process multiple tasks',
    icon: Brain,
    color: 'from-orange-500 to-red-500',
    skills: ['Working Memory', 'Pattern Recognition', 'Focus'],
    path: '/gate-keeper'
  },
  {
    id: 'symbol-seeker',
    title: 'Symbol Seeker',
    subtitle: 'Intiution Building Game',
    description: 'Inductive Reasoning (Pattern Recognition).The Concept: A "trial and error" puzzle. Each level, the game secretly decides on a "rule" (e.g., "Must be a Circle" or "Must be Blue AND Square"). The screen fills with dozens of random, colorful shapes.',
    icon: Grid3x3,
    color: 'from-green-500 to-blue-500',
    skills: ['Strategic Planning', 'Resource Management', 'Pattern Recognition'],
    path: '/symbol-seeker'
  },
  {
    id: 'mind-fold',
    title: 'Mind Fold',
    subtitle: 'Spatial reasoning puzzle',
    description: 'A 3D puzzle game based on those paper-folding IQ tests. You are presented with a 2D "net" (an unfolded shape) and a 3D "target" shape. Your goal is to mentally (or physically) fold the net to match the target',
    icon: Brain,
    color: 'from-blue-500 to-purple-500',
    skills: ['Working Memory', 'Imagination', 'Intiution'],
    path: '/mind-fold'
  },
  { 
    id: 'neon-defender',
    title: 'Neon Defender',
    subtitle: 'Reaction & Coordination',
    description: 'Fast-paced shooting game. Improve hand-eye coordination and reaction time.',
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
    skills: ['Reaction Time', 'Hand-Eye Coordination', 'Spatial Awareness'],
    path: '/neon-defender'
  },
  {
    id: 'merge-conquer',
    title: 'Merge & Conquer',
    subtitle: 'Strategy & Planning',
    description: 'Merge tiles strategically. Build planning skills and strategic thinking.',
    icon: Grid3x3,
    color: 'from-orange-500 to-red-500',
    skills: ['Strategic Planning', 'Resource Management', 'Pattern Recognition'],
    path: '/merge-conquer'
  }
  // {
  //   id: 'pattern-break',
  //   title: 'Pattern Break',
  //   subtitle: 'Memory Trainer',
  //   description: 'Memorize patterns and catch breaks. Enhance working memory and pattern recognition.',
  //   icon: Brain,
  //   color: 'from-purple-500 to-pink-500',
  //   skills: ['Working Memory', 'Pattern Recognition', 'Focus'],
  //   path: '/pattern-break'
  // },
  // {
  //   id: 'neon-defender',
  //   title: 'Neon Defender',
  //   subtitle: 'Reaction & Coordination',
  //   description: 'Fast-paced shooting game. Improve hand-eye coordination and reaction time.',
  //   icon: Crosshair,
  //   color: 'from-blue-500 to-purple-500',
  //   skills: ['Reaction Time', 'Hand-Eye Coordination', 'Spatial Awareness'],
  //   path: '/neon-defender'
  // },
  // {
  //   id: 'merge-conquer',
  //   title: 'Merge & Conquer',
  //   subtitle: 'Strategy & Planning',
  //   description: 'Merge tiles strategically. Build planning skills and strategic thinking.',
  //   icon: Grid3x3,
  //   color: 'from-orange-500 to-red-500',
  //   skills: ['Strategic Planning', 'Resource Management', 'Pattern Recognition'],
  //   path: '/merge-conquer'
  // }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Brain className="w-20 h-20 text-cyan-400 animate-pulse" />
            <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              Cognitive Games Hub
            </h1>
          </div>
          <p className="text-2xl text-gray-300 mb-4">
            Train Your Brain with Science-Backed Games
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            A collection of engaging games designed to improve cognitive abilities including 
            memory, attention, processing speed, and strategic thinking.
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <Link
              key={game.id}
              to={game.path}
              className="group"
            >
              <div className={`bg-slate-800 rounded-2xl p-8 border-4 border-transparent hover:border-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl h-full flex flex-col`}>
                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform`}>
                  <game.icon className="w-12 h-12 text-white" />
                </div>

                {/* Title */}
                <h2 className={`text-3xl font-bold mb-2 bg-gradient-to-r ${game.color} bg-clip-text text-transparent`}>
                  {game.title}
                </h2>
                <p className="text-xl text-gray-400 mb-4">{game.subtitle}</p>

                {/* Description */}
                <p className="text-gray-300 mb-6 flex-grow">
                  {game.description}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {game.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-700 text-cyan-400 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Play Button */}
                <button className={`mt-6 w-full bg-gradient-to-r ${game.color} text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-shadow`}>
                  PLAY NOW
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400">
          <p className="text-lg">
            🧠 Train daily for 10-15 minutes to see cognitive improvements
          </p>
          <p className="text-sm mt-2">
            All games are designed based on cognitive science research
          </p>
        </div>
      </div>
    </div>
  );
}