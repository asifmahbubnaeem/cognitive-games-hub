import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { recordPlayedGame } from '../utils/userProgress';

// --- Configs ---
const COLORS = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#22c55e' },
    { name: 'Yellow', hex: '#eab308' },
    { name: 'Purple', hex: '#a855f7' }
];
const SHAPES = ['Circle', 'Square', 'Triangle', 'Pentagon'];
const LIVES_START = 3;
const SHAPES_TO_FIND = 5;
const GRID_SIZE = 25;

// --- Audio Setup ---
const sfx = {
    correct: null,
    wrong: null,
    win: null,
    lose: null,
};

const audioReverb = new Tone.Freeverb(0.7).toDestination();

// --- SVG Shape Component ---
const ShapeIcon = ({ shape, color, ...props }) => {
    switch (shape) {
        case 'Circle':
            return <svg viewBox="0 0 100 100" fill={color} {...props}><circle cx="50" cy="50" r="45" /></svg>;
        case 'Square':
            return <svg viewBox="0 0 100 100" fill={color} {...props}><rect x="10" y="10" width="80" height="80" /></svg>;
        case 'Triangle':
            return <svg viewBox="0 0 100 100" fill={color} {...props}><polygon points="50,10 90,90 10,90" /></svg>;
        case 'Pentagon':
            return <svg viewBox="0 0 100 100" fill={color} {...props}><polygon points="50,10 95,40 75,90 25,90 5,40" /></svg>;
        default:
            return null;
    }
};

// --- Rule Generation ---
/**
 * Creates a "rule" object with a test function and description,
 * plus 2 decoy rule objects.
 */
const generateRuleSet = () => {
    const rules = [];
    const ruleTypes = ['simpleColor', 'simpleShape', 'colorAndShape', 'colorOrShape'];
    
    const c1 = COLORS[Math.floor(Math.random() * COLORS.length)];
    const c2 = COLORS[Math.floor(Math.random() * COLORS.length)];
    const s1 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const s2 = SHAPES[Math.floor(Math.random() * SHAPES.length)];

    // Create 3 unique rules
    while (rules.length < 3) {
        const type = ruleTypes[Math.floor(Math.random() * ruleTypes.length)];
        let newRule = {};

        switch (type) {
            case 'simpleColor':
                newRule = {
                    test: (s) => s.color === c1.name,
                    desc: `Must be ${c1.name}`
                };
                break;
            case 'simpleShape':
                newRule = {
                    test: (s) => s.shape === s1,
                    desc: `Must be a ${s1}`
                };
                break;
            case 'colorAndShape':
                newRule = {
                    test: (s) => s.color === c1.name && s.shape === s1,
                    desc: `Must be ${c1.name} AND a ${s1}`
                };
                break;
            case 'colorOrShape':
                newRule = {
                    test: (s) => s.color === c2.name || s.shape === s2,
                    desc: `Must be ${c2.name} OR a ${s2}`
                };
                break;
            default: break;
        }

        // Ensure rule is unique
        if (!rules.find(r => r.desc === newRule.desc)) {
            rules.push(newRule);
        }
    }

    // Shuffle the rules and pick one as the correct one
    const shuffled = rules.sort(() => 0.5 - Math.random());
    const correctRule = shuffled[0];
    
    return {
        correctRule,
        quizOptions: shuffled.map(r => r.desc) // Just the descriptions
    };
};

// --- Shape Generation ---
/**
 * Generates a grid of random shapes, ensuring a certain
 * percentage match the correct rule.
 */
const generateShapes = (ruleTest) => {
    const newShapes = [];
    let matchCount = 0;
    const targetMatchCount = Math.floor(GRID_SIZE * 0.4); // ~40% should match

    for (let i = 0; i < GRID_SIZE; i++) {
        const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const shapeObj = {
            id: i,
            shape: shape,
            color: color.name,
            hex: color.hex,
            isFound: false,
        };

        if (ruleTest(shapeObj)) {
            matchCount++;
        }

        newShapes.push(shapeObj);
    }
    
    // If not enough matches, force some
    if (matchCount < targetMatchCount) {
        for (let i = 0; i < GRID_SIZE && matchCount < targetMatchCount; i++) {
            if (!ruleTest(newShapes[i])) {
                // Brute force: find a combination that works
                let attempts = 0;
                while (attempts < 50) {
                    const newShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
                    const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
                    const newShapeObj = { ...newShapes[i], shape: newShape, color: newColor.name, hex: newColor.hex };
                    
                    if (ruleTest(newShapeObj)) {
                        newShapes[i] = newShapeObj;
                        matchCount++;
                        break;
                    }
                    attempts++;
                }
            }
        }
    }
    
    return newShapes.sort(() => 0.5 - Math.random()); // Shuffle grid
};


// --- Main App Component ---
export default function SymbolSeekerGame() {
    const [gameState, setGameState] = useState('loading'); // loading, playing, guessing, result
    const [shapes, setShapes] = useState([]);
    const [foundCount, setFoundCount] = useState(0);
    const [lives, setLives] = useState(LIVES_START);
    const [message, setMessage] = useState("Click the shapes that you think fit the hidden rule.");
    
    const [quizOptions, setQuizOptions] = useState([]);
    const [modalState, setModalState] = useState({ isOpen: false, title: "", message: "", buttonText: "" });
    const [score, setScore] = useState(0);
    const [levelsCompleted, setLevelsCompleted] = useState(0);
    const [totalAttempts, setTotalAttempts] = useState(0);

    const ruleSet = useRef(null);
    const recordedRef = useRef(false);
    // FIX: Changed audioInitialized from useRef to useState to ensure
    // the component re-renders when the start button is clicked.
    const [audioInitialized, setAudioInitialized] = useState(false);

    // --- Audio Init ---
    const initAudio = () => {
        // Check state variable, not ref
        if (audioInitialized) return;
        Tone.start();
        
        sfx.correct = new Tone.PluckSynth({ volume: -5 }).connect(audioReverb);
        sfx.wrong = new Tone.MetalSynth({
            frequency: 50,
            envelope: { attack: 0.001, decay: 0.1, release: 0.1 },
            harmonicity: 3,
            modulationIndex: 10,
        }).connect(audioReverb);
        sfx.win = new Tone.PolySynth(Tone.Synth).connect(audioReverb);
        sfx.lose = new Tone.PolySynth(Tone.Synth).connect(audioReverb);
        
        sfx.wrong.volume.value = -15;

        // Set state to trigger re-render
        setAudioInitialized(true);
    };
    
    // --- Game Setup ---
    const setupNewGame = useCallback(() => {
        setGameState('loading');
        
        const newRuleSet = generateRuleSet();
        ruleSet.current = newRuleSet;
        
        const newShapes = generateShapes(newRuleSet.correctRule.test);
        setShapes(newShapes);
        
        setQuizOptions(newRuleSet.quizOptions);
        setFoundCount(0);
        setLives(LIVES_START);
        setGameState('playing');
        setMessage("Find 5 correct shapes to identify the rule.");
        
        // Reset tracking on first game
        if (levelsCompleted === 0 && totalAttempts === 0) {
            setScore(0);
            recordedRef.current = false;
        }
    }, [levelsCompleted, totalAttempts]);

    // Load first game
    useEffect(() => {
        setupNewGame();
    }, [setupNewGame]);

    // --- Event Handlers ---
    const handleShapeClick = (clickedShape) => {
        // Check state variable
        if (gameState !== 'playing' || clickedShape.isFound || !audioInitialized) return;

        const { correctRule } = ruleSet.current;
        setTotalAttempts(prev => prev + 1);

        if (correctRule.test(clickedShape)) {
            // --- CORRECT CLICK ---
            sfx.correct?.triggerAttackRelease("C5", "8n");
            setFoundCount(c => c + 1);
            setShapes(prevShapes => 
                prevShapes.map(s => 
                    s.id === clickedShape.id ? { ...s, isFound: true } : s
                )
            );
            
            if (foundCount + 1 >= SHAPES_TO_FIND) {
                setGameState('guessing');
                setMessage("You found enough shapes! Now, what was the rule?");
                sfx.win?.triggerAttackRelease(["E4", "G4", "C5"], "0.5");
            }

        } else {
            // --- WRONG CLICK ---
            sfx.wrong?.triggerAttackRelease("0.1");
            setLives(l => l - 1);
            setMessage("Ouch! That shape doesn't fit the rule.");
            
            // Flash the shape red
            setShapes(prevShapes => 
                prevShapes.map(s => 
                    s.id === clickedShape.id ? { ...s, isWrong: true } : s
                )
            );
            setTimeout(() => {
                 setShapes(prevShapes => 
                    prevShapes.map(s => 
                        s.id === clickedShape.id ? { ...s, isWrong: false } : s
                    )
                );
            }, 300);

            if (lives - 1 <= 0) {
                setGameState('result');
                setMessage(`Game over! The rule was: "${correctRule.desc}"`);
                sfx.lose?.triggerAttackRelease(["C3", "G2", "C2"], "1.0");
                setModalState({
                    isOpen: true,
                    title: "Game Over!",
                    message: `You ran out of lives! The correct rule was: "${correctRule.desc}"`,
                    buttonText: "Try Again"
                });
            }
        }
    };
    
    const handleRuleGuess = (guess) => {
        if (gameState !== 'guessing') return;
        
        const { correctRule } = ruleSet.current;
        
        if (guess === correctRule.desc) {
            // --- WON ---
            setGameState('result');
            setLevelsCompleted(prev => prev + 1);
            setScore(prev => prev + 100);
            sfx.win?.triggerAttackRelease(["C4", "E4", "G4", "C5"], "0.8");
             setModalState({
                isOpen: true,
                title: "You Win!",
                message: `You got it! The rule was indeed: "${correctRule.desc}"`,
                buttonText: "Next Level"
            });
        } else {
            // --- LOST ---
            setGameState('result');
            sfx.lose?.triggerAttackRelease(["C3", "G2", "C2"], "1.0");
             setModalState({
                isOpen: true,
                title: "Not Quite!",
                message: `So close! The correct rule was: "${correctRule.desc}"`,
                buttonText: "Try Again"
            });
        }
    };
    
    const handleModalClose = () => {
        setModalState({ isOpen: false, title: "", message: "", buttonText: "" });
        
        // Record progress if game session ended (after multiple levels)
        if (gameState === 'result' && levelsCompleted + (totalAttempts > 0 ? 1 : 0) >= 3 && !recordedRef.current) {
            recordedRef.current = true;
            const accuracy = totalAttempts > 0 ? Math.round((foundCount / totalAttempts) * 100) : 0;
            recordPlayedGame('symbol-seeker', score, { 
                difficulty: 'beginner', 
                accuracy,
                perfect: false
            });
        }
        
        setupNewGame();
    };
    
    const handleStartClick = () => {
        initAudio();
        // This set state is now redundant, but harmless.
        // The re-render will be triggered by initAudio's setAudioInitialized.
        setGameState('playing');
    };

    // --- Render ---

    if (gameState === 'loading') {
        return <div className="w-full h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>
    }
    
    // Check state, not ref
    if (!audioInitialized) {
        return (
            <div className="w-full h-screen bg-gray-900 text-white flex items-center justify-center flex-col p-4">
                 <h1 className="text-5xl font-bold text-purple-400 mb-8" style={{textShadow: '0 0 15px #a855f7'}}>Symbol Seeker</h1>
                 
                 {/* --- Updated Rules Section --- */}
                 <div className="max-w-lg w-full bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-purple-500 mb-8">
                    <h2 className="text-2xl font-bold text-purple-300 mb-4 text-center">How to Play</h2>
                    <ul className="list-disc list-inside text-lg text-gray-200 space-y-2">
                        <li>A secret rule is chosen (e.g., "Must be Red").</li>
                        <li>Click shapes you believe match the rule.</li>
                        <li>Find <strong>{SHAPES_TO_FIND}</strong> correct shapes to move to the next stage.</li>
                        <li>If you're wrong, you lose one of your <strong>{LIVES_START}</strong> lives.</li>
                        <li>After finding enough shapes, you must guess the correct rule!</li>
                    </ul>
                 </div>
                 
                 <button 
                    onClick={handleStartClick}
                    className="px-10 py-5 bg-purple-600 text-white text-3xl font-bold rounded-lg shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105"
                >
                    Start Game
                </button>
            </div>
        )
    }

    return (
        <>
            {/* We need a font for the psychedelic feel */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Spectral:wght@400;700&display=swap'); body { font-family: 'Spectral', serif; }`}</style>
            
            <div className="w-full h-screen bg-gray-950 text-gray-200 flex flex-col items-center justify-center p-4 overflow-hidden">
                
                {/* --- Status Bar --- */}
                <header className="w-full max-w-3xl flex justify-between items-center p-4 bg-gray-900 rounded-t-lg border-b-2 border-purple-500">
                    <h1 className="text-2xl font-bold text-purple-400">Symbol Seeker</h1>
                    <div className="flex gap-4 items-center">
                        <div className="text-xl">
                            <span className="text-gray-400">Found: </span>
                            <span className="font-bold text-green-400">{foundCount} / {SHAPES_TO_FIND}</span>
                        </div>
                         <div className="text-xl">
                            <span className="text-gray-400">Lives: </span>
                            <span className="font-bold text-red-400">{'❤️'.repeat(lives) || '💔'}</span>
                        </div>
                    </div>
                </header>

                {/* --- Message Bar --- */}
                <p className="w-full max-w-3xl text-center p-3 bg-gray-800 text-lg text-yellow-300">{message}</p>
                
                {/* --- Shape Grid --- */}
                <div className="w-full max-w-3xl grid grid-cols-5 gap-3 p-4 bg-gray-800 shadow-inner" style={{ aspectRatio: '5 / 5'}}>
                    {shapes.map(shape => (
                        <button
                            key={shape.id}
                            disabled={gameState !== 'playing' || shape.isFound}
                            onClick={() => handleShapeClick(shape)}
                            className={`w-full h-full rounded-lg transition-all duration-150 ${shape.isFound ? 'opacity-20' : 'bg-gray-700 hover:bg-gray-600'} ${shape.isWrong ? 'animate-shake bg-red-500' : ''}`}
                        >
                            <ShapeIcon 
                                shape={shape.shape} 
                                color={shape.hex}
                                className="w-full h-full p-2"
                            />
                        </button>
                    ))}
                </div>
                
                {/* --- Guessing Modal --- */}
                {gameState === 'guessing' && (
                    <div className="absolute inset-0 z-10 bg-black bg-opacity-80 flex items-center justify-center p-4">
                        <div className="p-8 text-center max-w-lg w-full bg-gray-900 border-4 border-purple-500 rounded-xl shadow-2xl">
                            <h2 className="text-3xl font-bold mb-6 text-purple-300">What's the Rule?</h2>
                            <div className="flex flex-col gap-4">
                                {quizOptions.map((desc, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleRuleGuess(desc)}
                                        className="w-full p-4 bg-gray-700 text-white text-xl rounded-lg hover:bg-purple-700 transition-all"
                                    >
                                        {desc}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {/* --- Result Modal --- */}
                 {modalState.isOpen && gameState === 'result' && (
                    <div className="absolute inset-0 z-10 bg-black bg-opacity-80 flex items-center justify-center p-4">
                        <div className="p-8 text-center max-w-lg w-full bg-gray-900 border-4 border-purple-500 rounded-xl shadow-2xl">
                            <h2 className="text-3xl font-bold mb-6 text-purple-300">{modalState.title}</h2>
                            <p className="text-xl text-gray-200 mb-8">{modalState.message}</p>
                            <button 
                                onClick={handleModalClose}
                                className="px-8 py-4 bg-purple-600 text-white text-2xl font-bold rounded-lg transition-all duration-300 hover:bg-purple-700 hover:scale-105"
                            >
                                {modalState.buttonText}
                            </button>
                        </div>
                    </div>
                )}

            </div>
            
            {/* Simple shake animation for wrong guess */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .animate-shake {
                    animation: shake 0.2s linear;
                }
            `}</style>
        </>
    );
}