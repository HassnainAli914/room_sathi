"""
Room Hunter Agent
Suggests top seller listings for a buyer.
"""
from typing import Dict, List, Optional
from app.services.llm_service import llm_service
from app.services.supabase_client import supabase_service
from app.agents.match_scorer import match_scorer_agent
from app.agents.red_flag import red_flag_agent
from app.agents.wingman import wingman_agent


class RoomHunterAgent:
    """Agent for recommending rooms to buyers."""
    
    async def recommend(
        self,
        buyer_id: str,
        limit: int = 10,
        filters: Optional[Dict] = None
    ) -> Dict:
        """
        Get personalized room recommendations for a buyer.
        
        Args:
            buyer_id: Buyer's user ID
            limit: Maximum number of recommendations
            filters: Optional filters (location, budget, etc.)
            
        Returns:
            List of recommended listings with scores and explanations
        """
        # Get buyer profile
        buyer_profile = await supabase_service.get_profile(buyer_id)
        if not buyer_profile:
            return {
                "recommendations": [],
                "total_count": 0,
                "message": "Please complete your profile first"
            }
        
        # Build filters from profile if not provided
        if filters is None:
            filters = {}
        
        # Add budget filter from profile
        max_rent = buyer_profile.get("monthly_budget_max") or filters.get("max_rent")
        location = buyer_profile.get("preferred_location") or filters.get("location")
        
        # Get available listings
        listings = await supabase_service.get_listings(
            location=location,
            max_rent=max_rent,
            limit=limit * 2  # Get more to filter
        )
        
        if not listings:
            return {
                "recommendations": [],
                "total_count": 0,
                "message": "No listings found matching your criteria"
            }
        
        # Score each listing
        recommendations = []
        for listing in listings:
            seller_id = listing.get("seller_id")
            listing_id = listing.get("id")
            
            # Calculate compatibility
            score_result = await match_scorer_agent.calculate_score(
                buyer_id=buyer_id,
                seller_id=seller_id,
                listing_id=listing_id
            )
            
            if score_result.get("error"):
                continue
            
            compatibility_score = score_result.get("compatibility_score", 0)
            
            # Detect red flags
            red_flags_result = await red_flag_agent.detect(
                buyer_id=buyer_id,
                seller_id=seller_id,
                listing_id=listing_id,
                match_id=score_result.get("match_id")
            )
            
            # Generate wingman message
            wingman_result = await wingman_agent.generate_message(
                buyer_id=buyer_id,
                seller_id=seller_id,
                compatibility_score=compatibility_score,
                score_breakdown=score_result.get("score_breakdown"),
                red_flags=red_flags_result.get("red_flags", [])
            )
            
            # Format listing for response
            seller_info = listing.get("users") or {}
            seller_name = seller_info.get("full_name", "Anonymous") if isinstance(seller_info, dict) else "Anonymous"
            
            recommendations.append({
                "listing": {
                    "id": listing_id,
                    "title": listing.get("title"),
                    "description": listing.get("description"),
                    "location": listing.get("location"),
                    "address": listing.get("address"),
                    "rent": listing.get("rent"),
                    "deposit": listing.get("deposit"),
                    "num_rooms": listing.get("num_rooms"),
                    "num_beds": listing.get("num_beds"),
                    "photos": listing.get("photos", []),
                    "has_wifi": listing.get("has_wifi"),
                    "has_ac": listing.get("has_ac"),
                    "has_laundry": listing.get("has_laundry"),
                    "has_kitchen": listing.get("has_kitchen"),
                    "has_parking": listing.get("has_parking"),
                    "has_furnished": listing.get("has_furnished"),
                    "seller_id": seller_id,
                    "seller_name": seller_name,
                    "is_available": listing.get("is_available"),
                    "available_from": str(listing.get("available_from")) if listing.get("available_from") else None
                },
                "compatibility_score": compatibility_score,
                "score_breakdown": score_result.get("score_breakdown", {}),
                "justification": score_result.get("justification", ""),
                "wingman_message": wingman_result.get("message", ""),
                "wingman_tone": wingman_result.get("tone", "neutral"),
                "suggestions": wingman_result.get("suggestions", []),
                "red_flags": red_flags_result.get("red_flags", []),
                "overall_risk": red_flags_result.get("overall_risk", "low")
            })
        
        # Sort by compatibility score (highest first)
        recommendations.sort(
            key=lambda x: x["compatibility_score"],
            reverse=True
        )
        
        # Limit results
        recommendations = recommendations[:limit]
        
        # Get AI insights for top listings
        if recommendations:
            try:
                insights = await llm_service.rank_listings(
                    buyer_profile,
                    recommendations
                )
                overall_advice = insights.get("overall_advice", "")
            except Exception:
                overall_advice = ""
        else:
            overall_advice = ""
        
        return {
            "recommendations": recommendations,
            "total_count": len(recommendations),
            "overall_advice": overall_advice,
            "message": f"Found {len(recommendations)} matching rooms for you!"
        }
    
    async def get_quick_recommendations(
        self,
        buyer_id: str,
        limit: int = 3
    ) -> List[Dict]:
        """Get quick top 3 recommendations without full analysis."""
        result = await self.recommend(buyer_id, limit=limit)
        return result.get("recommendations", [])


# Singleton instance
room_hunter_agent = RoomHunterAgent()
