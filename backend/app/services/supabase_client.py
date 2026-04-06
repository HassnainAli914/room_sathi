"""
Room Matcher AI - Supabase Client Service (HTTP-based)
Uses direct HTTP calls instead of supabase-py SDK for Python 3.14 compatibility
"""
import httpx
from typing import Any, Optional
from functools import lru_cache
from ..config import get_settings


class SupabaseService:
    """Supabase service using direct REST API calls."""
    
    def __init__(self):
        settings = get_settings()
        self.url = settings.supabase_url
        # Use service_role key for backend operations (bypasses RLS)
        self.key = settings.supabase_service_key or settings.supabase_key
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        self.rest_url = f"{self.url}/rest/v1"
        self.auth_url = f"{self.url}/auth/v1"
    
    async def _request(self, method: str, endpoint: str, data: dict = None, params: dict = None) -> Any:
        """Make HTTP request to Supabase REST API."""
        async with httpx.AsyncClient() as client:
            url = f"{self.rest_url}/{endpoint}"
            response = await client.request(
                method=method,
                url=url,
                headers=self.headers,
                json=data,
                params=params,
                timeout=30.0
            )
            if response.status_code >= 400:
                raise Exception(f"Supabase error: {response.status_code} - {response.text}")
            return response.json() if response.text else None
    
    # ==================== AUTH ====================
    
    async def sign_up(self, email: str, password: str, user_metadata: dict = None) -> dict:
        """Sign up a new user."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/signup",
                headers={"apikey": self.key, "Content-Type": "application/json"},
                json={
                    "email": email,
                    "password": password,
                    "data": user_metadata or {}
                },
                timeout=30.0
            )
            if response.status_code >= 400:
                raise Exception(f"Auth error: {response.text}")
            return response.json()
    
    async def sign_in(self, email: str, password: str) -> dict:
        """Sign in user with email and password."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.auth_url}/token?grant_type=password",
                headers={"apikey": self.key, "Content-Type": "application/json"},
                json={"email": email, "password": password},
                timeout=30.0
            )
            if response.status_code >= 400:
                raise Exception(f"Auth error: {response.text}")
            return response.json()
    
    async def sign_out(self, access_token: str) -> None:
        """Sign out user."""
        async with httpx.AsyncClient() as client:
            await client.post(
                f"{self.auth_url}/logout",
                headers={
                    "apikey": self.key,
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )
    
    async def get_user(self, access_token: str) -> dict:
        """Get current user from access token."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.auth_url}/user",
                headers={
                    "apikey": self.key,
                    "Authorization": f"Bearer {access_token}"
                },
                timeout=30.0
            )
            if response.status_code >= 400:
                raise Exception(f"Auth error: {response.text}")
            return response.json()
    
    # ==================== USERS ====================
    
    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Get user by ID."""
        result = await self._request("GET", "users", params={"id": f"eq.{user_id}", "select": "*"})
        return result[0] if result else None
    
    async def create_user(self, user_data: dict) -> dict:
        """Create a new user record."""
        result = await self._request("POST", "users", data=user_data)
        return result[0] if result else user_data
    
    async def update_user(self, user_id: str, user_data: dict) -> dict:
        """Update user record."""
        result = await self._request("PATCH", f"users?id=eq.{user_id}", data=user_data)
        return result[0] if result else user_data
    
    # ==================== PROFILES ====================
    
    async def get_profile(self, user_id: str) -> Optional[dict]:
        """Get profile by user ID."""
        result = await self._request("GET", "profiles", params={"user_id": f"eq.{user_id}", "select": "*"})
        return result[0] if result else None
    
    async def create_profile(self, profile_data: dict) -> dict:
        """Create a new profile."""
        result = await self._request("POST", "profiles", data=profile_data)
        return result[0] if result else profile_data
    
    async def update_profile(self, user_id: str, profile_data: dict) -> dict:
        """Update profile."""
        result = await self._request("PATCH", f"profiles?user_id=eq.{user_id}", data=profile_data)
        return result[0] if result else profile_data
    
    # ==================== ROOM LISTINGS ====================
    
    async def get_listings(
        self,
        location: str = None,
        min_rent: int = None,
        max_rent: int = None,
        has_wifi: bool = None,
        has_ac: bool = None,
        limit: int = 50
    ) -> list:
        """Get room listings with filters."""
        params = {"select": "*,users(full_name)", "is_available": "eq.true", "limit": str(limit)}
        
        if location:
            params["location"] = f"ilike.%{location}%"
        if min_rent:
            params["rent"] = f"gte.{min_rent}"
        if max_rent:
            if "rent" in params:
                params["rent"] = f"gte.{min_rent}"
                # Add another filter - Supabase REST API limitation workaround
            else:
                params["rent"] = f"lte.{max_rent}"
        if has_wifi:
            params["has_wifi"] = "eq.true"
        if has_ac:
            params["has_ac"] = "eq.true"
        
        return await self._request("GET", "room_listings", params=params)
    
    async def get_listing(self, listing_id: str) -> Optional[dict]:
        """Get single listing by ID."""
        result = await self._request("GET", "room_listings", params={
            "id": f"eq.{listing_id}",
            "select": "*,users(full_name)"
        })
        return result[0] if result else None
    
    async def get_listings_by_seller(self, seller_id: str) -> list:
        """Get listings by seller ID."""
        return await self._request("GET", "room_listings", params={
            "seller_id": f"eq.{seller_id}",
            "select": "*"
        })
    
    async def create_listing(self, listing_data: dict) -> dict:
        """Create a new room listing."""
        result = await self._request("POST", "room_listings", data=listing_data)
        return result[0] if result else listing_data
    
    async def update_listing(self, listing_id: str, listing_data: dict) -> dict:
        """Update a room listing."""
        result = await self._request("PATCH", f"room_listings?id=eq.{listing_id}", data=listing_data)
        return result[0] if result else listing_data
    
    async def delete_listing(self, listing_id: str) -> None:
        """Delete a room listing."""
        await self._request("DELETE", f"room_listings?id=eq.{listing_id}")
    
    # ==================== MATCHES ====================
    
    async def get_matches(self, buyer_id: str) -> list:
        """Get matches for a buyer."""
        return await self._request("GET", "matches", params={
            "buyer_id": f"eq.{buyer_id}",
            "select": "*,room_listings(*)"
        })
    
    async def get_match(self, match_id: str) -> Optional[dict]:
        """Get single match by ID."""
        result = await self._request("GET", "matches", params={
            "id": f"eq.{match_id}",
            "select": "*,room_listings(*),red_flags(*)"
        })
        return result[0] if result else None
    
    async def create_match(self, match_data: dict) -> dict:
        """Create a new match record."""
        result = await self._request("POST", "matches", data=match_data)
        return result[0] if result else match_data
    
    async def update_match(self, match_id: str, match_data: dict) -> dict:
        """Update a match record."""
        result = await self._request("PATCH", f"matches?id=eq.{match_id}", data=match_data)
        return result[0] if result else match_data
    
    # ==================== RED FLAGS ====================
    
    async def get_red_flags(self, match_id: str = None, user_id: str = None) -> list:
        """Get red flags for a match or user."""
        params = {"select": "*"}
        if match_id:
            params["match_id"] = f"eq.{match_id}"
        if user_id:
            params["user_id"] = f"eq.{user_id}"
        return await self._request("GET", "red_flags", params=params)
    
    async def create_red_flag(self, flag_data: dict) -> dict:
        """Create a new red flag."""
        result = await self._request("POST", "red_flags", data=flag_data)
        return result[0] if result else flag_data
    
    # ==================== SAVED LISTINGS ====================
    
    async def get_saved_listings(self, user_id: str) -> list:
        """Get saved listings for a user."""
        return await self._request("GET", "saved_listings", params={
            "user_id": f"eq.{user_id}",
            "select": "*,room_listings(*)"
        })
    
    async def save_listing(self, user_id: str, listing_id: str) -> dict:
        """Save a listing for a user."""
        result = await self._request("POST", "saved_listings", data={
            "user_id": user_id,
            "listing_id": listing_id
        })
        return result[0] if result else {"user_id": user_id, "listing_id": listing_id}
    
    async def unsave_listing(self, user_id: str, listing_id: str) -> None:
        """Remove a saved listing."""
        await self._request("DELETE", f"saved_listings?user_id=eq.{user_id}&listing_id=eq.{listing_id}")


@lru_cache()
def get_supabase_service() -> SupabaseService:
    """Get cached Supabase service instance."""
    return SupabaseService()


# Export instance
supabase_service = get_supabase_service()
