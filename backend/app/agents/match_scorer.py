"""
Match Scorer Agent
Calculates compatibility scores between buyers and sellers.
"""
from typing import Optional, Dict, List
from app.services.llm_service import llm_service
from app.services.supabase_client import supabase_service


class MatchScorerAgent:
    """Agent for calculating compatibility scores."""
    
    async def calculate_score(
        self,
        buyer_id: str,
        seller_id: str,
        listing_id: Optional[str] = None
    ) -> Dict:
        """
        Calculate compatibility score between buyer and seller.
        
        Args:
            buyer_id: Buyer's user ID
            seller_id: Seller's user ID
            listing_id: Optional specific listing ID
            
        Returns:
            Compatibility score and breakdown
        """
        # Get profiles
        buyer_profile = await supabase_service.get_profile(buyer_id)
        seller_profile = await supabase_service.get_profile(seller_id)
        
        if not buyer_profile:
            return {
                "error": True,
                "message": "Buyer profile not found"
            }
        
        if not seller_profile:
            return {
                "error": True,
                "message": "Seller profile not found"
            }
        
        # Get listing if specified
        listing = None
        if listing_id:
            listing = await supabase_service.get_listing(listing_id)
        
        # Calculate compatibility using LLM
        result = await llm_service.calculate_compatibility(
            buyer_profile,
            seller_profile,
            listing
        )
        
        # Save match to database
        match_data = {
            "buyer_id": buyer_id,
            "seller_id": seller_id,
            "listing_id": listing_id,
            "compatibility_score": result.get("compatibility_score", 0),
            "score_breakdown": result.get("score_breakdown", {}),
            "justification": result.get("justification", "")
        }
        
        saved_match = await supabase_service.create_match(match_data)
        
        return {
            "compatibility_score": result.get("compatibility_score", 0),
            "score_breakdown": result.get("score_breakdown", {}),
            "justification": result.get("justification", ""),
            "factors": result.get("factors", []),
            "match_id": saved_match.get("id") if saved_match else None
        }
    
    async def batch_score(
        self,
        buyer_id: str,
        seller_ids: List[str]
    ) -> List[Dict]:
        """Calculate scores for multiple sellers."""
        results = []
        for seller_id in seller_ids:
            score = await self.calculate_score(buyer_id, seller_id)
            results.append({
                "seller_id": seller_id,
                **score
            })
        
        # Sort by compatibility score
        results.sort(key=lambda x: x.get("compatibility_score", 0), reverse=True)
        return results


# Singleton instance
match_scorer_agent = MatchScorerAgent()
