import { Zap } from "lucide-react";

// --- 1. CORE TYPES ---

export type RavenShape = 'circle' | 'square' | 'line_vertical' | 'line_horizontal' | 'cross';
export type RavenPosition = 'center' | 'top_left' | 'bottom_right';

export interface VisualLayer {
    shape: RavenShape;
    position: RavenPosition;
    mask: boolean; // Determines visibility (Logic Bit)
}

export interface RavenCellData {
    layers: VisualLayer[];
    isEmpty?: boolean; // For the target slot
    isOption?: boolean; // For display in options list
}

export interface RavenProblem {
    id: string;
    grid: RavenCellData[][]; // 3x3 Grid
    options: RavenCellData[]; // 6 Options
    correctIndex: number;
    ruleDescription: string;
    explanation: string; // User-facing logic explanation
}

// --- 2. THE UNIVERSE OF LAYERS ---
// We define a standard set of "Potential Layers" that every cell *could* have.
// Total 15 bits (5 shapes * 3 positions).
const SHAPES: RavenShape[] = ['circle', 'square', 'line_vertical', 'line_horizontal', 'cross'];
const POSITIONS: RavenPosition[] = ['center', 'top_left', 'bottom_right'];

// Generate the "Universe" template - all possible layers with mask=false
const createEmptyLayers = (): VisualLayer[] => {
    const layers: VisualLayer[] = [];
    for (const pos of POSITIONS) {
        for (const shape of SHAPES) {
            layers.push({ shape, position: pos, mask: false });
        }
    }
    return layers;
};

// --- 3. PSEUDO-RANDOM NUMBER GENERATOR (Seeding) ---
class PRNG {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    // Linear Congruential Generator
    next(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    // Range [min, max)
    range(min: number, max: number): number {
        return Math.floor(this.next() * (max - min) + min);
    }

    pick<T>(array: T[]): T {
        return array[this.range(0, array.length)];
    }

    // Randomize a limited number of bits in the layer vector
    randomizeLayers(complexity: number): VisualLayer[] {
        const layers = createEmptyLayers();
        // Determine how many bits to flip to 1 (active)
        // Complexity 1 -> 1-2 bits. Complexity 2 -> 2-3 bits.
        const numActive = this.range(1 + complexity, 3 + complexity);

        for (let i = 0; i < numActive; i++) {
            const idx = this.range(0, layers.length);
            layers[idx].mask = true;
        }
        return layers;
    }
}

// --- 4. LOGIC GATES ENGINE ---

const applyLogic = (cellA: RavenCellData, cellB: RavenCellData, op: 'XOR' | 'AND' | 'UNION'): RavenCellData => {
    const resultLayers = createEmptyLayers();

    // We assume standard order of layers matches because we always generate from createEmptyLayers
    for (let i = 0; i < resultLayers.length; i++) {
        const bitA = cellA.layers[i].mask;
        const bitB = cellB.layers[i].mask;
        let resultBit = false;

        switch (op) {
            case 'XOR':
                resultBit = bitA !== bitB;
                break;
            case 'AND':
                resultBit = bitA && bitB;
                break;
            case 'UNION': // OR
                resultBit = bitA || bitB;
                break;
        }

        resultLayers[i].mask = resultBit;
    }

    return { layers: resultLayers };
};

// --- 5. MAIN GENERATOR ---

export const generateHardRavenProblem = (seed: number = Date.now(), difficulty: 'easy' | 'hard' = 'hard'): RavenProblem => {
    const rng = new PRNG(seed);
    const rules = ['XOR', 'AND', 'UNION'] as const;
    const currentRule = rng.pick([...rules]); // Choose one rule for the whole matrix (or per row?)
    // Usually Raven matrices use the SAME rule for all rows to establish pattern.

    // Grid 3x3
    const grid: RavenCellData[][] = [];

    // Generate Row 1 and Row 2 completely
    for (let r = 0; r < 2; r++) {
        const cell1 = { layers: rng.randomizeLayers(difficulty === 'hard' ? 2 : 1) };
        const cell2 = { layers: rng.randomizeLayers(difficulty === 'hard' ? 2 : 1) };
        const cell3 = applyLogic(cell1, cell2, currentRule);
        grid.push([cell1, cell2, cell3]);
    }

    // Generate Row 3 Logic
    // Problem: If we just random C1 and C2, C3 is deterministic.
    const r3c1 = { layers: rng.randomizeLayers(difficulty === 'hard' ? 2 : 1) };
    const r3c2 = { layers: rng.randomizeLayers(difficulty === 'hard' ? 2 : 1) };
    const correctLimit = applyLogic(r3c1, r3c2, currentRule);

    // Push Row 3 to grid (last cell is empty/question)
    grid.push([
        r3c1,
        r3c2,
        { layers: [], isEmpty: true } // Placeholder
    ]);

    // --- GENERATE OPTIONS ---
    const options: RavenCellData[] = [];
    const correctIndex = rng.range(0, 6);

    for (let i = 0; i < 6; i++) {
        if (i === correctIndex) {
            options.push({ ...correctLimit, isOption: true });
        } else {
            // Create distractor by flipping bits of the correct answer
            const distractorLayers = correctLimit.layers.map(l => ({ ...l })); // Deep copy

            // How many bits to flip?
            const numFlips = rng.range(1, 3);
            for (let f = 0; f < numFlips; f++) {
                const bitIdx = rng.range(0, distractorLayers.length);
                distractorLayers[bitIdx].mask = !distractorLayers[bitIdx].mask;
            }
            options.push({ layers: distractorLayers, isOption: true });
        }
    }

    // --- GENERATE EXPLANATION ---
    let explanation = "Logic unknown.";
    switch (currentRule) {
        case 'XOR':
            explanation = "Logic XOR: Overlapping lines disappear, unique lines remain.";
            break;
        case 'AND':
            explanation = "Logic Intersection: Only lines present in both cells remain.";
            break;
        case 'UNION':
            explanation = "Logic Union: Combine all lines from both cells.";
            break;
    }

    return {
        id: `RAVEN-${seed}-${difficulty}`,
        grid,
        options,
        correctIndex,
        ruleDescription: `Rule: ${currentRule}`,
        explanation
    };
};
