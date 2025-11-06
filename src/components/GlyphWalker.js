import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';

// --- Level Data ---
// 0: Floor, 1: Wall, 'P': Player Start, 'G': Goal
const levels = [
    // Level 1: Straight line
    [
        ['1', '1', 'P', '1', '1'],
        ['1', '1', '0', '1', '1'],
        ['1', '1', '0', '1', '1'],
        ['1', '1', '0', '1', '1'],
        ['1', '1', 'G', '1', '1']
    ],
    // Level 2: One turn
    [
        ['P', '0', '0', '1', '1'],
        ['1', '1', '0', '1', '1'],
        ['1', '1', '0', '0', 'G'],
        ['1', '1', '1', '1', '1'],
        ['1', '1', '1', '1', '1']
    ],
    // Level 3: S-Curve
    [
        ['1', '1', '1', 'G', '1'],
        ['1', '0', '0', '0', '1'],
        ['1', '0', '1', '1', '1'],
        ['P', '0', '0', '1', '1'],
        ['1', '1', '1', '1', '1']
    ],
    // Level 4: Simple U-Turn
    [
        ['P', '1', '1', 'G', '1'],
        ['0', '1', '1', '0', '1'],
        ['0', '0', '0', '0', '1'],
        ['1', '1', '1', '1', '1'],
        ['1', '1', '1', '1', '1']
    ],
    // Level 5: Long S-Curve
    [
        ['P', '0', '0', '1', '1'],
        ['1', '1', '0', '1', '1'],
        ['1', '1', '0', '0', '1'],
        ['1', '1', '1', '0', '1'],
        ['1', '1', '1', 'G', '1']
    ],
    // Level 6: Simple Obstacle
    [
        ['P', '0', '0', '0', 'G'],
        ['1', '1', '1', '1', '1'],
        ['1', '1', '1', '1', '1'],
        ['1', '1', '1', '1', '1'],
        ['1', '1', '1', '1', '1']
    ],
    // Level 7: Go around one block
    [
        ['P', '0', '0', '1', '1'],
        ['1', '1', '0', '1', '1'],
        ['1', '1', '1', '1', '1'], // Block
        ['1', '1', '0', '1', '1'],
        ['1', '1', 'G', '1', '1']
    ],
    // Level 8: T-Shape
    [
        ['1', 'P', '1', '1', '1'],
        ['1', '0', '1', '1', '1'],
        ['0', '0', '0', '0', '1'],
        ['1', '1', '1', '0', '1'],
        ['1', '1', '1', 'G', '1']
    ],
    // Level 9: Offset path
    [
        ['P', '0', '1', '1', '1'],
        ['1', '0', '1', '1', '1'],
        ['1', '0', '0', '1', '1'],
        ['1', '1', '0', '1', '1'],
        ['1', '1', 'G', '1', '1']
    ],
    // Level 10: Simple Spiral
    [
        ['P', '0', '0', '0', '1'],
        ['1', '1', '1', '0', '1'],
        ['1', 'G', '0', '0', '1'],
        ['1', '1', '1', '1', '1'],
        ['1', '1', '1', '1', '1']
    ],
    // Level 11
    [
        ['P', '0', '0', '0', '0'],
        ['1', '1', '1', '1', '0'],
        ['1', '1', 'G', '1', '0'],
        ['1', '1', '1', '1', '0'],
        ['1', '1', '1', '1', '0']
    ],
    // Level 12
    [
        ['G', '0', '0', '0', '1'],
        ['1', '1', '1', '0', '1'],
        ['1', 'P', '1', '0', '1'],
        ['1', '1', '1', '0', '1'],
        ['1', '1', '1', '1', '1']
    ],
    // Level 13: Two blocks
    [
        ['P', '0', '0', '0', 'G'],
        ['1', '1', '1', '1', '1'],
        ['1', '1', '1', '1', '1'],
        ['1', '1', '1', '1', '1'],
        ['1', '1', '1', '1', '1']
    ],
    // Level 14: Path with two blocks
    [
        ['P', '0', '0', '0', '1'],
        ['0', '1', '1', '0', '1'],
        ['0', '1', '1', '1', '1'],
        ['0', '1', '1', '0', '1'],
        ['0', '0', 'G', '0', '1']
    ],
    // Level 15: "S" turn around blocks
    [
        ['P', '0', '1', '1', '1'],
        ['1', '0', '1', '1', '1'],
        ['1', '0', '0', '0', '1'],
        ['1', '1', '1', '0', '1'],
        ['1', '1', '1', 'G', '1']
    ],
    // Level 16
    [
        ['1', '1', 'P', '1', '1'],
        ['1', '0', '0', '0', '1'],
        ['1', '0', '1', '0', '1'],
        ['1', '0', '1', '0', '1'],
        ['1', 'G', '1', '1', '1']
    ],
    // Level 17
    [
        ['P', '1', '1', '1', '1'],
        ['0', '0', '0', '1', '1'],
        ['1', '1', '0', '1', '1'],
        ['1', '1', '0', '0', '1'],
        ['1', '1', '1', 'G', '1']
    ],
    // Level 18: Long U-Turn
    [
        ['P', '0', '0', '0', '0'],
        ['1', '1', '1', '1', '0'],
        ['1', '1', '1', '1', '0'],
        ['1', '1', '1', '1', '0'],
        ['G', '0', '0', '0', '0']
    ],
    // Level 19
    [
        ['P', '0', '1', 'G', '1'],
        ['0', '1', '1', '0', '1'],
        ['0', '1', '1', '0', '1'],
        ['0', '0', '0', '0', '1'],
        ['1', '1', '1', '1', '1']
    ],
    // Level 20: Simple Maze
    [
        ['P', '0', '1', '1', '1'],
        ['1', '0', '1', '1', '1'],
        ['0', '0', '0', '1', '1'],
        ['0', '1', '0', '1', '1'],
        ['G', '1', '0', '0', '1']
    ],
    // Level 21
    [
        ['P', '0', '0', '0', '1'],
        ['0', '1', '1', '0', '1'],
        ['0', '1', 'G', '0', '1'],
        ['0', '1', '1', '1', '1'],
        ['0', '0', '0', '0', '1']
    ],
    // Level 22
    [
        ['1', '1', 'G', '1', '1'],
        ['1', '0', '0', '0', '1'],
        ['1', '0', '1', '0', '1'],
        ['P', '0', '1', '0', '1'],
        ['1', '1', '1', '1', '1']
    ],
    // Level 23
    [
        ['P', '1', 'G', '1', '1'],
        ['0', '1', '0', '1', '1'],
        ['0', '0', '0', '1', '1'],
        ['1', '1', '1', '1', '1'],
        ['1', '1', '1', '1', '1']
    ],
    // Level 24: Wall in middle
    [
        ['P', '0', '0', '0', '1'],
        ['0', '1', '1', '1', '1'],
        ['0', '1', 'G', '1', '1'],
        ['0', '1', '1', '1', '1'],
        ['0', '0', '0', '0', '1']
    ],
    // Level 25
    [
        ['1', '1', '1', '1', 'G'],
        ['1', '0', '0', '0', '0'],
        ['1', '0', '1', '1', '1'],
        ['P', '0', '0', '1', '1'],
        ['1', '1', '1', '1', '1']
    ],
    // Level 26
    [
        ['P', '0', '0', '1', 'G'],
        ['1', '1', '0', '1', '0'],
        ['1', '1', '0', '1', '0'],
        ['1', '1', '0', '1', '0'],
        ['1', '1', '0', '1', '0']
    ],
    // Level 27
    [
        ['P', '0', '1', '1', '1'],
        ['1', '0', '1', '1', '1'],
        ['1', '0', '0', '0', '1'],
        ['1', '1', '1', '0', '1'],
        ['G', '0', '0', '0', '1']
    ],
    // Level 28
    [
        ['G', '0', '0', '0', '0'],
        ['0', '1', '1', '1', '0'],
        ['0', '1', 'P', '1', '0'],
        ['0', '1', '1', '1', '0'],
        ['0', '0', '0', '0', '0']
    ],
    // Level 29
    [
        ['1', '1', '1', 'P', '1'],
        ['1', '0', '0', '0', '1'],
        ['1', '0', '1', '0', '1'],
        ['1', '0', '1', '0', '1'],
        ['1', 'G', '1', '1', '1']
    ],
    // Level 30: Tricky start
    [
        ['1', '1', '1', '1', '1'],
        ['1', 'G', '1', 'P', '1'],
        ['1', '0', '1', '0', '1'],
        ['1', '0', '0', '0', '1'],
        ['1', '1', '1', '1', '1']
    ],
    // Level 31
    [
        ['P', '0', '1', '1', '1'],
        ['0', '1', '1', '1', '1'],
        ['0', '0', '0', '1', '1'],
        ['1', '1', '0', '1', '1'],
        ['G', '0', '0', '1', '1']
    ],
    // Level 32
    [
        ['P', '0', '0', '0', '0'],
        ['1', '1', '1', '1', '0'],
        ['0', '0', '0', '1', '0'],
        ['0', '1', 'G', '1', '0'],
        ['0', '1', '1', '1', '1']
    ],
    // Level 33
    [
        ['P', '0', '1', '1', '1'],
        ['1', '0', '1', '1', '1'],
        ['1', '0', '0', '0', '1'],
        ['1', 'G', '1', '0', '1'],
        ['1', '1', '1', '0', '1']
    ],
    // Level 34
    [
        ['P', '0', '0', '0', '1'],
        ['0', '1', '1', '0', '1'],
        ['0', '1', 'G', '0', '1'],
        ['0', '1', '1', '0', '1'],
        ['0', '0', '0', '0', '1']
    ],
    // Level 35
    [
        ['1', 'P', '0', '0', '1'],
        ['1', '1', '1', '0', '1'],
        ['1', '0', '0', '0', '1'],
        ['1', '0', '1', '1', '1'],
        ['1', 'G', '1', '1', '1']
    ],
    // Level 36
    [
        ['P', '0', '1', 'G', '1'],
        ['0', '1', '1', '0', '1'],
        ['0', '0', '0', '0', '1'],
        ['1', '1', '1', '1', '1'],
        ['1', '1', '1', '1', '1']
    ],
    // Level 37
    [
        ['P', '0', '0', '0', '1'],
        ['1', '1', '1', '0', '1'],
        ['1', '0', '0', '0', '1'],
        ['1', '0', '1', '1', '1'],
        ['G', '0', '1', '1', '1']
    ],
    // Level 38
    [
        ['1', '1', '1', 'G', '1'],
        ['1', '0', '0', '0', '1'],
        ['1', '0', '1', '0', '1'],
        ['P', '0', '1', '0', '1'],
        ['1', '1', '1', '0', '1']
    ],
    // Level 39
    [
        ['G', '0', '0', '1', '1'],
        ['1', '1', '0', '1', '1'],
        ['1', '0', '0', '1', '1'],
        ['1', '0', '1', '1', '1'],
        ['P', '0', '1', '1', '1']
    ],
    // Level 40: Spiral
    [
        ['P', '0', '0', '0', '0'],
        ['1', '1', '1', '1', '0'],
        ['1', '0', '0', '0', '0'],
        ['1', '0', '1', '1', '1'],
        ['1', 'G', '1', '1', '1']
    ],
    // Level 41: Inner Spiral
    [
        ['1', '1', '1', '1', '1'],
        ['1', '0', '0', '0', '1'],
        ['1', '0', 'G', '0', '1'],
        ['1', '0', '0', '0', '1'],
        ['1', '1', 'P', '1', '1']
    ],
    // Level 42
    [
        ['P', '0', '1', '1', '1'],
        ['0', '1', '1', '1', '1'],
        ['0', '0', '1', '1', '1'],
        ['1', '0', '0', '1', '1'],
        ['1', '1', 'G', '0', '1']
    ],
    // Level 43
    [
        ['P', '1', '1', '1', '1'],
        ['0', '0', '1', '1', '1'],
        ['1', '0', '1', 'G', '1'],
        ['1', '0', '0', '0', '1'],
        ['1', '1', '1', '1', '1']
    ],
    // Level 44
    [
        ['P', '0', '0', '0', '1'],
        ['0', '1', '1', '0', '1'],
        ['0', '0', '0', '0', '1'],
        ['1', '1', '1', '0', '1'],
        ['1', '1', 'G', '0', '1']
    ],
    // Level 45
    [
        ['1', 'P', '0', '0', '0'],
        ['1', '1', '1', '1', '0'],
        ['1', '0', '0', '1', '0'],
        ['1', '0', '1', 'G', '1'],
        ['1', '0', '0', '0', '1']
    ],
    // Level 46: Long Winding Path
    [
        ['P', '0', '1', '0', '0'],
        ['1', '0', '1', '0', '1'],
        ['1', '0', '0', '0', '1'],
        ['1', '1', '1', '0', '1'],
        ['G', '0', '0', '0', '1']
    ],
    // Level 47
    [
        ['1', '0', '0', '0', 'G'],
        ['1', '0', '1', '0', '1'],
        ['1', '0', '1', '0', '1'],
        ['1', '0', '1', '0', '1'],
        ['P', '0', '1', '1', '1']
    ],
    // Level 48
    [
        ['P', '0', '0', '1', 'G'],
        ['0', '1', '0', '1', '0'],
        ['0', '1', '0', '1', '0'],
        ['0', '1', '0', '1', '0'],
        ['0', '0', '0', '1', '0']
    ],
    // Level 49
    [
        ['1', 'G', '1', '1', '1'],
        ['1', '0', '1', '1', '1'],
        ['0', '0', '0', '0', 'P'],
        ['0', '1', '1', '1', '1'],
        ['0', '0', '1', '1', '1']
    ],
    // Level 50: Final Challenge
    [
        ['P', '0', '1', '0', '0'],
        ['1', '0', '1', '0', '1'],
        ['0', '0', '1', '0', '0'],
        ['0', '1', '1', '1', '0'],
        ['0', '0', '0', '0', 'G']
    ]
];

// --- Audio Setup ---
const sfx = {
    move: null,
    turn: null,
    crash: null,
    win: null,
    add: null,
};

/**
 * Utility function to wrap setTimeout in a Promise
 * @param {number} ms Milliseconds to wait
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Glyph-Walker: A code-command game where the player programs a robot's path
 */
const GlyphWalkerGame = () => {
    // --- State Management ---
    const [levelIndex, setLevelIndex] = useState(0);
    const [grid, setGrid] = useState([]);
    const [playerPos, setPlayerPos] = useState({ x: 0, y: 0, dir: 0 }); // dir: 0=N, 1=E, 2=S, 3=W
    const [startPos, setStartPos] = useState({ x: 0, y: 0, dir: 0 });
    const [goalPos, setGoalPos] = useState({ x: 0, y: 0 });
    const [commandQueue, setCommandQueue] = useState([]); // Array of 'F', 'L', 'R'
    const [isRunning, setIsRunning] = useState(false);
    const [message, setMessage] = useState("Welcome to Glyph-Walker!");
    const [modalState, setModalState] = useState({
        isOpen: true,
        title: "Welcome!",
        message: "Program the robot (🤖) using the commands to reach the goal (🔵). Good luck!",
        buttonText: "Start Level 1"
    });

    const executionTimer = useRef(null);

    // --- Audio Initialization ---
    useEffect(() => {
        // Initialize Tone.js instruments once
        sfx.move = new Tone.MembraneSynth({
            envelope: { attack: 0.005, decay: 0.2, sustain: 0.0, release: 0.1 }
        }).toDestination();
        
        // FIX: Changed PolySynth(PluckSynth, ...) to MonoSynth for reliability 
        // as turn only plays a single tone and the previous configuration caused an error.
        sfx.turn = new Tone.MonoSynth({
            oscillator: { type: "sine" },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.0, release: 0.1 }
        }).toDestination();
        
        sfx.crash = new Tone.NoiseSynth({
            noise: { type: "white" },
            envelope: { attack: 0.005, decay: 0.2, sustain: 0.0, release: 0.1 }
        }).toDestination();
        
        // This is correct for playing chords (PolySynth with Synth voice)
        sfx.win = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "square" },
            envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5 }
        }).toDestination();
        
        sfx.add = new Tone.PluckSynth({ volume: -10 }).toDestination();
        
        sfx.turn.volume.value = -15;
    }, []);

    // --- Game Logic ---

    /**
     * Loads a level from the `levels` array
     */
    const loadLevel = useCallback((index) => {
        const levelData = levels[index];

        if (!levelData) {
            // No more levels
            setModalState({
                isOpen: true,
                title: "You Win!",
                message: "You have completed all available levels. Congratulations!",
                buttonText: "Play Again?"
            });
            setLevelIndex(0); // Reset to level 1 if they play again
            return;
        }

        let pPos = { x: 0, y: 0, dir: 0 }; // Default North
        let gPos = { x: 0, y: 0 };

        levelData.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell === 'P') {
                    pPos = { x, y, dir: 0 };
                } else if (cell === 'G') {
                    gPos = { x, y };
                }
            });
        });
        
        setGoalPos(gPos);
        setGrid(levelData);
        setPlayerPos(pPos);
        setStartPos(pPos);
        setCommandQueue([]);
        setIsRunning(false);
        setMessage(`Level ${index + 1}/${levels.length}. Build your command sequence.`);
    }, []);

    /**
     * Handles the "Start Game" or "Next Level" button
     */
    const startGame = () => {
        Tone.start(); // Start audio context on user interaction
        setModalState({ ...modalState, isOpen: false });
        loadLevel(levelIndex);
    };

    // Load the initial level (or when levelIndex changes)
    useEffect(() => {
        if (!modalState.isOpen) {
            loadLevel(levelIndex);
        }
    }, [levelIndex, modalState.isOpen, loadLevel]);

    // Cleanup async timers on unmount
    useEffect(() => {
        return () => {
            if (executionTimer.current) {
                clearTimeout(executionTimer.current);
            }
        };
    }, []);
    
    /**
     * Adds a command to the queue
     */
    const addCommand = (cmd) => {
        if (isRunning) return;
        sfx.add?.triggerAttackRelease("C5", "8n");
        setCommandQueue(q => [...q, cmd]);
    };

    /**
     * Clears the command queue
     */
    const clearQueue = () => {
        if (isRunning) return;
        setMessage("Command queue cleared.");
        setCommandQueue([]);
    };

    /**
     * Resets the player to the start of the level
     */
    const resetLevel = () => {
        if (executionTimer.current) {
            clearTimeout(executionTimer.current);
        }
        
        setIsRunning(false);
        setPlayerPos(startPos);
        setMessage("Level reset. Build your sequence.");
    };

    /**
     * Executes the command queue
     */
    const runCommands = async () => {
        if (isRunning) return;
        
        setIsRunning(true);
        setMessage("Executing sequence...");
        
        // Reset player to start before running
        setPlayerPos(startPos);
        await sleep(300); // Give time to see the reset

        let currentPos = { ...startPos };

        for (let i = 0; i < commandQueue.length; i++) {
            const cmd = commandQueue[i];
            let nextPos = { ...currentPos };

            if (cmd === 'F') { // Move Forward
                if (currentPos.dir === 0) nextPos.y -= 1; // North
                else if (currentPos.dir === 1) nextPos.x += 1; // East
                else if (currentPos.dir === 2) nextPos.y += 1; // South
                else if (currentPos.dir === 3) nextPos.x -= 1; // West
                
                sfx.move?.triggerAttackRelease("C4", "8n");

            } else if (cmd === 'L') { // Turn Left
                nextPos.dir = (currentPos.dir + 3) % 4; // (0+3)%4 = 3, (3+3)%4 = 2, etc.
                sfx.turn?.triggerAttackRelease("E3", "8n");

            } else if (cmd === 'R') { // Turn Right
                nextPos.dir = (currentPos.dir + 1) % 4; // (0+1)%4 = 1, (1+1)%4 = 2, etc.
                sfx.turn?.triggerAttackRelease("G3", "8n");
            }

            // --- Collision & Goal Check ---
            
            // 1. Check for Out-of-Bounds
            if (cmd === 'F') { // Only check bounds/walls on movement
                if (nextPos.y < 0 || nextPos.y >= grid.length || nextPos.x < 0 || nextPos.x >= grid[0].length) {
                    sfx.crash?.triggerAttackRelease("0.1");
                    setMessage("CRASH! Hit the edge of the world.");
                    setPlayerPos(nextPos); // Show the attempted move
                    setIsRunning(false);
                    return;
                }

                // 2. Check for Wall
                const cell = grid[nextPos.y][nextPos.x];
                if (cell === '1') {
                    sfx.crash?.triggerAttackRelease("0.1");
                    setMessage("CRASH! Hit a wall.");
                    setPlayerPos(nextPos); // Show the attempted move
                    setIsRunning(false);
                    return;
                }
            }

            // 3. Update Position
            setPlayerPos(nextPos);
            currentPos = nextPos;

            // 4. Check for Goal
            if (currentPos.x === goalPos.x && currentPos.y === goalPos.y) {
                sfx.win?.triggerAttackRelease(["C4", "E4", "G4", "C5"], "0.5");
                setMessage("GOAL! Level complete!");
                setIsRunning(false);
                
                // Show next level modal
                executionTimer.current = setTimeout(() => {
                    setModalState({
                        isOpen: true,
                        title: "Level Complete!",
                        message: "Great job, you solved the puzzle!",
                        buttonText: "Next Level"
                    });
                    setLevelIndex(i => i + 1);
                }, 1000);
                return;
            }

            // Wait for next step
            await sleep(350);
        }

        // Finished queue but not at goal
        setIsRunning(false);
        setMessage("Sequence finished, but not at the goal.");
    };
    
    
    // --- Render Components ---

    const RenderGrid = () => {
        // Player rotation classes for Tailwind
        // 0: North (up), 1: East (right), 2: South (down), 3: West (left)
        const rotationClasses = ['rotate-0', 'rotate-90', 'rotate-180', '-rotate-90'];

        return (
            <div 
                className="grid bg-green-800 border-4 border-yellow-900 shadow-inner rounded-lg"
                style={{
                    gridTemplateColumns: `repeat(${grid[0]?.length || 5}, 1fr)`,
                    gridTemplateRows: `repeat(${grid.length || 5}, 1fr)`,
                    width: 'clamp(300px, 80vw, 500px)', // Responsive grid size
                    aspectRatio: '1 / 1',
                }}
            >
                {grid.map((row, y) => 
                    row.map((cell, x) => {
                        const isPlayerPos = playerPos.x === x && playerPos.y === y;
                        const isGoalPos = goalPos.x === x && goalPos.y === y; // Corrected goal check
                        
                        let cellContent = null;
                        let cellClass = 'w-full h-full flex items-center justify-center transition-all duration-100';

                        if (cell === '1') { // Wall
                            cellClass += ' bg-yellow-900 border border-yellow-950';
                        } else { // Floor
                            cellClass += ' bg-green-600 border border-green-700';
                        }
                        
                        if (isPlayerPos) {
                            // Player (Robot)
                            cellContent = (
                                <div 
                                    className={`text-4xl transition-transform duration-200 ${rotationClasses[playerPos.dir]} animate-pulse`}
                                    style={{ animationDuration: '0.8s', animationIterationCount: 'infinite' }}
                                    title={`Player at ${x},${y} facing ${playerPos.dir}`}
                                >
                                    🤖
                                </div>
                            );
                        } else if (isGoalPos) {
                            // Goal
                            cellContent = (
                                <div className="w-3/4 h-3/4 bg-blue-500 rounded-full shadow-lg border-2 border-blue-300 animate-pulse"
                                     style={{ animationDuration: '2s', animationDirection: 'alternate' }}></div>
                            );
                        }

                        return (
                            <div key={`${x}-${y}`} className={cellClass}>
                                {cellContent}
                            </div>
                        );
                    })
                )}
            </div>
        );
    };

    const RenderCommandPalette = () => {
        const commands = [
            { id: 'F', label: 'Move Forward', icon: '⬆️' },
            { id: 'L', label: 'Turn Left', icon: '↪️' },
            { id: 'R', label: 'Turn Right', icon: '↩️' },
        ];
        
        return (
            <div className="flex justify-center gap-2 p-4 bg-gray-900 rounded-lg border border-gray-700">
                {commands.map(cmd => (
                    <button
                        key={cmd.id}
                        title={cmd.label}
                        disabled={isRunning}
                        onClick={() => addCommand(cmd.id)}
                        className="p-3 bg-gray-700 text-white font-mono rounded-md shadow-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex flex-col items-center"
                    >
                        <span className="text-2xl">{cmd.icon}</span>
                        <span className="text-xs mt-1">{cmd.label.replace('Move ', '').replace('Turn ', '')}</span>
                    </button>
                ))}
            </div>
        );
    };

    const RenderCommandQueue = () => {
        const cmdIcon = { 'F': '⬆️', 'L': '↪️', 'R': '↩️' };
        
        return (
            <div className="w-full h-24 bg-gray-800 rounded-lg p-2 flex flex-wrap gap-2 overflow-y-auto border-2 border-gray-700">
                {commandQueue.length === 0 && (
                    <span className="text-gray-500 self-center mx-auto">Click commands to add them here...</span>
                )}
                {commandQueue.map((cmd, i) => (
                    <div 
                        key={i} 
                        className="w-10 h-10 bg-gray-600 rounded flex items-center justify-center text-xl shadow-sm text-yellow-300 font-bold"
                    >
                        {cmdIcon[cmd]}
                    </div>
                ))}
            </div>
        );
    };

    const RenderControls = () => {
        return (
            <div className="flex justify-center gap-2 p-4 border border-gray-700 rounded-lg bg-gray-900">
                <button
                    onClick={runCommands}
                    disabled={isRunning || commandQueue.length === 0}
                    className="flex-1 px-6 py-3 bg-green-600 text-white font-bold text-xl rounded-lg shadow-lg hover:bg-green-700 disabled:bg-gray-500 transition-all transform hover:scale-[1.02]"
                >
                    ▶️ RUN
                </button>
                <button
                    onClick={clearQueue}
                    disabled={isRunning}
                    className="px-4 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-700 disabled:bg-gray-500 transition-all"
                >
                    ❌ CLEAR
                </button>
                <button
                    onClick={resetLevel}
                    disabled={isRunning}
                    className="px-4 py-3 bg-yellow-500 text-black font-bold rounded-lg shadow-lg hover:bg-yellow-600 disabled:bg-gray-500 transition-all"
                >
                    🔄 RESET
                </button>
            </div>
        );
    };

    const RenderModal = () => {
        if (!modalState.isOpen) return null;
        
        return (
            <div className="absolute inset-0 z-20 bg-black bg-opacity-80 flex items-center justify-center p-4">
                <div className="p-8 text-center max-w-md w-full bg-gray-900 border-4 border-blue-500 rounded-xl shadow-2xl shadow-blue-500/50">
                    <h2 className="text-3xl font-bold mb-4 text-blue-300">{modalState.title}</h2>
                    <p className="text-lg text-gray-200 mb-8">{modalState.message}</p>
                    <button 
                        onClick={startGame}
                        className="px-8 py-4 bg-blue-600 text-white text-2xl font-bold rounded-lg transition-all duration-300 hover:bg-blue-700 hover:scale-105"
                    >
                        {modalState.buttonText}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            {/* We need a font for the "chiptune" feel, Orbitron is good */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap'); body { font-family: 'Orbitron', sans-serif; }`}</style>
            
            <div className="w-full h-screen bg-gray-950 text-gray-200 flex flex-col items-center justify-center p-4 overflow-hidden">
                <RenderModal />
                
                <h1 className="text-4xl font-bold text-blue-400 mb-4" style={{textShadow: '0 0 10px #2563eb'}}>GLYPH-WALKER</h1>
                <p className="mb-6 text-sm text-gray-400">Level {levelIndex + 1}/{levels.length}</p>
                
                <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-center md:items-start">
                    
                    {/* Left Panel: Game Grid */}
                    <div className="flex-shrink-0">
                        <RenderGrid />
                    </div>

                    {/* Right Panel: Controls */}
                    <div className="flex-grow w-full max-w-md flex flex-col gap-4">
                        
                        <h2 className="text-2xl text-center text-yellow-400">COMMANDS</h2>
                        <RenderCommandPalette />
                        
                        <h2 className="text-2xl text-center text-yellow-400">SEQUENCE</h2>
                        <RenderCommandQueue />
                        
                        <RenderControls />
                    </div>
                </div>

                {/* Message Bar */}
                <footer className="w-full max-w-5xl mt-4 p-3 bg-gray-800 text-center rounded-lg border border-gray-700 shadow-xl">
                    <p className="text-lg font-mono text-yellow-300">{message}</p>
                </footer>
            </div>
        </>
    );
}
export default GlyphWalkerGame;
