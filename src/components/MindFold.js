import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Tone from 'tone';

// --- Configuration ---
const FACE_CONFIG = [
    { label: 'A', color: '#ef4444' }, // Red
    { label: 'B', color: '#3b82f6' }, // Blue
    { label: 'C', color: '#22c55e' }, // Green
    { label: 'D', color: '#eab308' }, // Yellow
    { label: 'E', color: '#a855f7' }, // Purple
    { label: 'F', color: '#14b8a6' }, // Teal
];
// Standard Cube Net Layout (The cross shape, B-C-D-E in a row, A above C, F below C)
//     A
//   B C D
//     F
// Opposite pairs: (A, F), (B, D), (C, E)
const OPPOSITE_PAIRS = [['A', 'F'], ['B', 'D'], ['C', 'E']];

// --- Audio Setup ---
const sfx = { correct: null, wrong: null };
// Removed the invalid global hook call: const audioInitialized = useRef(false);

const initAudio = () => {
    // Use sfx.correct as a flag to ensure initialization only runs once.
    if (sfx.correct !== null) return;
    
    // Start Tone.js context
    Tone.start();

    // Soft, pleasant "ping"
    sfx.correct = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.1, release: 0.2 },
        volume: -10
    }).toDestination();

    // Soft, low "thud" for wrong
    sfx.wrong = new Tone.MembraneSynth({
        pitchDecay: 0.01,
        octaves: 2,
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
        volume: -8
    }).toDestination();
};

// --- Helper Functions ---

// Shuffles an array
const shuffleArray = (array) => [...array].sort(() => 0.5 - Math.random());

// Gets the opposite face of a given face
const getOpposite = (faceLabel) => {
    const pair = OPPOSITE_PAIRS.find(p => p.includes(faceLabel));
    return pair ? (pair[0] === faceLabel ? pair[1] : pair[0]) : null;
};

// Checks if three faces can be adjacent (i.e., no two are opposite)
const isValidCube = (faces) => {
    if (faces.length !== 3) return false;
    // Check all three pairs
    return !(
        getOpposite(faces[0]) === faces[1] ||
        getOpposite(faces[0]) === faces[2] ||
        getOpposite(faces[1]) === faces[2]
    );
};

// Generates a set of 3 visible adjacent faces (e.g., Top, Front, Right)
const generateCorrectCube = () => {
    const faces = shuffleArray(FACE_CONFIG.map(f => f.label));
    
    // Iterate through combinations until a valid cube is found
    for (let i = 0; i < faces.length; i++) {
        for (let j = i + 1; j < faces.length; j++) {
            for (let k = j + 1; k < faces.length; k++) {
                const triple = [faces[i], faces[j], faces[k]];
                if (isValidCube(triple)) {
                    return triple;
                }
            }
        }
    }
    // Should not happen if FACE_CONFIG and OPPOSITE_PAIRS are correct
    return ['A', 'B', 'C']; 
};

// Generates an incorrect cube (must contain an opposite pair)
const generateDecoyCube = (correctFaces) => {
    let decoy = [];
    let attempts = 0;

    while (attempts < 100) {
        // 1. Pick an opposite pair to force the violation
        const oppositePair = OPPOSITE_PAIRS[Math.floor(Math.random() * OPPOSITE_PAIRS.length)];
        
        // 2. Pick a third face that is not opposite to the first two
        const remainingFaces = FACE_CONFIG.map(f => f.label)
            .filter(l => !oppositePair.includes(l));
        
        const thirdFace = remainingFaces[Math.floor(Math.random() * remainingFaces.length)];
        
        decoy = shuffleArray([...oppositePair, thirdFace]);
        
        // 3. Ensure the decoy is not identical to the correct answer
        if (
            !isValidCube(decoy) && 
            !decoy.every(f => correctFaces.includes(f))
        ) {
            return decoy;
        }
        attempts++;
    }
    // Fallback to a fixed incorrect configuration
    return ['A', 'F', 'B']; 
};

// --- Components ---

const Face = ({ label, color, sizeClass = 'w-10 h-10' }) => (
    <div 
        className={`flex items-center justify-center font-bold text-xl text-white border-2 border-gray-900 shadow-md ${sizeClass}`} 
        style={{ backgroundColor: color }}
    >
        {label}
    </div>
);

const NetDisplay = () => (
    <div className="flex flex-col items-center p-4 bg-gray-700 rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold mb-3 text-purple-300">Net to Fold:</h3>
        <div className="grid grid-cols-4 gap-0">
            {/* Top Row: A */}
            <div className="col-start-3">
                <Face label="A" color={FACE_CONFIG.find(f => f.label === 'A').color} sizeClass="w-16 h-16"/>
            </div>
            {/* Middle Row: B C D E */}
            <Face label="B" color={FACE_CONFIG.find(f => f.label === 'B').color} sizeClass="w-16 h-16"/>
            <Face label="C" color={FACE_CONFIG.find(f => f.label === 'C').color} sizeClass="w-16 h-16"/>
            <Face label="D" color={FACE_CONFIG.find(f => f.label === 'D').color} sizeClass="w-16 h-16"/>
            <Face label="E" color={FACE_CONFIG.find(f => f.label === 'E').color} sizeClass="w-16 h-16"/>
            {/* Bottom Row: F */}
            <div className="col-start-3">
                <Face label="F" color={FACE_CONFIG.find(f => f.label === 'F').color} sizeClass="w-16 h-16"/>
            </div>
        </div>
        <p className="mt-4 text-sm text-gray-400">Opposite Pairs: (A, F), (B, D), (C, E)</p>
    </div>
);

const CubeOption = ({ faces, isSelected, onClick, isCorrect }) => {
    const faceData = faces.map(label => FACE_CONFIG.find(f => f.label === label));
    
    // Apply styling based on state (Selection, Correct, Wrong)
    let ringColor = 'ring-purple-500';
    if (isSelected && isCorrect === true) ringColor = 'ring-green-500';
    if (isSelected && isCorrect === false) ringColor = 'ring-red-500';
    if (!isSelected && isCorrect === true) ringColor = 'ring-green-500'; // Show correct answer after choice

    // Simple isometric cube representation using CSS skew
    return (
        <button 
            onClick={onClick}
            disabled={isCorrect !== null}
            className={`flex flex-col items-center m-4 p-2 transition-all duration-200 
                ${isCorrect !== null ? 'cursor-default' : 'hover:scale-105 cursor-pointer'} 
                ${isSelected || isCorrect !== null ? `ring-4 ${ringColor}` : 'ring-2 ring-transparent hover:ring-purple-400'} 
                rounded-lg bg-gray-900 shadow-xl`}
        >
            <div className="relative transform scale-75">
                {/* Top Face */}
                <div 
                    className="absolute w-24 h-24 transform -skew-x-45 -translate-y-12"
                    style={{ backgroundColor: faceData[0].color, transform: 'skewX(-45deg) rotate(30deg) scale(1)' }}
                >
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-3xl text-white transform skewX(45deg) rotate(-30deg)">{faceData[0].label}</span>
                </div>
                
                {/* Front Face */}
                <div 
                    className="absolute w-24 h-24 transform translate-x-12"
                    style={{ backgroundColor: faceData[1].color, transform: 'skewY(45deg) scale(1)' }}
                >
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-3xl text-white transform skewY(-45deg)">{faceData[1].label}</span>
                </div>
                
                {/* Right Face */}
                <div 
                    className="absolute w-24 h-24 transform translate-x-12 translate-y-12"
                    style={{ backgroundColor: faceData[2].color }}
                >
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-3xl text-white">{faceData[2].label}</span>
                </div>
            </div>
            <p className="mt-4 text-xs text-gray-400">Option {faces.join('-')}</p>
        </button>
    );
};

// --- Main App Component ---
export default function MindFoldGame() {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('start'); // start, playing, result
    const [options, setOptions] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState([]);
    const [userChoiceIndex, setUserChoiceIndex] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null); // null, true, false
    const [globalTimeLeft, setGlobalTimeLeft] = useState(90); // New global timer
    const [score, setScore] = useState(0); // New score state
    const [totalAttempts, setTotalAttempts] = useState(0); // New metric for accuracy
    
    // Use state for audio initialization to force re-render
    const [audioReady, setAudioReady] = useState(false);

    const setupNewRound = useCallback(() => {
        const newCorrect = generateCorrectCube();
        const decoy1 = generateDecoyCube(newCorrect);
        let decoy2 = generateDecoyCube(newCorrect);
        
        // Ensure decoys are distinct
        while (decoy2.every(f => decoy1.includes(f))) {
            decoy2 = generateDecoyCube(newCorrect);
        }

        const newOptions = shuffleArray([newCorrect, decoy1, decoy2]);
        
        setCorrectAnswer(newCorrect);
        setOptions(newOptions);
        setUserChoiceIndex(null);
        setIsCorrect(null);
        // Do not set game state here, only set to playing on start
        if(gameState === 'start') {
            setGameState('playing');
        }
    }, [gameState]); // Add gameState dependency

    // Handle Time Up - This is now the main game over condition
    const handleGlobalTimeUp = useCallback(() => {
        if (gameState !== 'playing') return;
        sfx.wrong?.triggerAttackRelease("C2", "0.1");
        setGameState('result'); // This will trigger the final score modal
    }, [gameState]);

    // Initial setup (on mount)
    useEffect(() => {
        if (gameState === 'start' && audioReady) {
            setupNewRound();
        }
    }, [gameState, audioReady, setupNewRound]);

    // New Global Timer effect
    useEffect(() => {
        if (gameState === 'playing' && globalTimeLeft > 0) {
            const timerId = setInterval(() => {
                setGlobalTimeLeft(t => t - 1);
            }, 1000);
            return () => clearInterval(timerId);
        }
        
        // Handle FINAL game over
        if (gameState === 'playing' && globalTimeLeft <= 0) {
            handleGlobalTimeUp();
        }
    }, [gameState, globalTimeLeft, handleGlobalTimeUp]);

    const handleChoice = (index, chosenFaces) => {
        if (isCorrect !== null) return; // Already processing an answer

        setUserChoiceIndex(index);
        setTotalAttempts(a => a + 1); // Track every attempt
        
        // Use a Set to compare the content of the arrays regardless of order
        const chosenSet = new Set(chosenFaces);
        const correctSet = new Set(correctAnswer);
        
        const isMatch = chosenSet.size === correctSet.size && 
                       [...chosenSet].every(value => correctSet.has(value));
        
        if (isMatch) {
            sfx.correct?.triggerAttackRelease("C5", "8n");
            setIsCorrect(true);
            setScore(s => s + 1); // Increment score
        } else {
            sfx.wrong?.triggerAttackRelease("C2", "0.1");
            setIsCorrect(false);
        }

        // Automatically load next round after a delay
        setTimeout(() => {
            if (gameState === 'playing') { // Only load if game is still playing
                setupNewRound();
            }
        }, 1500); // 1.5 second delay
    };
    
    const handleStartClick = () => {
        initAudio();
        setAudioReady(true);
        // Reset score and timer, then setup round (which sets gameState to 'playing')
        setScore(0);
        setTotalAttempts(0); // Reset attempts
        setGlobalTimeLeft(90);
        setupNewRound();
    };

    // --- Expert Review Function ---
    const getExpertReview = (score, accuracy, totalAttempts) => {
        let title = "";
        let analysis = "";

        // Tiers based on Score
        if (score <= 5) {
            title = "Spatial Novice";
            analysis = "A good start! The key is to track one or two 'anchor' faces (like A and B) and see if they can touch. Keep practicing!";
        } else if (score <= 10) {
            title = "Cube Apprentice";
            analysis = "Nice work! You're starting to see the folds. Your accuracy is good, which means you're being careful. Now, try to build up your speed!";
        } else if (score <= 15) {
            title = "Fold Specialist";
            analysis = "Excellent performance! You have a strong grasp of spatial relationships and can quickly spot the 'impossible' (opposite) pairs.";
        } else {
            title = "Spatial Grandmaster";
            analysis = "Incredible! Your ability to mentally visualize and rotate 3D objects is top-tier. A truly impressive display of spatial reasoning.";
        }

        // Add a secondary comment based on Accuracy (if they made attempts)
        if (totalAttempts > 0) {
            if (accuracy < 50) {
                analysis += " Be careful not to rush—it's often faster to trace the opposite pairs first.";
            } else if (accuracy >= 90 && score > 5) {
                analysis += " Your accuracy is nearly perfect. You're a natural at this!";
            }
        } else {
            // No attempts made
            title = "Just Watching?";
            analysis = "You didn't make any attempts! Click the cubes to make your best guess based on the net.";
        }

        return { title, analysis };
    };

    // --- Render ---

    if (!audioReady || gameState === 'start') { // Show start screen if not ready OR explicitly in start state
        return (
            <div className="w-full h-screen bg-gray-900 text-white flex items-center justify-center flex-col p-4">
                 <h1 className="text-5xl font-bold text-purple-400 mb-8" style={{textShadow: '0 0 15px #a855f7'}}>Mind-Fold</h1>
                 
                 <div className="max-w-xl w-full bg-gray-800 p-6 rounded-lg shadow-lg border-2 border-purple-500 mb-8">
                    <h2 className="text-2xl font-bold text-purple-300 mb-4 text-center">How to Play</h2>
                    <ul className="list-disc list-inside text-lg text-gray-200 space-y-2">
                        <li>You are shown a 2D **Net** of a cube with 6 labeled, colored faces (A-F).</li>
                        <li>Your task is to mentally fold this net into a 3D cube.</li>
                        <li>Select the 3D **Cube Option** that correctly shows faces that would be adjacent (touching) on the folded cube.</li>
                        <li>**Hint:** Two faces cannot be adjacent if they are **opposite** on the net. The opposite pairs are listed below the net.</li>
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

    // --- Generate Review for Modal ---
    let review = { title: '', analysis: '' };
    let accuracy = 0;
    if (gameState === 'result') {
        accuracy = totalAttempts > 0 ? ((score / totalAttempts) * 100).toFixed(0) : 0;
        review = getExpertReview(score, accuracy, totalAttempts);
    }


    return (
        <div className="w-full min-h-screen bg-gray-950 text-gray-200 flex flex-col items-center p-8 overflow-auto">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700&display=swap'); body { font-family: 'Roboto', sans-serif; }`}</style>

            <header className="w-full max-w-2xl flex justify-center items-center relative mb-4">
                <a 
                    href="/"
                    className="absolute left-0 top-1/2 -translate-y-1/2 px-4 py-2 bg-gray-700 text-white text-sm font-bold rounded-lg shadow-lg hover:bg-gray-600 transition-all"
                >
                    &larr; Home
                </a>
                
                <h1 className="text-4xl font-extrabold text-purple-400 border-b border-purple-600 pb-2">
                    Mind-Fold
                </h1>
            </header>

            {/* Timer and Score Display */}
            <div className="flex justify-around w-full max-w-2xl">
                <div className={`text-3xl font-bold mb-4 ${globalTimeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-300'}`}>
                    Time: {globalTimeLeft}s
                </div>
                <div className="text-3xl font-bold mb-4 text-green-400">
                    Score: {score}
                </div>
            </div>


            <p className="text-xl text-gray-300 mb-8 text-center max-w-2xl">
                Visualize the net below as a folded cube. Select the option where all three visible faces could be adjacent.
            </p>

            {/* --- Net Display --- */}
            <NetDisplay />

            <div className="mt-8 h-8"> {/* Added h-8 for layout stability */}
                {isCorrect === true && <p className="text-2xl font-bold text-green-400">Correct!</p>}
                {isCorrect === false && <p className="text-2xl font-bold text-red-400">Incorrect!</p>}
                {/* Removed 'time_up' message from here */}
            </div>

            {/* --- Cube Options --- */}
            <div className="flex flex-wrap justify-center mt-6">
                {options.map((faces, index) => {
                    // Check if the faces in this option match the correct faces (regardless of order)
                    const optionFacesSet = new Set(faces);
                    const correctFacesSet = new Set(correctAnswer);
                    const optionCorrect = optionFacesSet.size === correctFacesSet.size && 
                                          [...optionFacesSet].every(value => correctFacesSet.has(value));
                    
                    return (
                        <CubeOption 
                            key={index}
                            faces={faces}
                            isSelected={userChoiceIndex === index}
                            onClick={() => handleChoice(index, faces)}
                            isCorrect={isCorrect === null ? null : optionCorrect}
                        />
                    );
                })}
            </div>

            {/* --- Controls (Final Score Modal) --- */}
            {gameState === 'result' && (
                <div className="absolute inset-0 z-20 bg-black bg-opacity-80 flex items-center justify-center p-4">
                    <div className="p-8 text-center max-w-lg w-full bg-gray-900 border-4 border-purple-500 rounded-xl shadow-2xl">
                        <h2 className="text-4xl font-bold mb-4 text-yellow-400">{review.title}</h2>
                        
                        {/* Stats Block */}
                        <div className="flex justify-around my-6">
                            <div>
                                <p className="text-xl text-gray-400 mb-1">Final Score</p>
                                <p className="text-6xl font-bold text-green-400">{score}</p>
                            </div>
                            <div>
                                <p className="text-xl text-gray-400 mb-1">Accuracy</p>
                                <p className="text-6xl font-bold text-cyan-400">{totalAttempts > 0 ? `${accuracy}%` : 'N/A'}</p>
                            </div>
                        </div>

                        {/* Analysis Text */}
                        <p className="text-lg text-gray-200 mb-8">{review.analysis}</p>
                        
                        <button 
                            onClick={() => {
                                // Reset everything for a new game
                                setScore(0);
                                setTotalAttempts(0); // Reset attempts
                                setGlobalTimeLeft(90);
                                setAudioReady(false); // Go back to start screen
                                setGameState('start');
                            }}
                            className="px-8 py-4 bg-purple-600 text-white text-2xl font-bold rounded-lg transition-all duration-300 hover:bg-purple-700 hover:scale-105"
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}