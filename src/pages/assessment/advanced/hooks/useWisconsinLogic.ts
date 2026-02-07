/**
 * 🧠 WISCONSIN CARD SORT LOGIC HOOK
 * ==================================
 * Core logic for the Wisconsin Card Sorting Test (Cognitive Flexibility).
 * 
 * Algorithm:
 * - 4 Target bins with different shape/color/number combinations
 * - Hidden rule changes after N consecutive correct matches
 * - User must infer the new rule from feedback only
 * 
 * Metrics:
 * - Perseverative Errors (using old rule after change)
 * - Categories Completed
 * - Flexibility Index (0-1)
 */

import { useState, useCallback, useRef } from "react";

export type SortRule = "COLOR" | "SHAPE" | "NUMBER";

export interface WisconsinCard {
    id: number;
    shape: "circle" | "square" | "triangle" | "star";
    color: "red" | "blue" | "green" | "yellow";
    count: 1 | 2 | 3 | 4;
}

export interface TargetBin {
    id: number;
    shape: WisconsinCard["shape"];
    color: WisconsinCard["color"];
    count: WisconsinCard["count"];
}

interface WisconsinState {
    currentCard: WisconsinCard | null;
    targetBins: TargetBin[];
    currentRule: SortRule;
    previousRule: SortRule | null;
    totalTrials: number;
    correctCount: number;
    streakForRuleChange: number;
    categoriesCompleted: number;
    perseverativeErrors: number; // Key metric!
    nonPerseverativeErrors: number;
    totalErrors: number;
    ruleChanges: number;
    lastFeedback: "correct" | "incorrect" | null;
    score: number;
    isComplete: boolean;
    phase: "intro" | "playing" | "result";
    showFeedback: boolean;
}

interface WisconsinMetrics {
    perseverativeErrors: number;
    totalErrors: number;
    categoriesCompleted: number;
    flexibilityIndex: number; // 0-1, higher is better
    adaptiveSolverAchieved: boolean; // Flexibility > 0.8
    conceptualLevelResponses: number; // Percentage
}

const SHAPES: WisconsinCard["shape"][] = ["circle", "square", "triangle", "star"];
const COLORS: WisconsinCard["color"][] = ["red", "blue", "green", "yellow"];
const COUNTS: WisconsinCard["count"][] = [1, 2, 3, 4];
const RULES: SortRule[] = ["COLOR", "SHAPE", "NUMBER"];

const MAX_TRIALS = 64; // Standard WCST has 64-128 cards
const CORRECT_FOR_RULE_CHANGE = 5; // Change rule after 5 consecutive correct
const MAX_CATEGORIES = 6; // Complete after 6 category changes

// Fixed target bins (standard WCST setup)
const STANDARD_BINS: TargetBin[] = [
    { id: 0, shape: "triangle", color: "red", count: 1 },
    { id: 1, shape: "star", color: "green", count: 2 },
    { id: 2, shape: "circle", color: "yellow", count: 3 },
    { id: 3, shape: "square", color: "blue", count: 4 }
];

export function useWisconsinLogic() {
    const [state, setState] = useState<WisconsinState>({
        currentCard: null,
        targetBins: STANDARD_BINS,
        currentRule: "COLOR",
        previousRule: null,
        totalTrials: 0,
        correctCount: 0,
        streakForRuleChange: 0,
        categoriesCompleted: 0,
        perseverativeErrors: 0,
        nonPerseverativeErrors: 0,
        totalErrors: 0,
        ruleChanges: 0,
        lastFeedback: null,
        score: 0,
        isComplete: false,
        phase: "intro",
        showFeedback: false
    });

    const cardIdCounter = useRef<number>(0);
    const recentRuleChange = useRef<boolean>(false);
    const trialsSinceRuleChange = useRef<number>(0);

    // Generate a random card
    const generateCard = useCallback((): WisconsinCard => {
        return {
            id: cardIdCounter.current++,
            shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            count: COUNTS[Math.floor(Math.random() * COUNTS.length)]
        };
    }, []);

    // Get a new random rule (different from current)
    const getNewRule = useCallback((currentRule: SortRule): SortRule => {
        const availableRules = RULES.filter(r => r !== currentRule);
        return availableRules[Math.floor(Math.random() * availableRules.length)];
    }, []);

    // Check if card matches bin by a specific rule
    const matchesByRule = useCallback((card: WisconsinCard, bin: TargetBin, rule: SortRule): boolean => {
        switch (rule) {
            case "COLOR":
                return card.color === bin.color;
            case "SHAPE":
                return card.shape === bin.shape;
            case "NUMBER":
                return card.count === bin.count;
        }
    }, []);

    // Find which bin is correct for current rule
    const findCorrectBin = useCallback((card: WisconsinCard, rule: SortRule): number => {
        return STANDARD_BINS.findIndex(bin => matchesByRule(card, bin, rule));
    }, [matchesByRule]);

    // Start the game
    const startGame = useCallback(() => {
        cardIdCounter.current = 0;
        recentRuleChange.current = false;
        trialsSinceRuleChange.current = 0;

        const firstCard = generateCard();
        const initialRule = RULES[Math.floor(Math.random() * RULES.length)];

        setState({
            currentCard: firstCard,
            targetBins: STANDARD_BINS,
            currentRule: initialRule,
            previousRule: null,
            totalTrials: 0,
            correctCount: 0,
            streakForRuleChange: 0,
            categoriesCompleted: 0,
            perseverativeErrors: 0,
            nonPerseverativeErrors: 0,
            totalErrors: 0,
            ruleChanges: 0,
            lastFeedback: null,
            score: 0,
            isComplete: false,
            phase: "playing",
            showFeedback: false
        });
    }, [generateCard]);

    // User selects a bin
    const selectBin = useCallback((binIndex: number) => {
        if (!state.currentCard || state.phase !== "playing" || state.showFeedback) return null;

        const { currentCard, currentRule, previousRule } = state;
        const correctBinIndex = findCorrectBin(currentCard, currentRule);
        const isCorrect = binIndex === correctBinIndex;

        // Check for perseverative error
        let isPerseverative = false;
        if (!isCorrect && previousRule && recentRuleChange.current) {
            // Did they sort by the OLD rule?
            const oldRuleMatch = matchesByRule(
                currentCard,
                STANDARD_BINS[binIndex],
                previousRule
            );
            if (oldRuleMatch) {
                isPerseverative = true;
            }
        }

        trialsSinceRuleChange.current++;

        setState(prev => {
            let newStreak = isCorrect ? prev.streakForRuleChange + 1 : 0;
            let newRule = prev.currentRule;
            let newPreviousRule = prev.previousRule;
            let newCategoriesCompleted = prev.categoriesCompleted;
            let newRuleChanges = prev.ruleChanges;

            // Check for rule change
            if (newStreak >= CORRECT_FOR_RULE_CHANGE) {
                newPreviousRule = prev.currentRule;
                newRule = getNewRule(prev.currentRule);
                newCategoriesCompleted++;
                newRuleChanges++;
                newStreak = 0;
                recentRuleChange.current = true;
                trialsSinceRuleChange.current = 0;
            }

            // After 3 trials since rule change, consider perseverative window closed
            if (trialsSinceRuleChange.current > 3) {
                recentRuleChange.current = false;
            }

            return {
                ...prev,
                streakForRuleChange: newStreak,
                currentRule: newRule,
                previousRule: newPreviousRule,
                categoriesCompleted: newCategoriesCompleted,
                ruleChanges: newRuleChanges,
                correctCount: isCorrect ? prev.correctCount + 1 : prev.correctCount,
                totalErrors: !isCorrect ? prev.totalErrors + 1 : prev.totalErrors,
                perseverativeErrors: isPerseverative ? prev.perseverativeErrors + 1 : prev.perseverativeErrors,
                nonPerseverativeErrors: (!isCorrect && !isPerseverative) ? prev.nonPerseverativeErrors + 1 : prev.nonPerseverativeErrors,
                lastFeedback: isCorrect ? "correct" : "incorrect",
                showFeedback: true,
                score: isCorrect ? prev.score + 100 : prev.score
            };
        });

        return isCorrect;
    }, [state, findCorrectBin, matchesByRule, getNewRule]);

    // Clear feedback and advance to next trial
    const nextTrial = useCallback(() => {
        if (state.phase !== "playing") return;

        setState(prev => {
            const newTotal = prev.totalTrials + 1;

            // Check if game is complete
            if (newTotal >= MAX_TRIALS || prev.categoriesCompleted >= MAX_CATEGORIES) {
                return {
                    ...prev,
                    totalTrials: newTotal,
                    isComplete: true,
                    phase: "result" as const,
                    currentCard: null,
                    showFeedback: false
                };
            }

            // Generate new card
            const newCard = generateCard();

            return {
                ...prev,
                totalTrials: newTotal,
                currentCard: newCard,
                showFeedback: false,
                lastFeedback: null
            };
        });
    }, [state.phase, generateCard]);

    // Calculate final metrics
    const calculateMetrics = useCallback((): WisconsinMetrics => {
        const {
            perseverativeErrors,
            totalErrors,
            categoriesCompleted,
            correctCount,
            totalTrials
        } = state;

        // Flexibility Index: Based on categories completed and low perseverative errors
        // Formula: (categories / max_categories) * (1 - perseverative_rate)
        const perseverativeRate = totalTrials > 0 ? perseverativeErrors / totalTrials : 0;
        const categoryScore = categoriesCompleted / MAX_CATEGORIES;
        const flexibilityIndex = Math.round(
            categoryScore * (1 - perseverativeRate) * 100
        ) / 100;

        // Conceptual Level Responses: Correct responses in runs of 3+
        const conceptualLevelResponses = totalTrials > 0
            ? Math.round((correctCount / totalTrials) * 100)
            : 0;

        // Adaptive Solver achievement
        const adaptiveSolverAchieved = flexibilityIndex > 0.8;

        return {
            perseverativeErrors,
            totalErrors,
            categoriesCompleted,
            flexibilityIndex,
            adaptiveSolverAchieved,
            conceptualLevelResponses
        };
    }, [state]);

    // Reset game
    const resetGame = useCallback(() => {
        setState({
            currentCard: null,
            targetBins: STANDARD_BINS,
            currentRule: "COLOR",
            previousRule: null,
            totalTrials: 0,
            correctCount: 0,
            streakForRuleChange: 0,
            categoriesCompleted: 0,
            perseverativeErrors: 0,
            nonPerseverativeErrors: 0,
            totalErrors: 0,
            ruleChanges: 0,
            lastFeedback: null,
            score: 0,
            isComplete: false,
            phase: "intro",
            showFeedback: false
        });
        recentRuleChange.current = false;
        trialsSinceRuleChange.current = 0;
    }, []);

    return {
        state,
        startGame,
        selectBin,
        nextTrial,
        calculateMetrics,
        resetGame
    };
}

export type { WisconsinCard, TargetBin, WisconsinState, WisconsinMetrics };
