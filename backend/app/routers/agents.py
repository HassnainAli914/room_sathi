"""
AI Agents Router
Exposes all AI agent functionality as API endpoints.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    ParseProfileRequest,
    ParseProfileResponse,
    ScoreMatchRequest,
    ScoreMatchResponse,
    DetectRedFlagsRequest,
    DetectRedFlagsResponse,
    WingmanRequest,
    WingmanResponse,
    RecommendRoomsRequest,
    RecommendRoomsResponse
)
from app.agents import (
    profile_reader_agent,
    match_scorer_agent,
    red_flag_agent,
    wingman_agent,
    room_hunter_agent
)


router = APIRouter()


# ============================================
# Profile Reader Agent
# ============================================
@router.post("/parse-profile")
async def parse_profile(request: ParseProfileRequest):
    """
    Parse messy user input into structured profile data.
    Uses AI to extract and normalize profile attributes.
    """
    try:
        result = await profile_reader_agent.parse_profile(
            raw_input=request.raw_input,
            user_id=request.user_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Match Scorer Agent
# ============================================
@router.post("/score-match")
async def score_match(request: ScoreMatchRequest):
    """
    Calculate compatibility score between buyer and seller.
    Returns 0-100% score with detailed breakdown.
    """
    try:
        result = await match_scorer_agent.calculate_score(
            buyer_id=request.buyer_id,
            seller_id=request.seller_id,
            listing_id=request.listing_id
        )
        
        if result.get("error"):
            raise HTTPException(status_code=400, detail=result.get("message"))
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Red Flag Agent
# ============================================
@router.post("/detect-redflags")
async def detect_red_flags(request: DetectRedFlagsRequest):
    """
    Detect lifestyle conflicts and suspicious patterns.
    Returns list of red flags with severity levels.
    """
    try:
        result = await red_flag_agent.detect(
            buyer_id=request.buyer_id,
            seller_id=request.seller_id,
            listing_id=request.listing_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Wingman Agent
# ============================================
@router.post("/wingman")
async def get_wingman_message(request: WingmanRequest):
    """
    Generate friendly explanation for match results.
    Provides encouragement or gentle warnings based on compatibility.
    """
    try:
        result = await wingman_agent.generate_message(
            buyer_id=request.buyer_id,
            seller_id=request.seller_id,
            compatibility_score=request.compatibility_score,
            red_flags=request.red_flags
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Room Hunter Agent
# ============================================
@router.post("/recommend-rooms")
async def recommend_rooms(request: RecommendRoomsRequest):
    """
    Get personalized room recommendations for a buyer.
    Orchestrates all agents to provide ranked results with explanations.
    """
    try:
        result = await room_hunter_agent.recommend(
            buyer_id=request.buyer_id,
            limit=request.limit,
            filters=request.filters
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommend-rooms/{buyer_id}")
async def get_recommendations(buyer_id: str, limit: int = 10):
    """
    Quick endpoint to get room recommendations.
    """
    try:
        result = await room_hunter_agent.recommend(
            buyer_id=buyer_id,
            limit=limit
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# Agent Logs (for judges/debugging)
# ============================================
@router.get("/logs/{match_id}")
async def get_agent_logs(match_id: str):
    """
    Get decision-making logs for a specific match.
    Useful for judges to trace agent decisions.
    """
    from app.services.supabase_client import supabase_service
    
    # Get match details
    match = await supabase_service.get_match(match_id)
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    # Get red flags
    red_flags = await supabase_service.get_red_flags(match_id)
    
    return {
        "match_id": match_id,
        "compatibility_score": match.get("compatibility_score"),
        "score_breakdown": match.get("score_breakdown"),
        "justification": match.get("justification"),
        "wingman_message": match.get("wingman_message"),
        "red_flags": red_flags,
        "decision_flow": [
            {"agent": "Match Scorer", "action": "Calculated compatibility", "result": f"{match.get('compatibility_score')}%"},
            {"agent": "Red Flag", "action": "Scanned for risks", "result": f"{len(red_flags)} flags found"},
            {"agent": "Wingman", "action": "Generated explanation", "result": "Message created"}
        ]
    }

