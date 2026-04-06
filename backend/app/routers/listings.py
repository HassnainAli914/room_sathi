"""
Room Listings Router
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.models.schemas import (
    RoomListingCreate,
    RoomListingUpdate,
    RoomListingResponse
)
from app.services.supabase_client import supabase_service


router = APIRouter()


@router.get("/")
async def get_listings(
    location: Optional[str] = None,
    min_rent: Optional[int] = None,
    max_rent: Optional[int] = None,
    num_rooms: Optional[int] = None,
    has_wifi: Optional[bool] = None,
    has_ac: Optional[bool] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get room listings with optional filters."""
    listings = await supabase_service.get_listings(
        location=location,
        min_rent=min_rent,
        max_rent=max_rent,
        has_wifi=has_wifi,
        has_ac=has_ac,
        limit=limit
    )
    
    return {
        "listings": listings,
        "count": len(listings),
        "offset": offset,
        "limit": limit
    }


@router.get("/seller/{seller_id}")
async def get_seller_listings(seller_id: str):
    """Get all listings by a seller."""
    listings = await supabase_service.get_listings_by_seller(seller_id)
    return {
        "listings": listings,
        "count": len(listings)
    }


@router.get("/{listing_id}")
async def get_listing(listing_id: str):
    """Get a specific listing by ID."""
    listing = await supabase_service.get_listing(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    return listing


@router.post("/")
async def create_listing(seller_id: str, listing: RoomListingCreate):
    """Create a new room listing."""
    data = listing.model_dump(exclude_none=True)
    data["seller_id"] = seller_id
    
    result = await supabase_service.create_listing(data)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create listing")
    
    return result


@router.put("/{listing_id}")
async def update_listing(listing_id: str, seller_id: str, listing: RoomListingUpdate):
    """Update a room listing."""
    existing = await supabase_service.get_listing(listing_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if existing.get("seller_id") != seller_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this listing")
    
    data = listing.model_dump(exclude_none=True)
    result = await supabase_service.update_listing(listing_id, data)
    
    return result


@router.delete("/{listing_id}")
async def delete_listing(listing_id: str, seller_id: str):
    """Delete a room listing."""
    existing = await supabase_service.get_listing(listing_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    if existing.get("seller_id") != seller_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")
    
    await supabase_service.delete_listing(listing_id)
    return {"message": "Listing deleted successfully"}


@router.post("/{listing_id}/save")
async def save_listing(listing_id: str, user_id: str):
    """Save a listing to favorites."""
    result = await supabase_service.save_listing(user_id, listing_id)
    return {"message": "Listing saved", "saved": True}


@router.delete("/{listing_id}/save")
async def unsave_listing(listing_id: str, user_id: str):
    """Remove a listing from favorites."""
    await supabase_service.unsave_listing(user_id, listing_id)
    return {"message": "Listing removed from saved", "saved": False}


@router.get("/saved/{user_id}")
async def get_saved_listings(user_id: str):
    """Get user's saved listings."""
    saved = await supabase_service.get_saved_listings(user_id)
    return {
        "listings": [item.get("room_listings") for item in saved if item.get("room_listings")],
        "count": len(saved)
    }
