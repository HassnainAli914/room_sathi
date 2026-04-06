"""
Room Matcher AI - Google LLM Service
"""
import google.generativeai as genai
from typing import Optional, Dict, Any
import json
from app.config import get_settings


class LLMService:
    """Service for interacting with Google Generative AI."""
    
    _instance: Optional['LLMService'] = None
    _model = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._model is None:
            settings = get_settings()
            genai.configure(api_key=settings.google_api_key)
            self._model = genai.GenerativeModel('gemini-1.5-flash')
    
    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        response_format: str = "text"
    ) -> str:
        """Generate response from LLM."""
        try:
            if system_instruction:
                model = genai.GenerativeModel(
                    'gemini-1.5-flash',
                    system_instruction=system_instruction
                )
            else:
                model = self._model
            
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"LLM Error: {e}")
            raise
    
    async def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate JSON response from LLM."""
        json_prompt = f"""{prompt}

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanation, just the JSON object."""
        
        response = await self.generate(json_prompt, system_instruction)
        
        # Clean response - remove markdown code blocks if present
        cleaned = response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        
        return json.loads(cleaned.strip())
    
    # ============================================
    # Profile Reader Prompts
    # ============================================
    async def parse_profile(self, raw_input: str) -> Dict:
        """Parse messy profile input into structured data."""
        system_instruction = """You are a profile parsing assistant. 
Extract structured information from user input about their housing preferences.
Always return valid JSON with the exact field names specified."""
        
        prompt = f"""Parse the following user input and extract profile information.

User Input:
"{raw_input}"

Extract these fields (use null if not mentioned):
- age (integer)
- gender (male/female/other/prefer_not_to_say)
- city (string)
- university (string)
- monthly_budget_min (integer)
- monthly_budget_max (integer)
- preferred_location (string)
- cleanliness (very_clean/clean/moderate/relaxed)
- sleep_schedule (early_bird/night_owl/flexible)
- study_habits (quiet_studier/group_studier/flexible)
- food_preference (vegetarian/non_vegetarian/vegan/no_preference)
- noise_tolerance (silent/low/moderate/high)
- smoking (smoker/non_smoker/outdoor_only)
- guests_allowed (boolean)
- pets_allowed (boolean)
- move_in_date (YYYY-MM-DD format)
- contact_preference (phone/email/whatsapp/any)
- phone_number (string)

Return JSON object with these fields."""
        
        return await self.generate_json(prompt, system_instruction)
    
    # ============================================
    # Match Scorer Prompts
    # ============================================
    async def calculate_compatibility(
        self,
        buyer_profile: Dict,
        seller_profile: Dict,
        listing: Optional[Dict] = None
    ) -> Dict:
        """Calculate compatibility score between buyer and seller."""
        system_instruction = """You are a roommate compatibility analyst.
Evaluate lifestyle compatibility and provide detailed scoring.
Be fair and consider that some differences can be complementary."""
        
        prompt = f"""Calculate compatibility between these profiles:

BUYER PROFILE:
{json.dumps(buyer_profile, indent=2)}

SELLER PROFILE:
{json.dumps(seller_profile, indent=2)}

{"ROOM LISTING:" + json.dumps(listing, indent=2) if listing else ""}

Evaluate these factors:
1. Budget Match (0-20 points): Does rent fit buyer's budget?
2. Location Match (0-15 points): Is location convenient?
3. Lifestyle Compatibility (0-25 points): Cleanliness, sleep schedule, noise
4. Habits Match (0-20 points): Study habits, food preference
5. Rules Compatibility (0-20 points): Smoking, guests, pets policies

Return JSON:
{{
    "compatibility_score": <0-100>,
    "score_breakdown": {{
        "budget": <0-20>,
        "location": <0-15>,
        "lifestyle": <0-25>,
        "habits": <0-20>,
        "rules": <0-20>
    }},
    "justification": "<2-3 sentence explanation>",
    "factors": [
        {{"factor": "<name>", "impact": "positive/negative/neutral", "detail": "<explanation>"}}
    ]
}}"""
        
        return await self.generate_json(prompt, system_instruction)
    
    # ============================================
    # Red Flag Detection Prompts
    # ============================================
    async def detect_red_flags(
        self,
        buyer_profile: Dict,
        seller_profile: Dict,
        listing: Optional[Dict] = None
    ) -> Dict:
        """Detect potential red flags or conflicts."""
        system_instruction = """You are a safety and compatibility analyst.
Identify potential issues, conflicts, or suspicious patterns.
Be thorough but fair - not every difference is a red flag."""
        
        prompt = f"""Analyze these profiles for potential issues:

BUYER PROFILE:
{json.dumps(buyer_profile, indent=2)}

SELLER PROFILE:
{json.dumps(seller_profile, indent=2)}

{"ROOM LISTING:" + json.dumps(listing, indent=2) if listing else ""}

Check for:
1. Lifestyle Conflicts (smoking vs non-smoking, noise levels, etc.)
2. Budget Concerns (rent too high/low, suspicious pricing)
3. Incomplete/Suspicious Data (missing critical info, inconsistencies)
4. Safety Concerns (age gaps, isolated locations, etc.)
5. Compatibility Dealbreakers (pets when not allowed, etc.)

Return JSON:
{{
    "has_red_flags": <boolean>,
    "red_flags": [
        {{
            "flag_type": "<category>",
            "description": "<what's the issue>",
            "severity": "low/medium/high",
            "details": {{"reason": "<explanation>"}}
        }}
    ],
    "overall_risk": "low/medium/high"
}}

If no red flags, return empty red_flags array with has_red_flags: false."""
        
        return await self.generate_json(prompt, system_instruction)
    
    # ============================================
    # Wingman Prompts
    # ============================================
    async def generate_wingman_message(
        self,
        buyer_name: str,
        seller_name: str,
        compatibility_score: int,
        score_breakdown: Dict,
        red_flags: list
    ) -> Dict:
        """Generate friendly explanation for match results."""
        system_instruction = """You are a friendly housing advisor called "Wingman".
Communicate match results in a warm, helpful, and encouraging tone.
Be honest about issues but always offer constructive guidance."""
        
        # Determine tone based on score and red flags
        if compatibility_score >= 80 and not red_flags:
            tone_hint = "Very positive and exciting!"
        elif compatibility_score >= 60:
            tone_hint = "Positive with some notes"
        elif compatibility_score >= 40:
            tone_hint = "Neutral, highlight both pros and cons"
        else:
            tone_hint = "Gentle warning, offer alternatives"
        
        prompt = f"""Generate a friendly message for {buyer_name} about their match with {seller_name}.

Compatibility Score: {compatibility_score}%
Score Breakdown: {json.dumps(score_breakdown)}
Red Flags: {json.dumps(red_flags) if red_flags else "None"}

Tone: {tone_hint}

Return JSON:
{{
    "message": "<2-3 paragraph friendly message>",
    "tone": "positive/neutral/cautious",
    "suggestions": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"]
}}

Make it personal and helpful. If there are red flags, address them gently but honestly."""
        
        return await self.generate_json(prompt, system_instruction)
    
    # ============================================
    # Room Hunter Prompts
    # ============================================
    async def rank_listings(
        self,
        buyer_profile: Dict,
        listings_with_scores: list
    ) -> Dict:
        """Provide AI insights for ranked listings."""
        system_instruction = """You are a smart housing recommendation assistant.
Provide personalized insights about room recommendations."""
        
        prompt = f"""Review these room recommendations for the buyer:

BUYER PROFILE:
{json.dumps(buyer_profile, indent=2)}

TOP LISTINGS (already scored):
{json.dumps(listings_with_scores[:5], indent=2)}

For each listing, provide:
1. A one-line highlight (what makes it special for this buyer)
2. One potential concern to consider

Return JSON:
{{
    "insights": [
        {{
            "listing_id": "<id>",
            "highlight": "<one line>",
            "concern": "<one line or null>"
        }}
    ],
    "overall_advice": "<one paragraph general advice for this buyer>"
}}"""
        
        return await self.generate_json(prompt, system_instruction)


# Singleton instance
llm_service = LLMService()
