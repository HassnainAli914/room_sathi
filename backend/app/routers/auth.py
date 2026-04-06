"""
Authentication Router - Using HTTP-based Supabase client
"""
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from app.services.supabase_client import supabase_service


router = APIRouter()


class SignUpRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "buyer"  # buyer or seller


class SignInRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None
    session: Optional[dict] = None


@router.post("/signup", response_model=AuthResponse)
async def sign_up(request: SignUpRequest):
    """Register a new user."""
    try:
        # Sign up with Supabase Auth
        response = await supabase_service.sign_up(
            email=request.email,
            password=request.password,
            user_metadata={
                "full_name": request.full_name,
                "role": request.role
            }
        )
        
        user = response.get("user")
        session = response.get("session")
        
        if user:
            # Create user record in public.users table
            await supabase_service.create_user({
                "id": user.get("id"),
                "full_name": request.full_name,
                "role": request.role
            })
            
            return AuthResponse(
                success=True,
                message="Account created successfully. Please check your email to verify.",
                user={
                    "id": user.get("id"),
                    "email": user.get("email"),
                    "full_name": request.full_name,
                    "role": request.role
                },
                session={
                    "access_token": session.get("access_token") if session else None,
                    "refresh_token": session.get("refresh_token") if session else None
                } if session else None
            )
        else:
            return AuthResponse(
                success=False,
                message="Failed to create account"
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/signin", response_model=AuthResponse)
async def sign_in(request: SignInRequest):
    """Sign in an existing user."""
    try:
        response = await supabase_service.sign_in(
            email=request.email,
            password=request.password
        )
        
        user = response.get("user")
        session = response
        
        if user:
            # Get user details from public.users table
            user_data = await supabase_service.get_user_by_id(user.get("id"))
            
            return AuthResponse(
                success=True,
                message="Signed in successfully",
                user={
                    "id": user.get("id"),
                    "email": user.get("email"),
                    "full_name": user_data.get("full_name") if user_data else None,
                    "role": user_data.get("role") if user_data else "buyer"
                },
                session={
                    "access_token": session.get("access_token"),
                    "refresh_token": session.get("refresh_token")
                }
            )
        else:
            return AuthResponse(
                success=False,
                message="Invalid credentials"
            )
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/signout")
async def sign_out(authorization: Optional[str] = Header(None)):
    """Sign out the current user."""
    try:
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
            await supabase_service.sign_out(token)
        return {"success": True, "message": "Signed out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me")
async def get_current_user(user_id: str):
    """Get current user details - combines users and profiles tables."""
    user = await supabase_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = await supabase_service.get_profile(user_id)
    
    # Merge data: profile fields override user fields if present
    combined = {**user}
    if profile:
        combined.update(profile)
    
    return {
        "user": combined
    }
