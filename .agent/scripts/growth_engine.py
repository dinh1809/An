"""
🧠 FUTURE GROWTH ENGINE - Core Logic Module
============================================
Version: 2.0
Purpose: Rule-based cognitive assessment system for neurodivergent children (10-16yo)

This module provides:
1. calculate_profile(game_data) - Normalize game metrics to 1-5 scale
2. generate_strategy(profile) - Map cognitive traits to teaching methods
3. suggest_broad_direction(profile) - Return career clusters (NOT job titles)

ETHICAL CONSTRAINTS:
- NO medical terminology (diagnose, treat, cure)
- Use supportive language: "Hỗ trợ", "Phát triển", "Tối đa hóa tiềm năng"
- All output in Vietnamese
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import json

# ============================================================================
# CONSTANTS & REFERENCE DATA
# ============================================================================

class CognitiveDomain(Enum):
    """4 Core Cognitive Domains measured by the system"""
    VISUAL = "visual"           # Thị giác - Visual processing
    AUDITORY = "auditory"       # Thính giác - Auditory processing
    MOVEMENT = "movement"       # Vận động - Kinesthetic/Motor
    LOGIC = "logic"             # Logic/Hệ thống hóa - Systemizing


class SupportTier(Enum):
    """Partner support levels"""
    TIER_A = "A"  # High support (1:1 or 1:2)
    TIER_B = "B"  # Medium support (small group)
    TIER_C = "C"  # Low support (mainstream with accommodations)


# Teaching strategies reference table
# Maps cognitive traits to recommended methods
TEACHING_STRATEGIES: Dict[str, Dict[str, Any]] = {
    "high_visual": {
        "name_vi": "Học qua Thị giác",
        "method": "Visual Schedules / TEACCH",
        "tools": ["Flashcards", "Mindmaps", "Biểu đồ màu sắc", "Video hướng dẫn"],
        "tips": [
            "Sử dụng hình ảnh minh họa cho mọi khái niệm",
            "Tạo lịch trình bằng hình ảnh",
            "Dùng màu sắc để phân loại thông tin"
        ],
        "icon": "eye"
    },
    "high_auditory": {
        "name_vi": "Học qua Thính giác",
        "method": "Audio-based Learning",
        "tools": ["Podcast", "Audiobook", "Nhạc cụ", "Ghi âm bài học"],
        "tips": [
            "Đọc to bài học cho con nghe",
            "Sử dụng nhịp điệu/vần để ghi nhớ",
            "Cho phép con tự nói lại nội dung đã học"
        ],
        "icon": "volume-2"
    },
    "high_movement": {
        "name_vi": "Học qua Vận động",
        "method": "Kinesthetic / Hands-on Learning",
        "tools": ["Lego/Xếp hình", "Đất nặn", "Thí nghiệm thực hành", "Trò chơi vận động"],
        "tips": [
            "Nghỉ giải lao vận động mỗi 15-20 phút",
            "Dùng đồ vật thật để minh họa",
            "Kết hợp học với hoạt động thể chất"
        ],
        "icon": "move"
    },
    "high_logic": {
        "name_vi": "Học qua Hệ thống",
        "method": "Structured / Systematic Learning",
        "tools": ["Sơ đồ tư duy", "Bảng tính", "Coding (Scratch)", "Lập trình Robot"],
        "tips": [
            "Chia nhỏ bài học thành các bước rõ ràng",
            "Đưa ra quy tắc cụ thể, nhất quán",
            "Giải thích logic đằng sau mọi việc"
        ],
        "icon": "cpu"
    },
    "balanced": {
        "name_vi": "Học đa phương thức",
        "method": "Multimodal Learning",
        "tools": ["Kết hợp nhiều phương pháp", "Thay đổi linh hoạt"],
        "tips": [
            "Thử nghiệm nhiều cách tiếp cận khác nhau",
            "Quan sát phản hồi của con để điều chỉnh",
            "Kết hợp hình ảnh + âm thanh + thực hành"
        ],
        "icon": "layers"
    }
}

# Broad direction clusters (NOT job titles)
DIRECTION_CLUSTERS: Dict[str, Dict[str, Any]] = {
    "technical_system": {
        "name_vi": "Kỹ thuật & Hệ thống",
        "description": "Thiên hướng làm việc với máy móc, quy trình, hệ thống logic",
        "examples": ["Công nghệ thông tin", "Kỹ thuật", "Tự động hóa"],
        "activities": ["Lập trình Scratch/Python", "Lego Robotics", "Lắp ráp mô hình"],
        "required_traits": {"logic": 4, "visual": 3},
        "icon": "settings"
    },
    "visual_creative": {
        "name_vi": "Sáng tạo & Thị giác",
        "description": "Thiên hướng nghệ thuật, thiết kế, sáng tạo thị giác",
        "examples": ["Thiết kế đồ họa", "Nhiếp ảnh", "Nghệ thuật số"],
        "activities": ["Vẽ tranh", "Chụp ảnh", "Làm phim ngắn", "Digital Art"],
        "required_traits": {"visual": 4, "movement": 2},
        "icon": "palette"
    },
    "research_analysis": {
        "name_vi": "Nghiên cứu & Phân tích",
        "description": "Thiên hướng tìm hiểu sâu, phân tích dữ liệu, quan sát chi tiết",
        "examples": ["Khoa học", "Nghiên cứu", "Phân tích dữ liệu"],
        "activities": ["Thí nghiệm khoa học", "Quan sát thiên nhiên", "Thu thập bộ sưu tập"],
        "required_traits": {"logic": 4, "visual": 4},
        "icon": "search"
    },
    "craft_hands_on": {
        "name_vi": "Thủ công & Thực hành",
        "description": "Thiên hướng làm việc với tay, tạo ra sản phẩm hữu hình",
        "examples": ["Thủ công mỹ nghệ", "Làm đồ gỗ", "Nấu ăn", "Làm vườn"],
        "activities": ["Gốm sứ", "Đan lát", "Làm bánh", "Chăm sóc cây"],
        "required_traits": {"movement": 4, "visual": 3},
        "icon": "hammer"
    },
    "nature_environment": {
        "name_vi": "Thiên nhiên & Môi trường",
        "description": "Thiên hướng yêu thích động vật, thực vật, hoạt động ngoài trời",
        "examples": ["Chăm sóc động vật", "Nông nghiệp", "Bảo vệ môi trường"],
        "activities": ["Làm vườn", "Chăm thú cưng", "Đi bộ đường dài", "Cắm trại"],
        "required_traits": {"movement": 4, "auditory": 2},
        "icon": "leaf"
    },
    "social_support": {
        "name_vi": "Hỗ trợ & Giao tiếp có cấu trúc",
        "description": "Thiên hướng làm việc với người khác trong môi trường có cấu trúc",
        "examples": ["Hỗ trợ thư viện", "Trợ giúp văn phòng", "Hướng dẫn cơ bản"],
        "activities": ["Làm tình nguyện", "Hỗ trợ thư viện", "Làm việc nhóm nhỏ"],
        "required_traits": {"auditory": 4, "logic": 3},
        "icon": "users"
    }
}

# Partner focus areas for matching
FOCUS_AREAS = ["STEM", "Art", "Craft", "Nature", "Social", "Sports"]


# ============================================================================
# DATA CLASSES
# ============================================================================

@dataclass
class GameMetrics:
    """Raw metrics from assessment games"""
    # Pattern Recognition Game (Task 1)
    pattern_accuracy: float = 0.0       # 0-100%
    pattern_avg_time_ms: float = 0.0    # Average response time
    
    # Reaction/Focus Game (Task 2)
    reaction_accuracy: float = 0.0      # Hit rate on correct targets
    reaction_avg_time_ms: float = 0.0   # Average reaction time
    impulse_errors: int = 0             # False positives (clicked wrong)
    attention_consistency: float = 0.0  # Variance in response times
    
    # Preference Game (Task 3 - This or That)
    visual_preference_score: float = 0.0   # 0-100% visual choices
    auditory_preference_score: float = 0.0 # 0-100% auditory choices
    
    # Optional: Movement assessment (from interaction patterns)
    interaction_intensity: float = 0.0  # Mouse/touch movement intensity


@dataclass
class CognitiveProfile:
    """Normalized cognitive profile (1-5 scale)"""
    visual: float = 3.0
    auditory: float = 3.0
    movement: float = 3.0
    logic: float = 3.0
    
    def to_dict(self) -> Dict[str, float]:
        return {
            "visual": round(self.visual, 2),
            "auditory": round(self.auditory, 2),
            "movement": round(self.movement, 2),
            "logic": round(self.logic, 2)
        }
    
    def get_primary_strength(self) -> str:
        """Returns the highest scoring domain"""
        scores = self.to_dict()
        return max(scores, key=scores.get)
    
    def get_strengths(self, threshold: float = 4.0) -> List[str]:
        """Returns all domains scoring above threshold"""
        scores = self.to_dict()
        return [domain for domain, score in scores.items() if score >= threshold]


@dataclass
class TeachingStrategy:
    """Recommended teaching strategy output"""
    primary_method: str
    method_name_vi: str
    tools: List[str]
    tips: List[str]
    icon: str
    secondary_methods: List[str] = None


@dataclass
class BroadDirection:
    """Career direction cluster output"""
    cluster_id: str
    name_vi: str
    description: str
    activities: List[str]
    match_score: float  # 0-100%
    icon: str


@dataclass
class GrowthPlan:
    """6-12 month growth plan structure"""
    child_name: str
    profile: CognitiveProfile
    primary_strategy: TeachingStrategy
    directions: List[BroadDirection]
    milestones: List[Dict[str, Any]]
    disclaimer: str


# ============================================================================
# CORE FUNCTIONS
# ============================================================================

def calculate_profile(game_data: Dict[str, Any]) -> CognitiveProfile:
    """
    Normalize game metrics into a 1-5 scale cognitive profile.
    
    Algorithm:
    - Visual: Pattern accuracy + Visual preference
    - Auditory: Auditory preference + Attention consistency
    - Movement: Interaction intensity + Inverse of reaction time variance
    - Logic: Pattern accuracy + Low impulse errors + Systematic play pattern
    
    Args:
        game_data: Raw metrics from the 3 assessment games
        
    Returns:
        CognitiveProfile with 1-5 scores for each domain
    """
    # Extract metrics with defaults
    pattern_accuracy = game_data.get("pattern_accuracy", 50)
    pattern_time = game_data.get("pattern_avg_time_ms", 3000)
    reaction_accuracy = game_data.get("reaction_accuracy", 50)
    reaction_time = game_data.get("reaction_avg_time_ms", 500)
    impulse_errors = game_data.get("impulse_errors", 5)
    attention_consistency = game_data.get("attention_consistency", 50)
    visual_pref = game_data.get("visual_preference_score", 50)
    auditory_pref = game_data.get("auditory_preference_score", 50)
    interaction_intensity = game_data.get("interaction_intensity", 50)
    
    # -------------------------------------------------------------------------
    # VISUAL SCORE (1-5)
    # High pattern accuracy + High visual preference = High visual
    # -------------------------------------------------------------------------
    visual_from_pattern = _normalize_to_5(pattern_accuracy, min_val=30, max_val=95)
    visual_from_pref = _normalize_to_5(visual_pref, min_val=20, max_val=80)
    visual_score = (visual_from_pattern * 0.6) + (visual_from_pref * 0.4)
    
    # -------------------------------------------------------------------------
    # AUDITORY SCORE (1-5)
    # High auditory preference + Consistent attention = High auditory
    # -------------------------------------------------------------------------
    auditory_from_pref = _normalize_to_5(auditory_pref, min_val=20, max_val=80)
    auditory_from_attention = _normalize_to_5(attention_consistency, min_val=30, max_val=90)
    auditory_score = (auditory_from_pref * 0.6) + (auditory_from_attention * 0.4)
    
    # -------------------------------------------------------------------------
    # MOVEMENT SCORE (1-5)
    # High interaction intensity + Fast reactions = High movement
    # -------------------------------------------------------------------------
    movement_from_intensity = _normalize_to_5(interaction_intensity, min_val=20, max_val=80)
    # Faster reaction = higher score (inverse normalize)
    movement_from_reaction = _normalize_to_5(1000 - reaction_time, min_val=200, max_val=700)
    movement_score = (movement_from_intensity * 0.5) + (movement_from_reaction * 0.5)
    
    # -------------------------------------------------------------------------
    # LOGIC/SYSTEMIZING SCORE (1-5)
    # High pattern accuracy + Low impulse errors + Methodical play = High logic
    # -------------------------------------------------------------------------
    logic_from_pattern = _normalize_to_5(pattern_accuracy, min_val=40, max_val=98)
    # Fewer impulse errors = higher score
    logic_from_impulse = _normalize_to_5(10 - impulse_errors, min_val=0, max_val=10)
    # Faster pattern solving (efficiency) = higher logic
    logic_from_efficiency = _normalize_to_5(5000 - pattern_time, min_val=1000, max_val=4000)
    logic_score = (logic_from_pattern * 0.5) + (logic_from_impulse * 0.3) + (logic_from_efficiency * 0.2)
    
    # Ensure all scores are within 1-5 range
    return CognitiveProfile(
        visual=max(1.0, min(5.0, visual_score)),
        auditory=max(1.0, min(5.0, auditory_score)),
        movement=max(1.0, min(5.0, movement_score)),
        logic=max(1.0, min(5.0, logic_score))
    )


def generate_strategy(profile: CognitiveProfile) -> TeachingStrategy:
    """
    Map cognitive profile to teaching strategies.
    
    Algorithm:
    - Identify primary strength (highest score)
    - If score > 4: Use specialized strategy
    - If balanced (no score > 4): Use multimodal approach
    
    Args:
        profile: Normalized cognitive profile
        
    Returns:
        TeachingStrategy with recommended methods and tools
    """
    strengths = profile.get_strengths(threshold=4.0)
    primary = profile.get_primary_strength()
    
    # Rule-based strategy selection
    if not strengths:
        # Balanced profile - use multimodal
        strategy_data = TEACHING_STRATEGIES["balanced"]
        primary_key = "balanced"
    else:
        # Map primary strength to strategy
        strength_map = {
            "visual": "high_visual",
            "auditory": "high_auditory",
            "movement": "high_movement",
            "logic": "high_logic"
        }
        primary_key = strength_map.get(primary, "balanced")
        strategy_data = TEACHING_STRATEGIES[primary_key]
    
    # Find secondary methods for other strengths
    secondary_methods = []
    for strength in strengths:
        if strength != primary:
            key = f"high_{strength}"
            if key in TEACHING_STRATEGIES:
                secondary_methods.append(TEACHING_STRATEGIES[key]["name_vi"])
    
    return TeachingStrategy(
        primary_method=primary_key,
        method_name_vi=strategy_data["name_vi"],
        tools=strategy_data["tools"],
        tips=strategy_data["tips"],
        icon=strategy_data["icon"],
        secondary_methods=secondary_methods if secondary_methods else None
    )


def suggest_broad_direction(profile: CognitiveProfile) -> List[BroadDirection]:
    """
    Return career direction clusters based on profile.
    
    CONSTRAINT: Returns CLUSTERS, not specific job titles.
    Example: "Kỹ thuật & Hệ thống" instead of "Tester" or "Coder"
    
    Algorithm:
    - Calculate match score for each direction cluster
    - Match score = weighted sum of how well profile fits required traits
    - Return top 3 matching directions
    
    Args:
        profile: Normalized cognitive profile
        
    Returns:
        List of top 3 BroadDirection matches with scores
    """
    directions: List[BroadDirection] = []
    profile_dict = profile.to_dict()
    
    for cluster_id, cluster_data in DIRECTION_CLUSTERS.items():
        required = cluster_data["required_traits"]
        
        # Calculate match score
        total_weight = sum(required.values())
        match_points = 0
        
        for trait, required_level in required.items():
            actual_level = profile_dict.get(trait, 3)
            # Score how well actual meets or exceeds required
            if actual_level >= required_level:
                match_points += required_level
            else:
                # Partial credit for close matches
                match_points += actual_level * (actual_level / required_level)
        
        match_score = (match_points / total_weight) * 100 if total_weight > 0 else 50
        
        directions.append(BroadDirection(
            cluster_id=cluster_id,
            name_vi=cluster_data["name_vi"],
            description=cluster_data["description"],
            activities=cluster_data["activities"],
            match_score=round(match_score, 1),
            icon=cluster_data["icon"]
        ))
    
    # Sort by match score and return top 3
    directions.sort(key=lambda x: x.match_score, reverse=True)
    return directions[:3]


def generate_growth_plan(
    child_name: str,
    game_data: Dict[str, Any],
    plan_duration_months: int = 6
) -> GrowthPlan:
    """
    Generate a complete growth plan from raw game data.
    
    This is the main entry point that orchestrates:
    1. calculate_profile()
    2. generate_strategy()
    3. suggest_broad_direction()
    4. Generate milestones
    
    Args:
        child_name: Name of the child
        game_data: Raw metrics from assessment games
        plan_duration_months: Plan duration (6 or 12 months)
        
    Returns:
        Complete GrowthPlan object
    """
    # Step 1: Calculate profile
    profile = calculate_profile(game_data)
    
    # Step 2: Generate teaching strategy
    strategy = generate_strategy(profile)
    
    # Step 3: Suggest directions
    directions = suggest_broad_direction(profile)
    
    # Step 4: Generate milestones
    milestones = _generate_milestones(
        profile=profile,
        primary_direction=directions[0] if directions else None,
        duration_months=plan_duration_months
    )
    
    # Mandatory disclaimer (Vietnamese)
    disclaimer = (
        "Kết quả này là xu hướng tham khảo để xây dựng kế hoạch giáo dục, "
        "không thay thế chẩn đoán y khoa. Vui lòng tham khảo ý kiến chuyên gia "
        "để có lộ trình phù hợp nhất với con."
    )
    
    return GrowthPlan(
        child_name=child_name,
        profile=profile,
        primary_strategy=strategy,
        directions=directions,
        milestones=milestones,
        disclaimer=disclaimer
    )


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def _normalize_to_5(value: float, min_val: float, max_val: float) -> float:
    """
    Normalize a value to 1-5 scale.
    
    Args:
        value: Raw value to normalize
        min_val: Expected minimum (maps to 1)
        max_val: Expected maximum (maps to 5)
        
    Returns:
        Normalized value between 1 and 5
    """
    if max_val == min_val:
        return 3.0  # Middle score for edge case
    
    # Clamp value to range
    clamped = max(min_val, min(max_val, value))
    
    # Normalize to 0-1 then scale to 1-5
    normalized = (clamped - min_val) / (max_val - min_val)
    return 1 + (normalized * 4)


def _generate_milestones(
    profile: CognitiveProfile,
    primary_direction: Optional[BroadDirection],
    duration_months: int
) -> List[Dict[str, Any]]:
    """
    Generate time-based milestones for the growth plan.
    
    Args:
        profile: Cognitive profile
        primary_direction: Top matching direction
        duration_months: Plan duration
        
    Returns:
        List of milestone objects with month, title, and activities
    """
    milestones = []
    
    # Get primary strength and direction
    primary_strength = profile.get_primary_strength()
    direction_activities = primary_direction.activities if primary_direction else []
    
    # Month 1-2: Exploration phase
    milestones.append({
        "month": 1,
        "phase": "Khám phá",
        "title_vi": "Khám phá điểm mạnh",
        "description_vi": f"Thử nghiệm các hoạt động phù hợp với năng lực {_translate_domain(primary_strength)}",
        "activities": direction_activities[:2] if direction_activities else ["Thử nghiệm nhiều hoạt động"],
        "icon": "compass"
    })
    
    # Month 3-4: Building phase
    milestones.append({
        "month": 3,
        "phase": "Xây dựng",
        "title_vi": "Xây dựng kỹ năng nền tảng",
        "description_vi": "Tập trung phát triển kỹ năng cốt lõi thông qua luyện tập có cấu trúc",
        "activities": direction_activities[1:3] if len(direction_activities) > 1 else ["Luyện tập hàng ngày"],
        "icon": "tool"
    })
    
    # Month 5-6: Application phase
    milestones.append({
        "month": 5,
        "phase": "Ứng dụng",
        "title_vi": "Ứng dụng trong thực tế",
        "description_vi": "Tham gia hoạt động thực tế, kết nối với đối tác hỗ trợ",
        "activities": ["Tham gia CLB/Trung tâm", "Dự án nhỏ thực tế"],
        "icon": "rocket"
    })
    
    if duration_months == 12:
        # Extended milestones for 12-month plan
        milestones.append({
            "month": 7,
            "phase": "Nâng cao",
            "title_vi": "Phát triển chuyên sâu",
            "description_vi": "Đào sâu vào lĩnh vực phù hợp nhất",
            "activities": ["Khóa học nâng cao", "Mentorship"],
            "icon": "trending-up"
        })
        
        milestones.append({
            "month": 10,
            "phase": "Chuẩn bị",
            "title_vi": "Chuẩn bị cho tương lai",
            "description_vi": "Xây dựng Portfolio, chuẩn bị cho bước tiếp theo",
            "activities": ["Tạo Portfolio", "Thực tập trải nghiệm"],
            "icon": "award"
        })
    
    return milestones


def _translate_domain(domain: str) -> str:
    """Translate domain name to Vietnamese"""
    translations = {
        "visual": "Thị giác",
        "auditory": "Thính giác",
        "movement": "Vận động",
        "logic": "Logic/Hệ thống"
    }
    return translations.get(domain, domain)


# ============================================================================
# PARTNER MATCHING (For DB Integration)
# ============================================================================

def match_partners(
    profile: CognitiveProfile,
    partners: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Match cognitive profile to suitable partners from database.
    
    Args:
        profile: Cognitive profile
        partners: List of partner records from DB
        
    Returns:
        Sorted list of partners with match scores
    """
    directions = suggest_broad_direction(profile)
    direction_focus_map = {
        "technical_system": ["STEM"],
        "visual_creative": ["Art"],
        "research_analysis": ["STEM"],
        "craft_hands_on": ["Craft", "Art"],
        "nature_environment": ["Nature"],
        "social_support": ["Social"]
    }
    
    # Get focus areas from top directions
    preferred_focuses = set()
    for direction in directions[:2]:
        focuses = direction_focus_map.get(direction.cluster_id, [])
        preferred_focuses.update(focuses)
    
    # Score partners
    scored_partners = []
    for partner in partners:
        partner_focus = partner.get("focus_area", "")
        base_score = 50
        
        if partner_focus in preferred_focuses:
            base_score = 90
        elif partner_focus in FOCUS_AREAS:
            base_score = 60
            
        scored_partners.append({
            **partner,
            "match_score": base_score
        })
    
    # Sort by match score
    scored_partners.sort(key=lambda x: x["match_score"], reverse=True)
    return scored_partners


# ============================================================================
# SERIALIZATION (For Frontend Integration)
# ============================================================================

def growth_plan_to_json(plan: GrowthPlan) -> str:
    """Serialize GrowthPlan to JSON for API response"""
    return json.dumps({
        "child_name": plan.child_name,
        "profile": plan.profile.to_dict(),
        "strategy": {
            "primary_method": plan.primary_strategy.primary_method,
            "name_vi": plan.primary_strategy.method_name_vi,
            "tools": plan.primary_strategy.tools,
            "tips": plan.primary_strategy.tips,
            "icon": plan.primary_strategy.icon,
            "secondary_methods": plan.primary_strategy.secondary_methods
        },
        "directions": [
            {
                "id": d.cluster_id,
                "name_vi": d.name_vi,
                "description": d.description,
                "activities": d.activities,
                "match_score": d.match_score,
                "icon": d.icon
            }
            for d in plan.directions
        ],
        "milestones": plan.milestones,
        "disclaimer": plan.disclaimer
    }, ensure_ascii=False, indent=2)


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    # Example: Simulate game data
    example_game_data = {
        "pattern_accuracy": 85,
        "pattern_avg_time_ms": 2500,
        "reaction_accuracy": 75,
        "reaction_avg_time_ms": 450,
        "impulse_errors": 3,
        "attention_consistency": 70,
        "visual_preference_score": 75,
        "auditory_preference_score": 35,
        "interaction_intensity": 60
    }
    
    # Generate complete growth plan
    plan = generate_growth_plan(
        child_name="Minh",
        game_data=example_game_data,
        plan_duration_months=6
    )
    
    # Print results
    print("=" * 60)
    print(f"🧠 KẾ HOẠCH PHÁT TRIỂN CHO: {plan.child_name}")
    print("=" * 60)
    
    print("\n📊 HỒ SƠ NĂNG LỰC:")
    for domain, score in plan.profile.to_dict().items():
        bar = "█" * int(score) + "░" * (5 - int(score))
        print(f"  {_translate_domain(domain):15} [{bar}] {score:.1f}/5")
    
    print(f"\n📚 PHƯƠNG PHÁP DẠY HỌC: {plan.primary_strategy.method_name_vi}")
    print(f"  Công cụ: {', '.join(plan.primary_strategy.tools[:3])}")
    
    print("\n🎯 HƯỚNG PHÁT TRIỂN:")
    for i, direction in enumerate(plan.directions, 1):
        print(f"  {i}. {direction.name_vi} ({direction.match_score:.0f}% phù hợp)")
        print(f"     → {direction.description}")
    
    print(f"\n⚠️ {plan.disclaimer}")
    
    print("\n" + "=" * 60)
    print("JSON Output:")
    print(growth_plan_to_json(plan))
