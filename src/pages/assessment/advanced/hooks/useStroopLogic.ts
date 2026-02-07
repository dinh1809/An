/**
 * 🧠 STROOP LOGIC HOOK
 * ====================
 * Core logic for the Stroop test (Inhibition Control).
 * 
 * Algorithm:
 * - Display words "GO" or "STOP" in conflicting colors
 * - Rule: Follow COLOR, ignore TEXT
 *   - Green = Click/Respond
 *   - Red = Don't Click/Withhold
 * 
 * Metrics:
 * - Impulse Errors (clicking when Red)
 * - Reaction Time (ms)
 * - Inhibition Control Score
 */

import { useState, useCallback, useRef } from "react";

export interface StroopItem {
    id: number;
    word: "GO" | "STOP" | "WAIT";
    color: "green" | "red" | "yellow";
    shouldRespond: boolean; // True if color is green
    isCongruent: boolean; // Word matches color meaning
}

interface StroopState {
    currentItem: StroopItem | null;
    totalTrials: number;
    correctCount: number;
    impulseErrors: number; // Clicked when should stop (Red)
    omissionErrors: number; // Didn't click when should go (Green)
    congruentTrials: number;
    incongruentTrials: number;
    congruentCorrect: number;
    incongruentCorrect: number;
    reactionTimes: number[];
    congruentReactionTimes: number[];
    incongruentReactionTimes: number[];
    score: number;
    streak: number;
    speedMultiplier: number; // Increases difficulty
    isComplete: boolean;
    phase: "intro" | "playing" | "result";
    isOverdriveMode: boolean; // Visual effect when speed is high
}

interface StroopMetrics {
    impulseErrorRate: number; // Percentage
    avgReactionTimeMs: number;
    inhibitionScore: number; // 0-100
    stroopEffect: number; // Difference between incongruent and congruent RT
    zenMasterAchieved: boolean; // Impulse errors < 10%
}

const WORDS: StroopItem["word"][] = ["GO", "STOP", "WAIT"];
const COLORS: StroopItem["color"][] = ["green", "red", "yellow"];

const MAX_TRIALS = 40;
const INITIAL_DISPLAY_TIME = 1500; // ms
const MIN_DISPLAY_TIME = 600; // ms at max speed
const SPEED_INCREMENT = 50; // ms faster per correct streak
const STREAK_FOR_SPEEDUP = 3;

export function useStroopLogic() {
    const [state, setState] = useState<StroopState>({
        currentItem: null,
        totalTrials: 0,
        correctCount: 0,
        impulseErrors: 0,
        omissionErrors: 0,
        congruentTrials: 0,
        incongruentTrials: 0,
        congruentCorrect: 0,
        incongruentCorrect: 0,
        reactionTimes: [],
        congruentReactionTimes: [],
        incongruentReactionTimes: [],
        score: 0,
        streak: 0,
        speedMultiplier: 1,
        isComplete: false,
        phase: "intro",
        isOverdriveMode: false
    });

    const trialStartTime = useRef<number>(0);
    const hasResponded = useRef<boolean>(false);
    const itemIdCounter = useRef<number>(0);
    const displayTimeRef = useRef<number>(INITIAL_DISPLAY_TIME);

    // Generate a Stroop item with controlled congruency
    const generateItem = useCallback((trialNum: number): StroopItem => {
        // Ensure mix of congruent (30%) and incongruent (70%) trials
        const isCongruent = Math.random() < 0.3;

        let word: StroopItem["word"];
        let color: StroopItem["color"];

        if (isCongruent) {
            // Word matches color meaning
            const idx = Math.floor(Math.random() * 3);
            word = WORDS[idx];
            color = COLORS[idx];
        } else {
            // Incongruent: Word conflicts with color
            const wordIdx = Math.floor(Math.random() * 3);
            let colorIdx: number;
            do {
                colorIdx = Math.floor(Math.random() * 3);
            } while (colorIdx === wordIdx);

            word = WORDS[wordIdx];
            color = COLORS[colorIdx];
        }

        // shouldRespond based on COLOR only
        const shouldRespond = color === "green";

        return {
            id: itemIdCounter.current++,
            word,
            color,
            shouldRespond,
            isCongruent
        };
    }, []);

    // Start the game
    const startGame = useCallback(() => {
        itemIdCounter.current = 0;
        displayTimeRef.current = INITIAL_DISPLAY_TIME;
        const firstItem = generateItem(0);

        setState({
            currentItem: firstItem,
            totalTrials: 0,
            correctCount: 0,
            impulseErrors: 0,
            omissionErrors: 0,
            congruentTrials: 0,
            incongruentTrials: 0,
            congruentCorrect: 0,
            incongruentCorrect: 0,
            reactionTimes: [],
            congruentReactionTimes: [],
            incongruentReactionTimes: [],
            score: 0,
            streak: 0,
            speedMultiplier: 1,
            isComplete: false,
            phase: "playing",
            isOverdriveMode: false
        });

        trialStartTime.current = Date.now();
        hasResponded.current = false;
    }, [generateItem]);

    // User clicks (responds)
    const respond = useCallback(() => {
        if (hasResponded.current || !state.currentItem || state.phase !== "playing") return null;

        hasResponded.current = true;
        const reactionTime = Date.now() - trialStartTime.current;
        const { currentItem } = state;
        const isCorrect = currentItem.shouldRespond; // Correct if should respond

        setState(prev => {
            const newStreak = isCorrect ? prev.streak + 1 : 0;
            let newSpeedMultiplier = prev.speedMultiplier;
            let newOverdrive = prev.isOverdriveMode;

            // Increase speed on streak
            if (newStreak > 0 && newStreak % STREAK_FOR_SPEEDUP === 0) {
                newSpeedMultiplier = Math.min(2, prev.speedMultiplier + 0.1);
                displayTimeRef.current = Math.max(
                    MIN_DISPLAY_TIME,
                    INITIAL_DISPLAY_TIME - (newSpeedMultiplier - 1) * 500
                );

                // Activate overdrive mode at high speed
                if (newSpeedMultiplier >= 1.5) {
                    newOverdrive = true;
                }
            }

            // Track congruent vs incongruent
            const isCongruent = currentItem.isCongruent;

            return {
                ...prev,
                streak: newStreak,
                speedMultiplier: newSpeedMultiplier,
                isOverdriveMode: newOverdrive,
                correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
                impulseErrors: !isCorrect ? prev.impulseErrors + 1 : prev.impulseErrors,
                reactionTimes: [...prev.reactionTimes, reactionTime],
                congruentTrials: isCongruent ? prev.congruentTrials + 1 : prev.congruentTrials,
                incongruentTrials: !isCongruent ? prev.incongruentTrials + 1 : prev.incongruentTrials,
                congruentCorrect: isCongruent && isCorrect ? prev.congruentCorrect + 1 : prev.congruentCorrect,
                incongruentCorrect: !isCongruent && isCorrect ? prev.incongruentCorrect + 1 : prev.incongruentCorrect,
                congruentReactionTimes: isCongruent ? [...prev.congruentReactionTimes, reactionTime] : prev.congruentReactionTimes,
                incongruentReactionTimes: !isCongruent ? [...prev.incongruentReactionTimes, reactionTime] : prev.incongruentReactionTimes,
                score: isCorrect ? prev.score + Math.round(100 * newSpeedMultiplier) : prev.score
            };
        });

        return isCorrect;
    }, [state.currentItem, state.phase]);

    // User doesn't respond (timeout/withhold)
    const withhold = useCallback(() => {
        if (hasResponded.current || !state.currentItem || state.phase !== "playing") return null;

        hasResponded.current = true;
        const { currentItem } = state;
        const isCorrect = !currentItem.shouldRespond; // Correct if should NOT respond

        setState(prev => {
            const newStreak = isCorrect ? prev.streak + 1 : 0;
            const isCongruent = currentItem.isCongruent;

            return {
                ...prev,
                streak: newStreak,
                correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
                omissionErrors: !isCorrect ? prev.omissionErrors + 1 : prev.omissionErrors,
                congruentTrials: isCongruent ? prev.congruentTrials + 1 : prev.congruentTrials,
                incongruentTrials: !isCongruent ? prev.incongruentTrials + 1 : prev.incongruentTrials,
                congruentCorrect: isCongruent && isCorrect ? prev.congruentCorrect + 1 : prev.congruentCorrect,
                incongruentCorrect: !isCongruent && isCorrect ? prev.incongruentCorrect + 1 : prev.incongruentCorrect,
                score: isCorrect ? prev.score + 50 : prev.score
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
                    currentItem: null
                };
            }

            // Generate new item
            const newItem = generateItem(newTotal);

            return {
                ...prev,
                totalTrials: newTotal,
                currentItem: newItem
            };
        });

        trialStartTime.current = Date.now();
        hasResponded.current = false;
    }, [state.phase, generateItem]);

    // Calculate final metrics
    const calculateMetrics = useCallback((): StroopMetrics => {
        const {
            impulseErrors,
            totalTrials,
            reactionTimes,
            congruentReactionTimes,
            incongruentReactionTimes
        } = state;

        // Impulse error rate
        const totalNoGoTrials = totalTrials - reactionTimes.length + impulseErrors;
        const impulseErrorRate = totalNoGoTrials > 0
            ? (impulseErrors / totalNoGoTrials) * 100
            : 0;

        // Average reaction time
        const avgReactionTimeMs = reactionTimes.length > 0
            ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
            : 0;

        // Stroop effect (RT difference)
        const avgCongruentRT = congruentReactionTimes.length > 0
            ? congruentReactionTimes.reduce((a, b) => a + b, 0) / congruentReactionTimes.length
            : 0;
        const avgIncongruentRT = incongruentReactionTimes.length > 0
            ? incongruentReactionTimes.reduce((a, b) => a + b, 0) / incongruentReactionTimes.length
            : 0;
        const stroopEffect = avgIncongruentRT - avgCongruentRT;

        // Inhibition Score (0-100)
        // Based on: low impulse errors, fast RT, handling of incongruent trials
        const errorPenalty = Math.min(50, impulseErrorRate * 2);
        const speedBonus = Math.max(0, (800 - avgReactionTimeMs) / 10);
        const inhibitionScore = Math.round(
            Math.max(0, Math.min(100, 100 - errorPenalty + speedBonus))
        );

        // Zen Master achievement
        const zenMasterAchieved = impulseErrorRate < 10;

        return {
            impulseErrorRate: Math.round(impulseErrorRate * 10) / 10,
            avgReactionTimeMs: Math.round(avgReactionTimeMs),
            inhibitionScore,
            stroopEffect: Math.round(stroopEffect),
            zenMasterAchieved
        };
    }, [state]);

    // Get current display time (for timer)
    const getDisplayTime = useCallback(() => {
        return displayTimeRef.current;
    }, []);

    // Reset game
    const resetGame = useCallback(() => {
        displayTimeRef.current = INITIAL_DISPLAY_TIME;
        setState({
            currentItem: null,
            totalTrials: 0,
            correctCount: 0,
            impulseErrors: 0,
            omissionErrors: 0,
            congruentTrials: 0,
            incongruentTrials: 0,
            congruentCorrect: 0,
            incongruentCorrect: 0,
            reactionTimes: [],
            congruentReactionTimes: [],
            incongruentReactionTimes: [],
            score: 0,
            streak: 0,
            speedMultiplier: 1,
            isComplete: false,
            phase: "intro",
            isOverdriveMode: false
        });
    }, []);

    return {
        state,
        startGame,
        respond,
        withhold,
        nextTrial,
        calculateMetrics,
        getDisplayTime,
        resetGame
    };
}

export type { StroopItem, StroopState, StroopMetrics };
