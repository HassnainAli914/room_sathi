"""
Wingman Agent
Generates friendly explanations for match results.
"""
from typing import Dict, List, Optional
from app.services.llm_service import llm_service
from app.services.supabase_client import supabase_service


class WingmanAgent:
    """Agent for generating friendly match explanations."""
    
    async def generate_message(
        self,
        buyer_id: str,
        seller_id: str,
        compatibility_score: int,
        score_breakdown: Optional[Dict] = None,
        red_flags: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Generate a friendly explanation for match results.
        
        Args:
            buyer_id: Buyer's user ID
            seller_id: Seller's user ID
            compatibility_score: 0-100 score
            score_breakdown: Detailed score breakdown
            red_flags: List of detected red flags
            
        Returns:
            Friendly message with suggestions
        """
        # Get user names
        buyer = await supabase_service.get_user_by_id(buyer_id)
        seller = await supabase_service.get_user_by_id(seller_id)
        
        buyer_name = buyer.get("full_name", "there") if buyer else "there"
        seller_name = seller.get("full_name", "this seller") if seller else "this seller"
        
        # Generate message using LLM
        result = await llm_service.generate_wingman_message(
            buyer_name=buyer_name,
            seller_name=seller_name,
            compatibility_score=compatibility_score,
            score_breakdown=score_breakdown or {},
            red_flags=red_flags or []
        )
        
        # Update match with wingman message if it exists
        if buyer_id and seller_id:
            # Find and update match
            matches = await supabase_service.get_matches(buyer_id)
            for match in matches:
                if match.get("seller_id") == seller_id:
                    await supabase_service.update_match(
                        match["id"],
                        {"wingman_message": result.get("message", "")}
                    )
                    break
        
        return result
    
    def get_emoji_for_score(self, score: int) -> str:
        """Get appropriate emoji for score."""
        if score >= 90:
            return "🎉"
        elif score >= 80:
            return "😊"
        elif score >= 70:
            return "👍"
        elif score >= 60:
            return "🤔"
        elif score >= 50:
            return "😐"
        elif score >= 40:
            return "⚠️"
        else:
            return "🚫"
    
    def get_quick_verdict(self, score: int, has_red_flags: bool) -> str:
        """Get a quick one-liner verdict."""
        if has_red_flags and score < 50:
            return "This might not be the best match. Let's find you something better!"
        elif score >= 80:
            return "Great match! This could be exactly what you're looking for."
        elif score >= 60:
            return "Decent match with some considerations. Worth exploring!"
        elif score >= 40:
            return "Mixed compatibility. Proceed with awareness."
        else:
            return "Low compatibility. Consider other options."


# Singleton instance
wingman_agent = WingmanAgent()
