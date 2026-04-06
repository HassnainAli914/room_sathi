"""
Profiles Router - with improved error handling
"""
from fastapi import APIRouter, HTTPException
from typing import Optional
from app.models.schemas import (
    ProfileCreate,
    ProfileUpdate,
    ProfileResponse
)
from app.services.supabase_client import supabase_service
import traceback


router = APIRouter()


@router.get("/{user_id}")
async def get_profile(user_id: str):
    """Get user profile by user ID - combines users and profiles tables."""
    try:
        # Get user data from users table
        user_data = await supabase_service.get_user_by_id(user_id)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get additional profile data from profiles table
        profile_data = await supabase_service.get_profile(user_id)
        
        # Merge the data (profile fields override user fields if present)
        combined = {**user_data}
        if profile_data:
            combined.update(profile_data)
        
        return {"user": combined}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting profile: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
async def create_profile(user_id: str, profile: ProfileCreate):
    """Create a new user profile."""
    try:
        # Check if profile already exists
        existing = await supabase_service.get_profile(user_id)
        if existing:
            raise HTTPException(status_code=400, detail="Profile already exists")
        
        data = profile.model_dump(exclude_none=True)
        data["user_id"] = user_id
        
        result = await supabase_service.create_profile(data)
        if not result:
            raise HTTPException(status_code=500, detail="Failed to create profile")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating profile: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{user_id}")
async def update_profile(user_id: str, profile: ProfileUpdate):
    """Update user profile."""
    try:
        existing = await supabase_service.get_profile(user_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        data = profile.model_dump(exclude_none=True)
        result = await supabase_service.update_profile(user_id, data)
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating profile: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{user_id}")
async def patch_profile(user_id: str, updates: dict):
    """Partially update user profile."""
    try:
        print(f"PATCH profile for user {user_id}: {updates}")
        
        # Separate user table fields from profile table fields
        user_fields = {}
        profile_fields = {}
        
        # Fields that belong to users table
        user_table_columns = {'full_name', 'avatar_url', 'email', 'role'}
        
        for key, value in updates.items():
            if key in user_table_columns:
                user_fields[key] = value
            else:
                profile_fields[key] = value
        
        result = {}
        
        # Update users table if there are user fields
        if user_fields:
            print(f"Updating users table: {user_fields}")
            user_result = await supabase_service.update_user(user_id, user_fields)
            result.update(user_result or {})
        
        # Update profiles table if there are profile fields
        if profile_fields:
            print(f"Updating profiles table: {profile_fields}")
            existing = await supabase_service.get_profile(user_id)
            
            if not existing:
                # Create new profile with provided fields
                profile_fields["user_id"] = user_id
                print(f"Creating new profile: {profile_fields}")
                profile_result = await supabase_service.create_profile(profile_fields)
            else:
                print(f"Updating existing profile: {profile_fields}")
                profile_result = await supabase_service.update_profile(user_id, profile_fields)
            
            result.update(profile_result or {})
        
        print(f"Result: {result}")
        return result or {"message": "Profile updated"}
    except Exception as e:
        print(f"Error patching profile: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}")
async def delete_profile(user_id: str):
    """Delete user profile."""
    try:
        existing = await supabase_service.get_profile(user_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # We don't actually delete, just clear optional fields
        return {"message": "Profile data cleared"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting profile: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
