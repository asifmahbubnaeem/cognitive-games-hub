import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import NumberChain from './components/NumberChain';
import SpeedTruth from './components/SpeedTruth';
import FocusFlow from './components/FocusFlow';
import SpeedMatch from './components/SpeedMatch';
import ColorMatchGame from './components/ColorMatch';
import QuickDecisionGame from './components/QuickDecision';
import WaterBubbleGame from './components/WaterBubble';
import LogicLatticeGame from './components/LogicLattice';
import GlyphWalkerGame from './components/GlyphWalker';
import GateKeeperGame from './components/GateKeeper';
import SymbolSeekerGame from './components/SymbolSeeker';
import MindFoldGame from './components/MindFold';
import NeonDefenderGame from './components/NeonDefender';
import MergeConquerGame from './components/MergeConquer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/number-chain" element={<NumberChain />} />
        <Route path="/focus-flow" element={<FocusFlow />} />
        <Route path="/speed-truth" element={<SpeedTruth />} />
        <Route path="/speed-match" element={<SpeedMatch />} />
        <Route path="/color-match" element={<ColorMatchGame />} />
        <Route path="/quick-decision" element={<QuickDecisionGame />} />
        <Route path="/water-bubble" element={<WaterBubbleGame />} />
        <Route path="/logic-lattice" element={<LogicLatticeGame />} />
        <Route path="/glyph-walker" element={<GlyphWalkerGame />} />
        <Route path="/gate-keeper" element={<GateKeeperGame />} />
        <Route path="/symbol-seeker" element={<SymbolSeekerGame />} />
        <Route path="/mind-fold" element={<MindFoldGame />} />
        <Route path="/neon-defender" element={<NeonDefenderGame />} />
        <Route path="/merge-conquer" element={<MergeConquerGame />} />
      </Routes>
    </Router>
  );
}

export default App;