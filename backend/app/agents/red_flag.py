"""
Red Flag Agent
Detects lifestyle conflicts and suspicious data patterns.
"""
from typing import Optional, Dict, List
from app.services.llm_service import llm_service
from app.services.supabase_client import supabase_service
from app.models.schemas import Severity


class RedFlagAgent:
    """Agent for detecting red flags and conflicts."""
    
    async def detect(
        self,
        buyer_id: str,
        seller_id: str,
        listing_id: Optional[str] = None,
        match_id: Optional[str] = None
    ) -> Dict:
        """
        Detect red flags between buyer and seller.
        
        Args:
            buyer_id: Buyer's user ID
            seller_id: Seller's user ID
            listing_id: Optional specific listing ID
            match_id: Optional match ID to associate flags with
            
        Returns:
            Red flags with severity levels
        """
        # Get profiles
        buyer_profile = await supabase_service.get_profile(buyer_id)
        seller_profile = await supabase_service.get_profile(seller_id)
        
        if not buyer_profile or not seller_profile:
            return {
                "has_red_flags": True,
                "red_flags": [{
                    "flag_type": "incomplete_profile",
                    "description": "One or both profiles are incomplete",
                    "severity": "high"
                }],
                "overall_risk": "high"
            }
        
        # Get listing if specified
        listing = None
        if listing_id:
            listing = await supabase_service.get_listing(listing_id)
        
        # Detect red flags using LLM
        result = await llm_service.detect_red_flags(
            buyer_profile,
            seller_profile,
            listing
        )
        
        # Save red flags to database if match_id provided
        if match_id and result.get("red_flags"):
            # Save new red flags
            for flag in result.get("red_flags", []):
                flag_data = {
                    "match_id": match_id,
                    "flag_type": flag.get("flag_type"),
                    "description": flag.get("description"),
                    "severity": flag.get("severity"),
                    "details": flag.get("details", {})
                }
                await supabase_service.create_red_flag(flag_data)
        
        return result
    
    def get_severity_color(self, severity: str) -> str:
        """Get color code for severity level."""
        colors = {
            "low": "#FFC107",      # Yellow
            "medium": "#FF9800",   # Orange
            "high": "#F44336"      # Red
        }
        return colors.get(severity, "#9E9E9E")
    
    def summarize_risks(self, red_flags: List[Dict]) -> str:
        """Generate a summary of all risks."""
        if not red_flags:
            return "No significant risks detected."
        
        high = sum(1 for f in red_flags if f.get("severity") == "high")
        medium = sum(1 for f in red_flags if f.get("severity") == "medium")
        low = sum(1 for f in red_flags if f.get("severity") == "low")
        
        parts = []
        if high:
            parts.append(f"{high} high-risk issue{'s' if high > 1 else ''}")
        if medium:
            parts.append(f"{medium} medium-risk issue{'s' if medium > 1 else ''}")
        if low:
            parts.append(f"{low} low-risk issue{'s' if low > 1 else ''}")
        
        return f"Found {', '.join(parts)}."


# Singleton instance
red_flag_agent = RedFlagAgent()
