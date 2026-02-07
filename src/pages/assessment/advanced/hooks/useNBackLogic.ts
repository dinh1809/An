/**
 * 🧠 N-BACK LOGIC HOOK
 * ====================
 * Core logic for the N-Back working memory task.
 * 
 * Algorithm:
 * - Maintain a circular buffer of N items
 * - Compare current item with item N positions back
 * - Adaptive: Increase N when streak > 5, decrease on errors
 * 
 * Metrics:
 * - Max N-level reached (1-3)
 * - Accuracy percentage
 * - Average reaction time
 */

import { useState, useCallback, useRef } from "react";

// Item types for the N-Back task
export interface NBackItem {
    id: number;
    shape: "circle" | "square" | "triangle" | "diamond";
    color: "red" | "blue" | "green" | "yellow";
    isTarget: boolean; // True if matches N-back position
}

interface NBackState {
    history: NBackItem[];
    currentItem: NBackItem | null;
    nLevel: number;
    maxNLevel: number;
    streak: number;
    score: number;
    totalTrials: number;
    correctCount: number;
    incorrectCount: number;
    missCount: number; // Didn't respond when should have
    falseAlarmCount: number; // Responded when shouldn't have
    reactionTimes: number[];
    isComplete: boolean;
    phase: "intro" | "playing" | "result";
}

interface NBackMetrics {
    maxNLevel: number;
    accuracyPercent: number;
    avgReactionTimeMs: number;
    workingMemoryScore: number; // Composite score 0-100
    dPrime: number; // Signal detection sensitivity
}

const SHAPES: NBackItem["shape"][] = ["circle", "square", "triangle", "diamond"];
const COLORS: NBackItem["color"][] = ["red", "blue", "green", "yellow"];

const MAX_TRIALS = 30;
const STREAK_THRESHOLD = 5; // Consecutive correct to level up
const MAX_N_LEVEL = 3;
const TARGET_PROBABILITY = 0.35; // 35% of trials are targets

export function useNBackLogic() {
    const [state, setState] = useState<NBackState>({
        history: [],
        currentItem: null,
        nLevel: 1,
        maxNLevel: 1,
        streak: 0,
        score: 0,
        totalTrials: 0,
        correctCount: 0,
        incorrectCount: 0,
        missCount: 0,
        falseAlarmCount: 0,
        reactionTimes: [],
        isComplete: false,
        phase: "intro"
    });

    const trialStartTime = useRef<number>(0);
    const hasResponded = useRef<boolean>(false);
    const itemIdCounter = useRef<number>(0);

    // Generate a new item, potentially matching N-back
    const generateItem = useCallback((history: NBackItem[], nLevel: number): NBackItem => {
        const shouldBeTarget = history.length >= nLevel && Math.random() < TARGET_PROBABILITY;

        let shape: NBackItem["shape"];
        let color: NBackItem["color"];

        if (shouldBeTarget && history.length >= nLevel) {
            // Make it match the N-back item
            const targetItem = history[history.length - nLevel];
            shape = targetItem.shape;
            color = targetItem.color;
        } else {
            // Generate random, ensuring it DOESN'T match N-back (if possible)
            let attempts = 0;
            do {
                shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
                color = COLORS[Math.floor(Math.random() * COLORS.length)];
                attempts++;
            } while (
                attempts < 10 &&
                history.length >= nLevel &&
                history[history.length - nLevel]?.shape === shape &&
                history[history.length - nLevel]?.color === color
            );
        }

        const newItem: NBackItem = {
            id: itemIdCounter.current++,
            shape,
            color,
            isTarget: shouldBeTarget && history.length >= nLevel
        };

        return newItem;
    }, []);

    // Start the game
    const startGame = useCallback(() => {
        itemIdCounter.current = 0;
        const firstItem = generateItem([], 1);

        setState({
            history: [],
            currentItem: firstItem,
            nLevel: 1,
            maxNLevel: 1,
            streak: 0,
            score: 0,
            totalTrials: 0,
            correctCount: 0,
            incorrectCount: 0,
            missCount: 0,
            falseAlarmCount: 0,
            reactionTimes: [],
            isComplete: false,
            phase: "playing"
        });

        trialStartTime.current = Date.now();
        hasResponded.current = false;
    }, [generateItem]);

    // User responds (clicks "Match!" button)
    const respondMatch = useCallback(() => {
        if (hasResponded.current || !state.currentItem || state.phase !== "playing") return;

        hasResponded.current = true;
        const reactionTime = Date.now() - trialStartTime.current;
        const isCorrect = state.currentItem.isTarget;

        setState(prev => {
            let newStreak = isCorrect ? prev.streak + 1 : 0;
            let newNLevel = prev.nLevel;
            let newMaxNLevel = prev.maxNLevel;

            // Level up if streak reaches threshold
            if (newStreak >= STREAK_THRESHOLD && newNLevel < MAX_N_LEVEL) {
                newNLevel = prev.nLevel + 1;
                newMaxNLevel = Math.max(newMaxNLevel, newNLevel);
                newStreak = 0; // Reset streak after level up
            }

            return {
                ...prev,
                streak: newStreak,
                nLevel: newNLevel,
                maxNLevel: newMaxNLevel,
                correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
                falseAlarmCount: !isCorrect ? prev.falseAlarmCount + 1 : prev.falseAlarmCount,
                reactionTimes: [...prev.reactionTimes, reactionTime],
                score: isCorrect ? prev.score + (100 * newNLevel) : prev.score
            };
        });

        return isCorrect;
    }, [state.currentItem, state.phase]);

    // User doesn't respond (timeout or skip)
    const skipResponse = useCallback(() => {
        if (hasResponded.current || !state.currentItem || state.phase !== "playing") return;

        hasResponded.current = true;
        const isCorrect = !state.currentItem.isTarget; // Correct if it wasn't a target

        setState(prev => {
            let newStreak = isCorrect ? prev.streak + 1 : 0;
            let newNLevel = prev.nLevel;

            // Level up if streak reaches threshold
            if (newStreak >= STREAK_THRESHOLD && newNLevel < MAX_N_LEVEL) {
                newNLevel = prev.nLevel + 1;
                newStreak = 0;
            }

            // Level down on miss (but not below 1)
            if (!isCorrect && prev.nLevel > 1) {
                // Optional: decrease level on repeated misses
                // newNLevel = prev.nLevel - 1;
            }

            return {
                ...prev,
                streak: newStreak,
                nLevel: newNLevel,
                maxNLevel: Math.max(prev.maxNLevel, newNLevel),
                missCount: !isCorrect ? prev.missCount + 1 : prev.missCount,
                correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount
            };
        });

        return isCorrect;
    }, [state.currentItem, state.phase]);

    // Advance to next trial
    const nextTrial = useCallback(() => {
        if (state.phase !== "playing") return;

        setState(prev => {
            const newTotal = prev.totalTrials + 1;

            // Check if game is complete
            if (newTotal >= MAX_TRIALS) {
                return {
                    ...prev,
                    totalTrials: newTotal,
                    isComplete: true,
                    phase: "result" as const,
                    currentItem: null,
                    history: [...prev.history, prev.currentItem!].slice(-MAX_N_LEVEL - 1)
                };
            }

            // Add current item to history
            const newHistory = prev.currentItem
                ? [...prev.history, prev.currentItem].slice(-MAX_N_LEVEL - 1)
                : prev.history;

            // Generate new item
            const newItem = generateItem(newHistory, prev.nLevel);

            return {
                ...prev,
                totalTrials: newTotal,
                history: newHistory,
                currentItem: newItem
            };
        });

        trialStartTime.current = Date.now();
        hasResponded.current = false;
    }, [state.phase, generateItem]);

    // Calculate final metrics
    const calculateMetrics = useCallback((): NBackMetrics => {
        const { correctCount, totalTrials, missCount, falseAlarmCount, reactionTimes, maxNLevel } = state;

        // Accuracy
        const accuracyPercent = totalTrials > 0 ? (correctCount / totalTrials) * 100 : 0;

        // Average reaction time
        const avgReactionTimeMs = reactionTimes.length > 0
            ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
            : 0;

        // D-Prime (Signal Detection Theory)
        // Higher d' means better discrimination between targets and non-targets
        const hitRate = Math.min(0.99, Math.max(0.01,
            correctCount / Math.max(1, correctCount + missCount)));
        const falseAlarmRate = Math.min(0.99, Math.max(0.01,
            falseAlarmCount / Math.max(1, totalTrials - correctCount - missCount)));

        // Z-score approximation using probit function
        const zHit = probit(hitRate);
        const zFa = probit(falseAlarmRate);
        const dPrime = zHit - zFa;

        // Composite Working Memory Score (0-100)
        // Weighted: 40% accuracy, 30% max N-level, 30% d-prime
        const normalizedDPrime = Math.min(1, Math.max(0, (dPrime + 1) / 4)); // Normalize d' to 0-1
        const normalizedNLevel = (maxNLevel - 1) / (MAX_N_LEVEL - 1);
        const normalizedAccuracy = accuracyPercent / 100;

        const workingMemoryScore = Math.round(
            (normalizedAccuracy * 0.4 + normalizedNLevel * 0.3 + normalizedDPrime * 0.3) * 100
        );

        return {
            maxNLevel,
            accuracyPercent: Math.round(accuracyPercent * 10) / 10,
            avgReactionTimeMs: Math.round(avgReactionTimeMs),
            workingMemoryScore,
            dPrime: Math.round(dPrime * 100) / 100
        };
    }, [state]);

    // Reset game
    const resetGame = useCallback(() => {
        setState({
            history: [],
            currentItem: null,
            nLevel: 1,
            maxNLevel: 1,
            streak: 0,
            score: 0,
            totalTrials: 0,
            correctCount: 0,
            incorrectCount: 0,
            missCount: 0,
            falseAlarmCount: 0,
            reactionTimes: [],
            isComplete: false,
            phase: "intro"
        });
    }, []);

    return {
        state,
        startGame,
        respondMatch,
        skipResponse,
        nextTrial,
        calculateMetrics,
        resetGame,
        getNBackItem: () => state.history.length >= state.nLevel
            ? state.history[state.history.length - state.nLevel]
            : null
    };
}

// Probit function approximation (inverse of normal CDF)
function probit(p: number): number {
    // Approximation using Abramowitz & Stegun formula
    const a1 = -39.6968302866538;
    const a2 = 220.946098424521;
    const a3 = -275.928510446969;
    const a4 = 138.357751867269;
    const a5 = -30.6647980661472;
    const a6 = 2.50662827463100;

    const b1 = -54.4760987982241;
    const b2 = 161.585836858041;
    const b3 = -155.698979859887;
    const b4 = 66.8013118877197;
    const b5 = -13.2806815528857;

    const c1 = -7.78489400243029e-3;
    const c2 = -0.322396458041136;
    const c3 = -2.40075827716184;
    const c4 = -2.54973253934373;
    const c5 = 4.37466414146497;
    const c6 = 2.93816398269878;

    const d1 = 7.78469570904146e-3;
    const d2 = 0.32246712907004;
    const d3 = 2.445134137143;
    const d4 = 3.75440866190742;

    const pLow = 0.02425;
    const pHigh = 1 - pLow;

    let q: number, r: number;

    if (p < pLow) {
        q = Math.sqrt(-2 * Math.log(p));
        return (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
            ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    } else if (p <= pHigh) {
        q = p - 0.5;
        r = q * q;
        return (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
            (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    } else {
        q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
            ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }
}

export type { NBackItem, NBackState, NBackMetrics };
