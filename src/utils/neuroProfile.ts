/**
 * Neuro-Profile Calculator
 * Aggregates game session data into Howard Gardner's Multiple Intelligences
 */

interface StroopMetrics {
  total_trials?: number;
  stroop_interference_score?: number;
  switch_cost_ms?: number;
  accuracy_congruent?: number;
  accuracy_incongruent?: number;
  perseverative_errors?: number;
  total_switches?: number;
}

interface SequenceMetrics {
  max_span_reached?: number;
  max_forward_span?: number;
  max_reverse_span?: number;
  total_errors?: number;
  memory_type?: string;
  distraction_resistance?: "High" | "Medium" | "Low";
}

export interface GameSession {
  id: string;
  game_type: string;
  final_score: number | null;
  accuracy_percentage: number | null;
  avg_reaction_time_ms: number | null;
  difficulty_level_reached: number | null;
  completed_at: string | null;
  metrics?: StroopMetrics | SequenceMetrics | null;
}

export interface NeuroProfile {
  visualSpatial: number;      // Trí thông minh Không gian
  logicalMathematical: number; // Trí thông minh Logic
  bodilyKinesthetic: number;  // Trí thông minh Vận động
  linguistic: number;         // Trí thông minh Ngôn ngữ
  musical: number;            // Trí thông minh Âm nhạc
}

export interface IntelligenceData {
  subject: string;
  subjectVi: string;
  score: number;
  fullMark: number;
  description: string;
}

export interface TopStrength {
  name: string;
  nameVi: string;
  score: number;
  recommendation: string;
  careers: string[];
}

/**
 * Filter and get the latest session for each game type
 */
function getLatestSessions(sessions: GameSession[]): {
  detailSpotter: GameSession | null;
  chaosSwitcher: GameSession | null;
  sequenceMaster: GameSession | null;
} {
  const sortedByDate = [...sessions]
    .filter(s => s.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

  return {
    detailSpotter: sortedByDate.find(s => s.game_type === "detail_spotter") || null,
    chaosSwitcher: sortedByDate.find(s => s.game_type === "stroop_chaos") || null,
    sequenceMaster: sortedByDate.find(s => s.game_type === "sequence_memory") || null,
  };
}

/**
 * Calculate the 5-point Neuro Profile based on Gardner's Multiple Intelligences
 */
export function calculateNeuroProfile(sessions: GameSession[]): NeuroProfile {
  const latest = getLatestSessions(sessions);
  
  // Extract metrics
  const g1Accuracy = latest.detailSpotter?.accuracy_percentage ?? 0;
  const g1ReactionTime = latest.detailSpotter?.avg_reaction_time_ms ?? 0;
  
  const stroopMetrics = latest.chaosSwitcher?.metrics as StroopMetrics | null;
  const g2Accuracy = latest.chaosSwitcher?.accuracy_percentage ?? 0;
  const g2IncongruentAccuracy = stroopMetrics?.accuracy_incongruent ?? g2Accuracy;
  const g2StroopInterference = stroopMetrics?.stroop_interference_score ?? 0;
  const g2ReactionTime = latest.chaosSwitcher?.avg_reaction_time_ms ?? 0;
  
  const seqMetrics = latest.sequenceMaster?.metrics as SequenceMetrics | null;
  const g3MaxSpan = Math.max(
    seqMetrics?.max_forward_span ?? 0,
    seqMetrics?.max_reverse_span ?? 0,
    seqMetrics?.max_span_reached ?? 0
  );
  const g3ForwardSpan = seqMetrics?.max_forward_span ?? seqMetrics?.max_span_reached ?? 0;
  const g3ReverseSpan = seqMetrics?.max_reverse_span ?? 0;
  
  // Calculate average reaction time across all games (excluding 0 values)
  const reactionTimes = [g1ReactionTime, g2ReactionTime].filter(rt => rt > 0);
  const avgReactionTime = reactionTimes.length > 0 
    ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length 
    : 1000;
  
  // 1. Visual-Spatial (Trí thông minh Không gian)
  // Inputs: Detail Spotter (Accuracy) + Sequence Master (Max Span)
  // Formula: (G1_Accuracy + (G3_Max_Span * 10)) / 2
  const visualSpatial = Math.min(100, Math.max(0, (g1Accuracy + (g3MaxSpan * 10)) / 2));
  
  // 2. Logical-Mathematical (Trí thông minh Logic)
  // Inputs: Chaos Switcher (Incongruent Accuracy) + Sequence Master (Reverse Span)
  // Formula: (G2_Stroop_Accuracy + (G3_Reverse_Span * 15)) / 2
  const logicalMathematical = Math.min(100, Math.max(0, (g2IncongruentAccuracy + (g3ReverseSpan * 15)) / 2));
  
  // 3. Bodily-Kinesthetic (Trí thông minh Vận động)
  // Inputs: Reaction Time across ALL games
  // Formula: 100 - (Average_Reaction_Time_ms / 20). Cap at 100.
  const bodilyKinesthetic = Math.min(100, Math.max(0, 100 - (avgReactionTime / 20)));
  
  // 4. Linguistic (Trí thông minh Ngôn ngữ)
  // Inputs: Chaos Switcher (Stroop Interference Score)
  // Lower interference = better linguistic processing
  // Formula: 100 - (interference / 5), capped
  const linguistic = Math.min(100, Math.max(0, 100 - (g2StroopInterference / 5)));
  
  // 5. Musical (Trí thông minh Âm nhạc)
  // Inputs: Sequence Master (Forward Span)
  // The game uses distinct audio notes. Success implies auditory memory.
  // Formula: Forward_Span * 12, capped at 100
  const musical = Math.min(100, Math.max(0, g3ForwardSpan * 12));
  
  return {
    visualSpatial: Math.round(visualSpatial),
    logicalMathematical: Math.round(logicalMathematical),
    bodilyKinesthetic: Math.round(bodilyKinesthetic),
    linguistic: Math.round(linguistic),
    musical: Math.round(musical),
  };
}

/**
 * Convert NeuroProfile to chart data format
 */
export function getRadarChartData(profile: NeuroProfile): IntelligenceData[] {
  return [
    {
      subject: "Visual-Spatial",
      subjectVi: "Không gian",
      score: profile.visualSpatial,
      fullMark: 100,
      description: "Khả năng hình dung và xử lý hình ảnh, mẫu hình trong không gian",
    },
    {
      subject: "Logical-Math",
      subjectVi: "Logic",
      score: profile.logicalMathematical,
      fullMark: 100,
      description: "Khả năng suy luận, phân tích và xử lý số liệu",
    },
    {
      subject: "Bodily",
      subjectVi: "Vận động",
      score: profile.bodilyKinesthetic,
      fullMark: 100,
      description: "Khả năng phối hợp tay-mắt và phản xạ nhanh",
    },
    {
      subject: "Linguistic",
      subjectVi: "Ngôn ngữ",
      score: profile.linguistic,
      fullMark: 100,
      description: "Khả năng xử lý và nhận diện ngôn ngữ nhanh chóng",
    },
    {
      subject: "Musical",
      subjectVi: "Âm nhạc",
      score: profile.musical,
      fullMark: 100,
      description: "Khả năng ghi nhớ và xử lý chuỗi âm thanh",
    },
  ];
}

/**
 * Get the top strength with career recommendations
 */
export function getTopStrength(profile: NeuroProfile): TopStrength {
  const strengths: { key: keyof NeuroProfile; name: string; nameVi: string; careers: string[]; recommendation: string }[] = [
    {
      key: "visualSpatial",
      name: "Visual-Spatial",
      nameVi: "Không gian - Thị giác",
      careers: ["Thiết kế đồ họa", "Kiến trúc sư", "Nhiếp ảnh gia", "Kỹ thuật viên CAD"],
      recommendation: "Phù hợp với công việc đòi hỏi quan sát chi tiết và tư duy không gian.",
    },
    {
      key: "logicalMathematical",
      name: "Logical-Mathematical",
      nameVi: "Logic - Toán học",
      careers: ["Lập trình viên Python", "Kỹ thuật viên dữ liệu", "Phân tích viên", "Kế toán"],
      recommendation: "Phù hợp với lộ trình đào tạo lập trình hoặc phân tích dữ liệu.",
    },
    {
      key: "bodilyKinesthetic",
      name: "Bodily-Kinesthetic",
      nameVi: "Vận động - Thể chất",
      careers: ["Kỹ thuật viên sửa chữa", "Thợ thủ công", "Nhân viên lắp ráp", "Vận động viên"],
      recommendation: "Phù hợp công việc đòi hỏi sự khéo léo và phản xạ nhanh.",
    },
    {
      key: "linguistic",
      name: "Linguistic",
      nameVi: "Ngôn ngữ",
      careers: ["Biên tập viên", "Nhân viên hỗ trợ khách hàng", "Thư ký", "Copywriter"],
      recommendation: "Phù hợp với công việc liên quan đến giao tiếp và xử lý văn bản.",
    },
    {
      key: "musical",
      name: "Musical",
      nameVi: "Âm nhạc - Thính giác",
      careers: ["Kỹ thuật viên âm thanh", "Pha chế (Barista)", "DJ", "Nhạc công"],
      recommendation: "Phù hợp với môi trường cần cảm nhận âm thanh và nhịp điệu.",
    },
  ];

  // Find the highest scoring intelligence
  let topStrength = strengths[0];
  let maxScore = profile[strengths[0].key];

  for (const strength of strengths) {
    if (profile[strength.key] > maxScore) {
      maxScore = profile[strength.key];
      topStrength = strength;
    }
  }

  return {
    name: topStrength.name,
    nameVi: topStrength.nameVi,
    score: maxScore,
    recommendation: topStrength.recommendation,
    careers: topStrength.careers,
  };
}

/**
 * Get all strengths sorted by score (for detailed analysis)
 */
export function getAllStrengthsSorted(profile: NeuroProfile): { name: string; nameVi: string; score: number }[] {
  const mapping: { key: keyof NeuroProfile; name: string; nameVi: string }[] = [
    { key: "visualSpatial", name: "Visual-Spatial", nameVi: "Không gian" },
    { key: "logicalMathematical", name: "Logical-Math", nameVi: "Logic" },
    { key: "bodilyKinesthetic", name: "Bodily", nameVi: "Vận động" },
    { key: "linguistic", name: "Linguistic", nameVi: "Ngôn ngữ" },
    { key: "musical", name: "Musical", nameVi: "Âm nhạc" },
  ];

  return mapping
    .map(m => ({ name: m.name, nameVi: m.nameVi, score: profile[m.key] }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Check if user has completed any games
 */
export function hasCompletedGames(sessions: GameSession[]): boolean {
  return sessions.some(s => s.completed_at !== null);
}

/**
 * Get completion status for each game
 */
export function getGameCompletionStatus(sessions: GameSession[]): {
  detailSpotter: boolean;
  chaosSwitcher: boolean;
  sequenceMaster: boolean;
  total: number;
} {
  const latest = getLatestSessions(sessions);
  const detailSpotter = latest.detailSpotter !== null;
  const chaosSwitcher = latest.chaosSwitcher !== null;
  const sequenceMaster = latest.sequenceMaster !== null;
  
  return {
    detailSpotter,
    chaosSwitcher,
    sequenceMaster,
    total: [detailSpotter, chaosSwitcher, sequenceMaster].filter(Boolean).length,
  };
}
