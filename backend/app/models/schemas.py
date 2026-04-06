"""
Room Matcher AI - Pydantic Models
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


# ============================================
# Enums
# ============================================
class UserRole(str, Enum):
    BUYER = "buyer"
    SELLER = "seller"


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"


class Cleanliness(str, Enum):
    VERY_CLEAN = "very_clean"
    CLEAN = "clean"
    MODERATE = "moderate"
    RELAXED = "relaxed"


class SleepSchedule(str, Enum):
    EARLY_BIRD = "early_bird"
    NIGHT_OWL = "night_owl"
    FLEXIBLE = "flexible"


class StudyHabits(str, Enum):
    QUIET_STUDIER = "quiet_studier"
    GROUP_STUDIER = "group_studier"
    FLEXIBLE = "flexible"


class FoodPreference(str, Enum):
    VEGETARIAN = "vegetarian"
    NON_VEGETARIAN = "non_vegetarian"
    VEGAN = "vegan"
    NO_PREFERENCE = "no_preference"


class NoiseTolerance(str, Enum):
    SILENT = "silent"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


class Smoking(str, Enum):
    SMOKER = "smoker"
    NON_SMOKER = "non_smoker"
    OUTDOOR_ONLY = "outdoor_only"


class ContactPreference(str, Enum):
    PHONE = "phone"
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    ANY = "any"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# ============================================
# User Models
# ============================================
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    role: UserRole


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# Profile Models
# ============================================
class ProfileBase(BaseModel):
    age: Optional[int] = Field(None, ge=16, le=100)
    gender: Optional[Gender] = None
    city: Optional[str] = None
    university: Optional[str] = None
    monthly_budget_min: Optional[int] = Field(None, ge=0)
    monthly_budget_max: Optional[int] = Field(None, ge=0)
    preferred_location: Optional[str] = None
    cleanliness: Optional[Cleanliness] = None
    sleep_schedule: Optional[SleepSchedule] = None
    study_habits: Optional[StudyHabits] = None
    food_preference: Optional[FoodPreference] = None
    noise_tolerance: Optional[NoiseTolerance] = None
    smoking: Optional[Smoking] = None
    guests_allowed: Optional[bool] = True
    pets_allowed: Optional[bool] = False
    move_in_date: Optional[date] = None
    contact_preference: Optional[ContactPreference] = None
    phone_number: Optional[str] = None


class ProfileCreate(ProfileBase):
    raw_input: Optional[str] = None  # For AI parsing


class ProfileUpdate(ProfileBase):
    pass


class ProfileResponse(ProfileBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================
# Room Listing Models
# ============================================
class RoomListingBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: str
    address: Optional[str] = None
    rent: int = Field(ge=0)
    deposit: Optional[int] = Field(None, ge=0)
    num_rooms: int = Field(1, ge=1)
    num_beds: int = Field(1, ge=1)
    has_wifi: bool = False
    has_ac: bool = False
    has_laundry: bool = False
    has_kitchen: bool = False
    has_parking: bool = False
    has_furnished: bool = False
    other_facilities: Optional[List[str]] = []
    photos: Optional[List[str]] = []
    available_from: Optional[date] = None
    preferred_gender: Optional[str] = "any"
    preferred_age_min: Optional[int] = None
    preferred_age_max: Optional[int] = None
    smoking_allowed: bool = False
    pets_allowed: bool = False


class RoomListingCreate(RoomListingBase):
    pass


class RoomListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    rent: Optional[int] = None
    deposit: Optional[int] = None
    num_rooms: Optional[int] = None
    num_beds: Optional[int] = None
    has_wifi: Optional[bool] = None
    has_ac: Optional[bool] = None
    has_laundry: Optional[bool] = None
    has_kitchen: Optional[bool] = None
    has_parking: Optional[bool] = None
    has_furnished: Optional[bool] = None
    other_facilities: Optional[List[str]] = None
    photos: Optional[List[str]] = None
    is_available: Optional[bool] = None
    available_from: Optional[date] = None
    preferred_gender: Optional[str] = None
    smoking_allowed: Optional[bool] = None
    pets_allowed: Optional[bool] = None


class RoomListingResponse(RoomListingBase):
    id: str
    seller_id: str
    is_available: bool
    views_count: int
    created_at: datetime
    updated_at: datetime
    # Include seller info
    seller_name: Optional[str] = None
    compatibility_score: Optional[int] = None

    class Config:
        from_attributes = True


# ============================================
# Match Models
# ============================================
class MatchBase(BaseModel):
    buyer_id: str
    seller_id: str
    listing_id: Optional[str] = None
    compatibility_score: int = Field(ge=0, le=100)
    score_breakdown: Optional[dict] = None
    justification: Optional[str] = None
    wingman_message: Optional[str] = None


class MatchCreate(MatchBase):
    pass


class MatchResponse(MatchBase):
    id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# Red Flag Models
# ============================================
class RedFlagBase(BaseModel):
    flag_type: str
    description: str
    severity: Severity
    details: Optional[dict] = None


class RedFlagCreate(RedFlagBase):
    match_id: Optional[str] = None
    user_id: Optional[str] = None
    listing_id: Optional[str] = None


class RedFlagResponse(RedFlagBase):
    id: str
    match_id: Optional[str]
    user_id: Optional[str]
    listing_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================
# AI Agent Request/Response Models
# ============================================
class ParseProfileRequest(BaseModel):
    raw_input: str
    user_id: str


class ParseProfileResponse(BaseModel):
    success: bool
    profile: Optional[ProfileResponse] = None
    message: str


class ScoreMatchRequest(BaseModel):
    buyer_id: str
    seller_id: str
    listing_id: Optional[str] = None


class ScoreMatchResponse(BaseModel):
    compatibility_score: int
    score_breakdown: dict
    justification: str
    factors: List[dict]


class DetectRedFlagsRequest(BaseModel):
    buyer_id: str
    seller_id: str
    listing_id: Optional[str] = None


class DetectRedFlagsResponse(BaseModel):
    has_red_flags: bool
    red_flags: List[RedFlagResponse]
    overall_risk: Severity


class WingmanRequest(BaseModel):
    buyer_id: str
    seller_id: str
    compatibility_score: int
    red_flags: List[dict] = []


class WingmanResponse(BaseModel):
    message: str
    tone: str  # positive, neutral, cautious
    suggestions: List[str]


class RecommendRoomsRequest(BaseModel):
    buyer_id: str
    limit: int = 10
    filters: Optional[dict] = None


class RoomRecommendation(BaseModel):
    listing: RoomListingResponse
    compatibility_score: int
    wingman_message: str
    red_flags: List[RedFlagResponse]


class RecommendRoomsResponse(BaseModel):
    recommendations: List[RoomRecommendation]
    total_count: int
