import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { recordPlayedGame } from '../utils/userProgress';

// --- Styles Component ---
// We place the non-Tailwind styles here.
const GameStyles = () => (
    <style>{`
        body {
            font-family: 'Orbitron', sans-serif;
            background-color: #0c0a1e; /* Deep dark purple/blue */
            color: #0ff; /* Neon Cyan */
            overflow: hidden;
            touch-action: none; /* Disable panning/zooming on mobile */
        }

        /* Neon Glow Effects */
        .neon-glow-cyan {
            text-shadow: 0 0 3px #0ff, 0 0 5px #0ff, 0 0 8px #0ff;
        }
        .neon-glow-pink {
            text-shadow: 0 0 3px #f0f, 0 0 5px #f0f, 0 0 8px #f0f;
        }
        .neon-border-cyan {
            border-color: #0ff;
            box-shadow: 0 0 5px #0ff, 0 0 10px #0ff inset;
        }
        .neon-border-pink {
            border-color: #f0f;
            box-shadow: 0 0 5px #f0f, 0 0 10px #f0f inset;
        }

        /* Suspect Card Styling */
        .suspect-card {
            background-color: rgba(17, 24, 39, 0.7); /* Dark blue/gray */
            border: 2px solid #0ff;
            border-radius: 8px;
            padding: 1rem;
            transition: all 0.3s ease;
            cursor: pointer;
            backdrop-filter: blur(5px);
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
        }
        .suspect-card:hover {
            transform: scale(1.05);
            border-color: #f0f; /* Pink on hover */
            box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
        }
        
        /* Eliminated State */
        .suspect-card[data-eliminated="true"] {
            opacity: 0.2;
            filter: grayscale(100%);
            transform: scale(0.95);
            cursor: not-allowed;
        }

        /* Accuse Mode */
        .accuse-mode .suspect-card:not([data-eliminated="true"]):hover {
            background-color: rgba(255, 0, 255, 0.3);
            border-color: #f0f;
        }

        /* Custom Scrollbar (for clues on small screens) */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #111827;
        }
        ::-webkit-scrollbar-thumb {
            background: #0ff;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #f0f;
        }
    `}</style>
);

// --- Attribute Definitions ---
const ATTRIBUTES = {
    color: [
        { name: 'Red', class: 'text-red-500' },
        { name: 'Blue', class: 'text-blue-400' },
        { name: 'Green', class: 'text-green-500' }
    ],
    hat: [
        { name: 'Hat', value: true, class: 'text-lime-400' },
        { name: 'No Hat', value: false, class: 'text-gray-500' }
    ],
    accessory: [
        { name: 'Sword', class: 'text-yellow-400' },
        { name: 'Shield', class: 'text-purple-400' },
        { name: 'Book', class: 'text-orange-400' }
    ]
};

// --- Utility Functions ---
const randomEl = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- Clue Factories (Pure Functions) ---
const clueFactories = [
    // "NOT" clue
    (guilty) => {
        const attr = 'color';
        const possibleValues = ATTRIBUTES[attr].filter(v => v.name !== guilty[attr].name);
        if (possibleValues.length === 0) return null;
        const value = randomEl(possibleValues);
        return {
            text: `The culprit's color is NOT ${value.name.toUpperCase()}.`,
            validator: (suspect) => suspect[attr].name !== value.name
        };
    },
    // "IS" clue
    (guilty) => {
        const attr = randomEl(['accessory', 'hat']);
        const value = guilty[attr];
        return {
            text: `The culprit has a ${value.name.toUpperCase()}.`,
            validator: (suspect) => suspect[attr].name === value.name
        };
    },
    // "OR" clue
    (guilty) => {
        const attr1 = 'hat';
        const attr2 = 'color';
        const val1 = guilty[attr1];
        const val2 = randomEl(ATTRIBUTES[attr2]);
        if (guilty[attr1].value === val1.value || guilty[attr2].name === val2.name) {
            return {
                text: `The culprit has ${val1.name.toUpperCase()} OR is ${val2.name.toUpperCase()}.`,
                validator: (suspect) => suspect[attr1].value === val1.value || suspect[attr2].name === val2.name
            };
        }
        return null;
    },
    // "IF-THEN" clue
    (guilty) => {
        const attr1 = 'color';
        const attr2 = 'accessory';
        const val1 = randomEl(ATTRIBUTES[attr1]);
        const val2 = randomEl(ATTRIBUTES[attr2]);
        const isClueTrueForGuilty = (guilty[attr1].name !== val1.name) || (guilty[attr2].name === val2.name);
        if (isClueTrueForGuilty) {
            return {
                text: `IF the culprit is ${val1.name.toUpperCase()}, THEN they have a ${val2.name.toUpperCase()}.`,
                validator: (suspect) => (suspect[attr1].name !== val1.name) || (suspect[attr2].name === val2.name)
            };
        }
        return null;
    }
];

// --- React Components ---

/** SVG Robot Icon Component */
const RobotSVG = ({ color }) => {
    const hexColor = color.class.includes('red') ? '#ef4444' : (color.class.includes('blue') ? '#3b82f6' : '#22c55e');
    return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-2" style={{ filter: `drop-shadow(0 0 5px ${hexColor})` }}>
            <rect x="20" y="10" width="60" height="50" rx="5" fill={hexColor} />
            <rect x="30" y="25" width="15" height="15" fill="#0ff" className="neon-glow-cyan" />
            <rect x="55" y="25" width="15" height="15" fill="#0ff" className="neon-glow-cyan" />
            <rect x="20" y="65" width="60" height="25" rx="5" fill="#555" />
            <rect x="35" y="70" width="30" height="5" fill="#f0f" className="neon-glow-pink" />
        </svg>
    );
};

/** Suspect Card Component */
const SuspectCard = ({ suspect, onClick, isGuilty, isGameOver }) => {
    const isEliminated = suspect.eliminated && !isGameOver;
    let cardClasses = "suspect-card";
    if (isGameOver && isGuilty) {
        cardClasses += " border-4 neon-border-pink scale-110";
    }

    return (
        <div
            className={cardClasses}
            data-id={suspect.id}
            data-eliminated={isEliminated}
            onClick={() => !isEliminated && onClick(suspect)}
        >
            <RobotSVG color={suspect.color} />
            <ul className="text-xs md:text-sm text-center">
                <li>Color: <span className={`${suspect.color.class} font-bold`}>{suspect.color.name}</span></li>
                <li>Hat: <span className={`${suspect.hat.class} font-bold`}>{suspect.hat.name}</span></li>
                <li>Item: <span className={`${suspect.accessory.class} font-bold`}>{suspect.accessory.name}</span></li>
            </ul>
        </div>
    );
};

/** Modal Component */
const GameModal = ({ modalState, onStart }) => {
    if (!modalState.isOpen) return null;

    const { title, message, buttonText, isWin } = modalState;

    const titleClass = `text-4xl font-bold mb-4 ${isWin ? 'neon-glow-cyan text-cyan-400' : 'neon-glow-pink text-pink-500'}`;
    const buttonClass = `px-8 py-4 text-2xl font-bold rounded-lg transition-all duration-300 hover:scale-105 ${isWin ? 'bg-cyan-600 text-black hover:bg-cyan-400' : 'bg-pink-600 text-white hover:bg-pink-700 neon-glow-pink'}`;

    return (
        <div className="absolute inset-0 z-20 bg-black bg-opacity-90 flex items-center justify-center p-4">
            <div className="ui-panel p-8 text-center max-w-md w-full bg-gray-900 border-4 neon-border-pink rounded-xl shadow-2xl shadow-pink-500/50">
                <h2 className={titleClass}>{title}</h2>
                <p className="text-xl text-cyan-300 mb-8">{message}</p>
                <button className={buttonClass} onClick={onStart}>
                    {buttonText}
                </button>
            </div>
        </div>
    );
};


/** Main App Component */
export default function LogicLatticeGame() {
    const [suspects, setSuspects] = useState([]);
    const [guiltySuspect, setGuiltySuspect] = useState(null);
    const [generatedClues, setGeneratedClues] = useState([]);
    const [timeLeft, setTimeLeft] = useState(60);
    const [caseId, setCaseId] = useState(0);
    const [isAccusing, setIsAccusing] = useState(false);
    const [isGameOver, setIsGameOver] = useState(true);
    const [score, setScore] = useState(0);
    const [casesSolved, setCasesSolved] = useState(0);
    const [casesFailed, setCasesFailed] = useState(0);
    const recordedRef = useRef(false);
    const [modalState, setModalState] = useState({
        isOpen: true,
        title: "Welcome, Detective",
        message: "A new case just came in. Analyze the 9 suspects, use the clues to deduce the culprit, and make your accusation before time runs out.",
        buttonText: "START CASE",
        isWin: false
    });

    const sfx = useRef(null);
    const timerInterval = useRef(null);

    // --- Audio Initialization ---
    const initAudio = useCallback(() => {
        if (!sfx.current && Tone.context.state !== 'running') {
            Tone.start();
            sfx.current = {
                eliminate: new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.05, sustain: 0 } }).toDestination(),
                accuse: new Tone.FMSynth({ harmonicity: 3, modulationIndex: 10, envelope: { attack: 0.01, decay: 0.1 }, modulationEnvelope: { attack: 0.01, decay: 0.1 } }).toDestination(),
                clue: new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 } }).toDestination(),
                win: new Tone.PolySynth(Tone.Synth).toDestination(),
                lose: new Tone.FMSynth().toDestination()
            };
            sfx.current.eliminate.volume.value = -20;
            sfx.current.accuse.volume.value = -15;
            sfx.current.clue.volume.value = -15;
        }
    }, []);

    // --- Game Logic ---
    const generateSuspectsAndClues = useCallback(() => {
        // 1. Generate Suspects
        let newSuspects = [];
        let combinations = new Set();
        for (let i = 0; i < 9; i++) {
            let color, hat, accessory, key;
            do {
                color = randomEl(ATTRIBUTES.color);
                hat = randomEl(ATTRIBUTES.hat);
                accessory = randomEl(ATTRIBUTES.accessory);
                key = `${color.name}-${hat.name}-${accessory.name}`;
            } while (combinations.has(key));
            
            combinations.add(key);
            newSuspects.push({
                id: i, color, hat, accessory,
                isGuilty: false, eliminated: false
            });
        }
        
        const guiltyIndex = Math.floor(Math.random() * 9);
        newSuspects[guiltyIndex].isGuilty = true;
        const newGuiltySuspect = newSuspects[guiltyIndex];
        
        // 2. Generate Clues
        let newClues = [];
        let remainingSuspects = [...newSuspects];
        let factoryPool = [...clueFactories, ...clueFactories];

        while ((newClues.length < 4 && remainingSuspects.length > 1) && factoryPool.length > 0) {
            const factory = factoryPool.splice(Math.floor(Math.random() * factoryPool.length), 1)[0];
            const clue = factory(newGuiltySuspect);

            if (clue) {
                const afterClue = remainingSuspects.filter(clue.validator);
                const eliminatedCount = remainingSuspects.length - afterClue.length;
                const guiltyRemains = afterClue.includes(newGuiltySuspect);

                if (guiltyRemains && eliminatedCount > 0) {
                    newClues.push(clue);
                    remainingSuspects = afterClue;
                    setTimeout(() => sfx.current?.clue.triggerAttackRelease("C5", "8n"), newClues.length * 200);
                }
            }
        }
        
        if (remainingSuspects.length > 1) {
            const finalAttr = randomEl(['color', 'accessory', 'hat']);
            const finalVal = newGuiltySuspect[finalAttr];
            newClues.push({
                text: `The culprit's ${finalAttr} is ${finalVal.name.toUpperCase()}.`,
                validator: (s) => s[finalAttr].name === finalVal.name
            });
        }
        
        setSuspects(newSuspects);
        setGuiltySuspect(newGuiltySuspect);
        setGeneratedClues(newClues);
    }, []);

    const startGame = useCallback(() => {
        initAudio();
        
        setIsAccusing(false);
        setIsGameOver(false);
        setCaseId(id => id + 1);
        generateSuspectsAndClues();
        setTimeLeft(60);
        setModalState(s => ({ ...s, isOpen: false }));
        
        // Reset tracking on new game session
        if (caseId === 0) {
            setScore(0);
            setCasesSolved(0);
            setCasesFailed(0);
            recordedRef.current = false;
        }
    }, [initAudio, generateSuspectsAndClues, caseId]);
    
    const endGame = useCallback((accusedSuspect) => {
        clearInterval(timerInterval.current);
        setIsGameOver(true);
        setIsAccusing(false);
        
        if (!accusedSuspect) {
            setCasesFailed(prev => prev + 1);
            sfx.current?.lose.triggerAttackRelease("A2", "1.0");
            setModalState({
                isOpen: true, title: "CASE FAILED",
                message: `Time's up! The culprit was Suspect #${guiltySuspect.id+1}.`,
                buttonText: "Try New Case", isWin: false
            });
        } else if (accusedSuspect.isGuilty) {
            setCasesSolved(prev => prev + 1);
            setScore(prev => prev + 100 + timeLeft);
            sfx.current?.win.triggerAttackRelease(["C4", "E4", "G4", "C5"], "0.5s");
            setModalState({
                isOpen: true, title: "CASE CLOSED",
                message: `Correct! You identified the culprit (Suspect #${guiltySuspect.id+1}) with ${timeLeft}s left.`,
                buttonText: "Next Case", isWin: true
            });
        } else {
            setCasesFailed(prev => prev + 1);
            sfx.current?.lose.triggerAttackRelease("A2", "1.0");
            setModalState({
                isOpen: true, title: "CASE FAILED",
                message: `Incorrect. You accused Suspect #${accusedSuspect.id+1}. The real culprit was #${guiltySuspect.id}.`,
                buttonText: "Try New Case", isWin: false
            });
        }
    }, [guiltySuspect, timeLeft]);


    // --- Timer Effect ---
    useEffect(() => {
        if (isGameOver) {
            clearInterval(timerInterval.current);
        } else {
            timerInterval.current = setInterval(() => {
                setTimeLeft(t => {
                    if (t <= 1) {
                        clearInterval(timerInterval.current);
                        endGame(null); // Time's up
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerInterval.current);
    }, [isGameOver, endGame]);

    // Record game progress when session ends (after multiple cases)
    useEffect(() => {
        // Record when user closes modal after playing multiple cases
        // We'll record when they've played at least one case and are going back to menu
        if (isGameOver && caseId > 0 && !recordedRef.current && casesSolved + casesFailed > 0) {
            // Only record if they've completed at least 3 cases or failed 3 cases
            if (casesSolved + casesFailed >= 3) {
                recordedRef.current = true;
                const totalCases = casesSolved + casesFailed;
                const accuracy = totalCases > 0 ? Math.round((casesSolved / totalCases) * 100) : 0;
                const perfect = casesFailed === 0 && casesSolved > 0;
                recordPlayedGame('logic-lattice', score, { 
                    difficulty: 'beginner', 
                    accuracy,
                    perfect
                });
            }
        }
    }, [isGameOver, caseId, casesSolved, casesFailed, score]);
    
    // --- Event Handlers ---
    
    const onSuspectClick = useCallback((suspect) => {
        if (isGameOver) return;
        
        if (isAccusing) {
            sfx.current?.accuse.triggerAttackRelease("A3", "0.2");
            endGame(suspect);
        } else {
            setSuspects(prevSuspects =>
                prevSuspects.map(s =>
                    s.id === suspect.id ? { ...s, eliminated: !s.eliminated } : s
                )
            );
            sfx.current?.eliminate.triggerAttackRelease(0.05);
        }
    }, [isAccusing, isGameOver, endGame]);

    const onAccuseButton = () => {
        if (isGameOver) return;
        setIsAccusing(prev => !prev);
    };

    // --- Render ---
    const timerClass = `text-xl md:text-2xl text-pink-500 neon-glow-pink ${timeLeft <= 10 ? 'text-red-500' : ''}`;
    const accuseButtonClass = `w-full mt-4 p-4 text-2xl font-bold rounded-lg shadow-lg transition-all duration-300 ${
        isAccusing
        ? 'bg-pink-600 text-white neon-glow-pink'
        : 'bg-cyan-600 text-black hover:bg-cyan-400'
    }`;
    
    return (
        <>
            <GameStyles />
            <div className={`w-full h-screen p-4 md:p-8 flex items-center justify-center ${isAccusing ? 'accuse-mode' : ''}`}>
                <div id="game-container" className="w-full max-w-7xl h-full flex flex-col items-center">
                    
                    <header className="w-full flex-shrink-0 mb-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-center neon-glow-cyan mb-2">LOGIC LATTICE</h1>
                        <div className="flex justify-between items-center max-w-lg mx-auto p-2 bg-gray-900 border-2 neon-border-cyan rounded-lg">
                            <div className="text-xl md:text-2xl">Case File: #{String(caseId).padStart(3, '0')}</div>
                            <div className={timerClass}>Time: <span id="timer">{timeLeft}</span>s</div>
                        </div>
                    </header>

                    <main className="w-full flex-grow flex flex-col md:flex-row gap-4 overflow-hidden">
                        <section id="clue-panel" className="w-full md:w-1/3 h-1/3 md:h-full flex-shrink-0 bg-gray-900 border-2 neon-border-cyan rounded-lg p-4 overflow-y-auto">
                            <h2 className="text-2xl text-pink-500 neon-glow-pink border-b-2 border-pink-500 pb-2 mb-4">CLUES</h2>
                            <ul id="clue-list" className="space-y-3">
                                {generatedClues.map((clue, index) => (
                                    <li key={index} className="text-sm md:text-lg neon-glow-cyan p-2 bg-black/30 rounded">
                                        {clue.text}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section id="suspect-grid-container" className="w-full md:w-2/3 h-2/3 md:h-full flex flex-col">
                            <div id="suspect-grid" className="flex-grow w-full grid grid-cols-3 gap-2 md:gap-4 overflow-y-auto p-1">
                                {suspects.map(suspect => (
                                    <SuspectCard
                                        key={suspect.id}
                                        suspect={suspect}
                                        onClick={onSuspectClick}
                                        isGuilty={suspect.isGuilty}
                                        isGameOver={isGameOver}
                                    />
                                ))}
                            </div>
                            <button id="accuse-button" className={accuseButtonClass} onClick={onAccuseButton}>
                                {isAccusing ? "SELECT SUSPECT (Click to Cancel)" : "ACCUSE"}
                            </button>
                        </section>
                    </main>
                </div>

                <GameModal modalState={modalState} onStart={startGame} />
            </div>
        </>
    );
}
