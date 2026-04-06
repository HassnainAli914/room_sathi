-- =============================================
-- RE-ENABLE Row Level Security (Fixed)
-- Run this AFTER setting up service_role key in backend
-- =============================================

-- Re-enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.red_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Drop ALL existing policies first
-- =============================================

-- USERS table - drop all
DROP POLICY IF EXISTS "Users can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;

-- PROFILES table - drop all
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow all operations on profiles" ON public.profiles;

-- ROOM_LISTINGS table - drop all
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON public.room_listings;
DROP POLICY IF EXISTS "Sellers can manage own listings" ON public.room_listings;

-- MATCHES table - drop all
DROP POLICY IF EXISTS "Users can view own matches" ON public.matches;
DROP POLICY IF EXISTS "Users can manage own matches" ON public.matches;

-- RED_FLAGS table - drop all
DROP POLICY IF EXISTS "Users can view own red flags" ON public.red_flags;
DROP POLICY IF EXISTS "Users can insert red flags" ON public.red_flags;

-- SAVED_LISTINGS table - drop all
DROP POLICY IF EXISTS "Users can manage own saved listings" ON public.saved_listings;

-- =============================================
-- Create fresh RLS policies
-- =============================================

-- USERS table policies
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own record" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- PROFILES table policies  
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ROOM_LISTINGS table policies
CREATE POLICY "Listings are viewable by everyone" ON public.room_listings FOR SELECT USING (true);
CREATE POLICY "Sellers can manage own listings" ON public.room_listings FOR ALL USING (auth.uid() = seller_id);

-- MATCHES table policies
CREATE POLICY "Users can view own matches" ON public.matches FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can manage own matches" ON public.matches FOR ALL USING (auth.uid() = buyer_id);

-- RED_FLAGS table policies
CREATE POLICY "Users can view own red flags" ON public.red_flags FOR SELECT USING (true);
CREATE POLICY "Users can insert red flags" ON public.red_flags FOR INSERT WITH CHECK (true);

-- SAVED_LISTINGS table policies
CREATE POLICY "Users can manage own saved listings" ON public.saved_listings FOR ALL USING (auth.uid() = user_id);
