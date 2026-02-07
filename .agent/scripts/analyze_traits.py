"""
🧠 ADVANCED COGNITIVE TRAIT ANALYZER
=====================================
Analyzes deep cognitive metrics from advanced assessment games:
- N-Back (Working Memory)
- Stroop (Inhibition Control)  
- Wisconsin Card Sort (Cognitive Flexibility)

Outputs:
- Trait Classification (Intellectual Processor, Zen Master, Adaptive Solver)
- Composite Cognitive Profile
- Recommendations for Growth Plan

Ethical Constraints:
- Vietnamese language output
- No medical/diagnostic terms
- Supportive, strength-based framing
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple
from enum import Enum
import json

# ============================================================================
# DATA MODELS
# ============================================================================

class Trait(Enum):
    """Special cognitive traits based on assessment performance."""
    INTELLECTUAL_PROCESSOR = "intellectual_processor"  # High working memory
    ZEN_MASTER = "zen_master"  # High inhibition control
    ADAPTIVE_SOLVER = "adaptive_solver"  # High flexibility
    PATTERN_SEEKER = "pattern_seeker"  # High visual-logic combo
    HYPER_FOCUS = "hyper_focus"  # Low impulse + high accuracy
    CREATIVE_THINKER = "creative_thinker"  # High flexibility + below-average structure


@dataclass
class NBackMetrics:
    """Metrics from N-Back (TimeWarpCargo) game."""
    max_n_level: int = 1
    accuracy_percent: float = 0.0
    avg_reaction_time_ms: int = 0
    working_memory_score: int = 0
    d_prime: float = 0.0


@dataclass
class StroopMetrics:
    """Metrics from Stroop (CommandOverride) game."""
    impulse_error_rate: float = 0.0
    avg_reaction_time_ms: int = 0
    inhibition_score: int = 0
    stroop_effect: int = 0
    zen_master_achieved: bool = False


@dataclass
class WisconsinMetrics:
    """Metrics from Wisconsin Card Sort (FluxMatrix) game."""
    perseverative_errors: int = 0
    total_errors: int = 0
    categories_completed: int = 0
    flexibility_index: float = 0.0
    adaptive_solver_achieved: bool = False
    conceptual_level_responses: int = 0


@dataclass
class AdvancedCognitiveProfile:
    """Complete cognitive profile from all advanced assessments."""
    # Raw metrics
    nback: Optional[NBackMetrics] = None
    stroop: Optional[StroopMetrics] = None
    wisconsin: Optional[WisconsinMetrics] = None
    
    # Derived traits
    traits: List[Trait] = field(default_factory=list)
    
    # Composite scores (0-100)
    working_memory_score: int = 50
    inhibition_score: int = 50
    flexibility_score: int = 50
    processing_speed_score: int = 50
    
    # Overall
    cognitive_efficiency_index: float = 0.5


# ============================================================================
# TRAIT DETECTION RULES
# ============================================================================

def detect_traits(profile: AdvancedCognitiveProfile) -> List[Trait]:
    """
    Rule-based trait detection from cognitive metrics.
    
    Rules:
    - INTELLECTUAL_PROCESSOR: N-Back level >= 2
    - ZEN_MASTER: Impulse errors < 10%
    - ADAPTIVE_SOLVER: Flexibility index > 0.8
    - PATTERN_SEEKER: High working memory + high flexibility
    - HYPER_FOCUS: Low impulse + high accuracy across tests
    """
    traits = []
    
    # Rule 1: Intellectual Processor
    if profile.nback and profile.nback.max_n_level >= 2:
        traits.append(Trait.INTELLECTUAL_PROCESSOR)
    
    # Rule 2: Zen Master
    if profile.stroop and profile.stroop.zen_master_achieved:
        traits.append(Trait.ZEN_MASTER)
    
    # Rule 3: Adaptive Solver
    if profile.wisconsin and profile.wisconsin.adaptive_solver_achieved:
        traits.append(Trait.ADAPTIVE_SOLVER)
    
    # Rule 4: Pattern Seeker (compound trait)
    if (profile.nback and profile.wisconsin and 
        profile.nback.max_n_level >= 2 and 
        profile.wisconsin.flexibility_index >= 0.6):
        traits.append(Trait.PATTERN_SEEKER)
    
    # Rule 5: Hyper Focus
    if (profile.stroop and profile.nback and
        profile.stroop.impulse_error_rate < 5 and
        profile.nback.accuracy_percent >= 90):
        traits.append(Trait.HYPER_FOCUS)
    
    # Rule 6: Creative Thinker (flexible but less structured)
    if (profile.wisconsin and profile.nback and
        profile.wisconsin.flexibility_index >= 0.7 and
        profile.nback.max_n_level == 1):
        traits.append(Trait.CREATIVE_THINKER)
    
    return traits


# ============================================================================
# SCORE NORMALIZATION
# ============================================================================

def normalize_to_100(value: float, min_val: float, max_val: float) -> int:
    """Normalize a value to 0-100 scale."""
    if max_val == min_val:
        return 50
    normalized = (value - min_val) / (max_val - min_val) * 100
    return max(0, min(100, int(normalized)))


def calculate_composite_scores(profile: AdvancedCognitiveProfile) -> AdvancedCognitiveProfile:
    """Calculate normalized composite scores from raw metrics."""
    
    # Working Memory Score (from N-Back)
    if profile.nback:
        # Weight: N-level (40%), accuracy (30%), working memory score (30%)
        n_level_score = normalize_to_100(profile.nback.max_n_level, 1, 3)
        accuracy_score = profile.nback.accuracy_percent
        wm_raw = profile.nback.working_memory_score
        
        profile.working_memory_score = int(
            n_level_score * 0.4 + 
            accuracy_score * 0.3 + 
            wm_raw * 0.3
        )
    
    # Inhibition Score (from Stroop)
    if profile.stroop:
        profile.inhibition_score = profile.stroop.inhibition_score
    
    # Flexibility Score (from Wisconsin)
    if profile.wisconsin:
        # Weight: flexibility index (50%), categories (30%), low perseverative errors (20%)
        flex_score = profile.wisconsin.flexibility_index * 100
        category_score = normalize_to_100(profile.wisconsin.categories_completed, 0, 6)
        error_penalty = min(30, profile.wisconsin.perseverative_errors * 3)
        
        profile.flexibility_score = max(0, int(
            flex_score * 0.5 + 
            category_score * 0.3 + 
            (100 - error_penalty) * 0.2
        ))
    
    # Processing Speed (combined reaction times)
    rt_scores = []
    if profile.nback and profile.nback.avg_reaction_time_ms > 0:
        # Lower RT = higher score, baseline 400-1500ms
        rt_scores.append(normalize_to_100(
            1500 - profile.nback.avg_reaction_time_ms, 
            0, 1100
        ))
    if profile.stroop and profile.stroop.avg_reaction_time_ms > 0:
        rt_scores.append(normalize_to_100(
            1000 - profile.stroop.avg_reaction_time_ms,
            0, 600
        ))
    
    if rt_scores:
        profile.processing_speed_score = int(sum(rt_scores) / len(rt_scores))
    
    # Overall Cognitive Efficiency Index
    scores = [
        profile.working_memory_score,
        profile.inhibition_score,
        profile.flexibility_score,
        profile.processing_speed_score
    ]
    valid_scores = [s for s in scores if s > 0]
    if valid_scores:
        profile.cognitive_efficiency_index = sum(valid_scores) / len(valid_scores) / 100
    
    return profile


# ============================================================================
# TRAIT DESCRIPTIONS (Vietnamese)
# ============================================================================

TRAIT_DESCRIPTIONS = {
    Trait.INTELLECTUAL_PROCESSOR: {
        "name_vi": "Bộ xử lý Trí tuệ",
        "description_vi": "Có khả năng lưu trữ và xử lý nhiều thông tin cùng lúc trong trí nhớ làm việc.",
        "strengths_vi": ["Giải quyết vấn đề phức tạp", "Học các quy tắc mới nhanh", "Mã hóa/lập trình"],
        "activities_vi": ["Rubik's Cube", "Cờ vua", "Lập trình Scratch/Python"],
        "icon": "brain"
    },
    Trait.ZEN_MASTER: {
        "name_vi": "Thiền sư Bình tĩnh",
        "description_vi": "Có khả năng kiểm soát xung động tốt, không hành động vội vàng dù bị áp lực.",
        "strengths_vi": ["Tập trung cao", "Điềm tĩnh dưới áp lực", "Ra quyết định cẩn thận"],
        "activities_vi": ["Thiền/Yoga", "Xếp hình tỉ mỉ", "Nghệ thuật chi tiết"],
        "icon": "lotus"
    },
    Trait.ADAPTIVE_SOLVER: {
        "name_vi": "Người Giải quyết Linh hoạt",
        "description_vi": "Có khả năng chuyển đổi cách tiếp cận khi điều kiện thay đổi.",
        "strengths_vi": ["Thích nghi nhanh", "Linh hoạt tư duy", "Sáng tạo trong giải pháp"],
        "activities_vi": ["Trò chơi chiến thuật", "Brainstorming", "Thử nghiệm khoa học"],
        "icon": "shuffle"
    },
    Trait.PATTERN_SEEKER: {
        "name_vi": "Người Tìm Quy luật",
        "description_vi": "Có khả năng nhận ra các mẫu ẩn và quy luật trong dữ liệu phức tạp.",
        "strengths_vi": ["Phát hiện quy luật", "Phân tích logic", "Tư duy hệ thống"],
        "activities_vi": ["Sudoku", "Phân loại bộ sưu tập", "Data analysis"],
        "icon": "grid"
    },
    Trait.HYPER_FOCUS: {
        "name_vi": "Siêu Tập trung",
        "description_vi": "Có khả năng duy trì sự tập trung cao độ trong thời gian dài với độ chính xác cao.",
        "strengths_vi": ["Công việc đòi hỏi độ chính xác", "Kiểm tra/QC", "Nghiên cứu sâu"],
        "activities_vi": ["Puzzle 1000+ mảnh", "Mô hình chi tiết", "Quan sát thiên văn"],
        "icon": "target"
    },
    Trait.CREATIVE_THINKER: {
        "name_vi": "Người Sáng tạo",
        "description_vi": "Có tư duy mở, linh hoạt, thích khám phá nhiều góc nhìn khác nhau.",
        "strengths_vi": ["Tư duy ngoài khuôn khổ", "Ý tưởng mới", "Kết nối ý tưởng xa"],
        "activities_vi": ["Nghệ thuật tự do", "Viết sáng tạo", "Thiết kế/Design thinking"],
        "icon": "lightbulb"
    }
}


# ============================================================================
# ANALYSIS FUNCTIONS
# ============================================================================

def analyze_advanced_metrics(data: Dict[str, Any]) -> AdvancedCognitiveProfile:
    """
    Main analysis function.
    
    Input: Raw metrics dictionary from frontend
    Output: Complete cognitive profile with traits and scores
    """
    profile = AdvancedCognitiveProfile()
    
    # Parse N-Back metrics
    if "nback" in data and data["nback"]:
        nback_data = data["nback"]
        profile.nback = NBackMetrics(
            max_n_level=nback_data.get("maxNLevel", 1),
            accuracy_percent=nback_data.get("accuracyPercent", 0),
            avg_reaction_time_ms=nback_data.get("avgReactionTimeMs", 0),
            working_memory_score=nback_data.get("workingMemoryScore", 0),
            d_prime=nback_data.get("dPrime", 0)
        )
    
    # Parse Stroop metrics
    if "stroop" in data and data["stroop"]:
        stroop_data = data["stroop"]
        profile.stroop = StroopMetrics(
            impulse_error_rate=stroop_data.get("impulseErrorRate", 0),
            avg_reaction_time_ms=stroop_data.get("avgReactionTimeMs", 0),
            inhibition_score=stroop_data.get("inhibitionScore", 0),
            stroop_effect=stroop_data.get("stroopEffect", 0),
            zen_master_achieved=stroop_data.get("zenMasterAchieved", False)
        )
    
    # Parse Wisconsin metrics
    if "wisconsin" in data and data["wisconsin"]:
        wisconsin_data = data["wisconsin"]
        profile.wisconsin = WisconsinMetrics(
            perseverative_errors=wisconsin_data.get("perseverativeErrors", 0),
            total_errors=wisconsin_data.get("totalErrors", 0),
            categories_completed=wisconsin_data.get("categoriesCompleted", 0),
            flexibility_index=wisconsin_data.get("flexibilityIndex", 0),
            adaptive_solver_achieved=wisconsin_data.get("adaptiveSolverAchieved", False),
            conceptual_level_responses=wisconsin_data.get("conceptualLevelResponses", 0)
        )
    
    # Calculate composite scores
    profile = calculate_composite_scores(profile)
    
    # Detect traits
    profile.traits = detect_traits(profile)
    
    return profile


def generate_trait_report(profile: AdvancedCognitiveProfile) -> Dict[str, Any]:
    """Generate a human-readable trait report in Vietnamese."""
    
    report = {
        "summary_vi": "",
        "traits": [],
        "composite_scores": {
            "working_memory": profile.working_memory_score,
            "inhibition": profile.inhibition_score,
            "flexibility": profile.flexibility_score,
            "processing_speed": profile.processing_speed_score,
            "overall": round(profile.cognitive_efficiency_index * 100)
        },
        "strengths_vi": [],
        "recommended_activities_vi": [],
        "growth_focus_vi": ""
    }
    
    # Add trait information
    for trait in profile.traits:
        trait_info = TRAIT_DESCRIPTIONS.get(trait, {})
        report["traits"].append({
            "id": trait.value,
            "name_vi": trait_info.get("name_vi", ""),
            "description_vi": trait_info.get("description_vi", ""),
            "icon": trait_info.get("icon", "star")
        })
        
        # Aggregate strengths and activities
        report["strengths_vi"].extend(trait_info.get("strengths_vi", []))
        report["recommended_activities_vi"].extend(trait_info.get("activities_vi", []))
    
    # Remove duplicates
    report["strengths_vi"] = list(set(report["strengths_vi"]))[:5]
    report["recommended_activities_vi"] = list(set(report["recommended_activities_vi"]))[:5]
    
    # Generate summary
    if profile.traits:
        trait_names = [TRAIT_DESCRIPTIONS[t]["name_vi"] for t in profile.traits if t in TRAIT_DESCRIPTIONS]
        report["summary_vi"] = f"Bạn có xu hướng: {', '.join(trait_names)}."
    else:
        report["summary_vi"] = "Hồ sơ nhận thức của bạn đang được xây dựng."
    
    # Determine growth focus
    lowest_score = min(
        report["composite_scores"]["working_memory"],
        report["composite_scores"]["inhibition"],
        report["composite_scores"]["flexibility"]
    )
    
    if lowest_score == report["composite_scores"]["working_memory"]:
        report["growth_focus_vi"] = "Tập trung phát triển trí nhớ làm việc qua các trò chơi ghi nhớ."
    elif lowest_score == report["composite_scores"]["inhibition"]:
        report["growth_focus_vi"] = "Tập trung phát triển khả năng kiểm soát xung động qua thiền và yoga."
    else:
        report["growth_focus_vi"] = "Tập trung phát triển tư duy linh hoạt qua các hoạt động thử nghiệm."
    
    return report


def profile_to_json(profile: AdvancedCognitiveProfile) -> str:
    """Serialize profile to JSON for storage/API response."""
    data = {
        "nback": None,
        "stroop": None,
        "wisconsin": None,
        "traits": [t.value for t in profile.traits],
        "composite_scores": {
            "working_memory": profile.working_memory_score,
            "inhibition": profile.inhibition_score,
            "flexibility": profile.flexibility_score,
            "processing_speed": profile.processing_speed_score
        },
        "cognitive_efficiency_index": profile.cognitive_efficiency_index
    }
    
    if profile.nback:
        data["nback"] = {
            "maxNLevel": profile.nback.max_n_level,
            "accuracyPercent": profile.nback.accuracy_percent,
            "avgReactionTimeMs": profile.nback.avg_reaction_time_ms,
            "workingMemoryScore": profile.nback.working_memory_score,
            "dPrime": profile.nback.d_prime
        }
    
    if profile.stroop:
        data["stroop"] = {
            "impulseErrorRate": profile.stroop.impulse_error_rate,
            "avgReactionTimeMs": profile.stroop.avg_reaction_time_ms,
            "inhibitionScore": profile.stroop.inhibition_score,
            "stroopEffect": profile.stroop.stroop_effect,
            "zenMasterAchieved": profile.stroop.zen_master_achieved
        }
    
    if profile.wisconsin:
        data["wisconsin"] = {
            "perseverativeErrors": profile.wisconsin.perseverative_errors,
            "totalErrors": profile.wisconsin.total_errors,
            "categoriesCompleted": profile.wisconsin.categories_completed,
            "flexibilityIndex": profile.wisconsin.flexibility_index,
            "adaptiveSolverAchieved": profile.wisconsin.adaptive_solver_achieved,
            "conceptualLevelResponses": profile.wisconsin.conceptual_level_responses
        }
    
    return json.dumps(data, ensure_ascii=False, indent=2)


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    # Example input from frontend
    example_data = {
        "nback": {
            "maxNLevel": 2,
            "accuracyPercent": 85.5,
            "avgReactionTimeMs": 650,
            "workingMemoryScore": 78,
            "dPrime": 2.1
        },
        "stroop": {
            "impulseErrorRate": 8.5,
            "avgReactionTimeMs": 420,
            "inhibitionScore": 82,
            "stroopEffect": 45,
            "zenMasterAchieved": True
        },
        "wisconsin": {
            "perseverativeErrors": 5,
            "totalErrors": 12,
            "categoriesCompleted": 4,
            "flexibilityIndex": 0.85,
            "adaptiveSolverAchieved": True,
            "conceptualLevelResponses": 78
        }
    }
    
    # Analyze
    profile = analyze_advanced_metrics(example_data)
    
    # Generate report
    report = generate_trait_report(profile)
    
    print("=" * 60)
    print("🧠 ADVANCED COGNITIVE PROFILE")
    print("=" * 60)
    print(f"\n📊 Summary: {report['summary_vi']}")
    print(f"\n🎯 Traits: {[t['name_vi'] for t in report['traits']]}")
    print(f"\n💪 Strengths: {report['strengths_vi']}")
    print(f"\n🎮 Recommended: {report['recommended_activities_vi']}")
    print(f"\n📈 Focus: {report['growth_focus_vi']}")
    print(f"\n📊 Scores:")
    for key, value in report['composite_scores'].items():
        print(f"   - {key}: {value}")
    
    print("\n" + "=" * 60)
    print("JSON Output:")
    print(profile_to_json(profile))
