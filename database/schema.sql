-- =============================================
-- Room Matcher AI - Supabase PostgreSQL Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS TABLE (extends Supabase Auth)
-- =============================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('buyer', 'seller')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. PROFILES TABLE (lifestyle & preferences)
-- =============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    city TEXT,
    university TEXT,
    monthly_budget_min INTEGER,
    monthly_budget_max INTEGER,
    preferred_location TEXT,
    -- Lifestyle Habits
    cleanliness TEXT CHECK (cleanliness IN ('very_clean', 'clean', 'moderate', 'relaxed')),
    sleep_schedule TEXT CHECK (sleep_schedule IN ('early_bird', 'night_owl', 'flexible')),
    study_habits TEXT CHECK (study_habits IN ('quiet_studier', 'group_studier', 'flexible')),
    food_preference TEXT CHECK (food_preference IN ('vegetarian', 'non_vegetarian', 'vegan', 'no_preference')),
    noise_tolerance TEXT CHECK (noise_tolerance IN ('silent', 'low', 'moderate', 'high')),
    -- Preferences
    smoking TEXT CHECK (smoking IN ('smoker', 'non_smoker', 'outdoor_only')),
    guests_allowed BOOLEAN DEFAULT true,
    pets_allowed BOOLEAN DEFAULT false,
    move_in_date DATE,
    contact_preference TEXT CHECK (contact_preference IN ('phone', 'email', 'whatsapp', 'any')),
    phone_number TEXT,
    -- Metadata
    raw_input TEXT, -- Original input for AI parsing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =============================================
-- 3. ROOM LISTINGS TABLE (Seller properties)
-- =============================================
CREATE TABLE public.room_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    address TEXT,
    rent INTEGER NOT NULL,
    deposit INTEGER,
    num_rooms INTEGER DEFAULT 1,
    num_beds INTEGER DEFAULT 1,
    -- Facilities
    has_wifi BOOLEAN DEFAULT false,
    has_ac BOOLEAN DEFAULT false,
    has_laundry BOOLEAN DEFAULT false,
    has_kitchen BOOLEAN DEFAULT false,
    has_parking BOOLEAN DEFAULT false,
    has_furnished BOOLEAN DEFAULT false,
    other_facilities TEXT[],
    -- Photos
    photos TEXT[], -- Array of image URLs
    -- Availability
    is_available BOOLEAN DEFAULT true,
    available_from DATE,
    -- Preferences (what kind of tenant they want)
    preferred_gender TEXT CHECK (preferred_gender IN ('male', 'female', 'any')),
    preferred_age_min INTEGER,
    preferred_age_max INTEGER,
    smoking_allowed BOOLEAN DEFAULT false,
    pets_allowed BOOLEAN DEFAULT false,
    -- Metadata
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. MATCHES TABLE (compatibility scores)
-- =============================================
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.room_listings(id) ON DELETE CASCADE,
    compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
    score_breakdown JSONB, -- Detailed breakdown of scoring factors
    justification TEXT, -- AI-generated explanation
    wingman_message TEXT, -- Friendly explanation
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(buyer_id, listing_id)
);

-- =============================================
-- 5. RED FLAGS TABLE (warnings/risks)
-- =============================================
CREATE TABLE public.red_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.room_listings(id) ON DELETE CASCADE,
    flag_type TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. SAVED LISTINGS TABLE (Buyer favorites)
-- =============================================
CREATE TABLE public.saved_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES public.room_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_city ON public.profiles(city);
CREATE INDEX idx_room_listings_seller_id ON public.room_listings(seller_id);
CREATE INDEX idx_room_listings_location ON public.room_listings(location);
CREATE INDEX idx_room_listings_rent ON public.room_listings(rent);
CREATE INDEX idx_room_listings_is_available ON public.room_listings(is_available);
CREATE INDEX idx_matches_buyer_id ON public.matches(buyer_id);
CREATE INDEX idx_matches_seller_id ON public.matches(seller_id);
CREATE INDEX idx_matches_listing_id ON public.matches(listing_id);
CREATE INDEX idx_red_flags_match_id ON public.red_flags(match_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.red_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- Users: can read all, update own
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own record" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Profiles: can read all, update own
CREATE POLICY "Profiles are viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Room Listings: everyone can read available, sellers can manage own
CREATE POLICY "Available listings are viewable by all" ON public.room_listings FOR SELECT USING (true);
CREATE POLICY "Sellers can insert own listings" ON public.room_listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own listings" ON public.room_listings FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete own listings" ON public.room_listings FOR DELETE USING (auth.uid() = seller_id);

-- Matches: users can see their own matches
CREATE POLICY "Users can view own matches" ON public.matches FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "System can insert matches" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own matches" ON public.matches FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Red Flags: users can see flags related to their matches
CREATE POLICY "Users can view relevant red flags" ON public.red_flags FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.matches WHERE matches.id = red_flags.match_id AND (matches.buyer_id = auth.uid() OR matches.seller_id = auth.uid()))
);
CREATE POLICY "System can insert red flags" ON public.red_flags FOR INSERT WITH CHECK (true);

-- Saved Listings: users can manage their own
CREATE POLICY "Users can view own saved listings" ON public.saved_listings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save listings" ON public.saved_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave listings" ON public.saved_listings FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_room_listings_updated_at BEFORE UPDATE ON public.room_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users to create public.users record
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
