"""
Profile Reader Agent
Parses messy user input into structured profile data.
"""
from typing import Optional, Dict
from app.services.llm_service import llm_service
from app.services.supabase_client import supabase_service


class ProfileReaderAgent:
    """Agent for parsing and structuring user profile data."""
    
    async def parse_profile(self, raw_input: str, user_id: str) -> Dict:
        """
        Parse raw user input and save structured profile.
        
        Args:
            raw_input: Free-form text describing user preferences
            user_id: User's ID
            
        Returns:
            Parsed and saved profile data
        """
        # Use LLM to parse the input
        parsed_data = await llm_service.parse_profile(raw_input)
        
        # Clean up None values
        cleaned_data = {k: v for k, v in parsed_data.items() if v is not None}
        
        # Add user_id and raw_input
        cleaned_data['user_id'] = user_id
        
        # Upsert profile - check if exists first
        existing = await supabase_service.get_profile(user_id)
        
        if existing:
            profile = await supabase_service.update_profile(user_id, cleaned_data)
        else:
            profile = await supabase_service.create_profile(cleaned_data)
        
        return {
            "success": True,
            "profile": profile,
            "message": "Profile parsed and saved successfully"
        }
    
    async def update_profile_field(
        self,
        user_id: str,
        field: str,
        value: str
    ) -> Dict:
        """Update a single profile field with AI assistance."""
        # Get current profile
        current = await supabase_service.get_profile(user_id)
        
        # For simple fields, just update directly
        update_data = {field: value}
        
        if current:
            profile = await supabase_service.update_profile(user_id, update_data)
        else:
            update_data['user_id'] = user_id
            profile = await supabase_service.create_profile(update_data)
        
        return {
            "success": True,
            "profile": profile,
            "message": f"Profile field '{field}' updated"
        }


# Singleton instance
profile_reader_agent = ProfileReaderAgent()
