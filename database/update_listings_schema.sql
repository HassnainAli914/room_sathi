-- =============================================
-- ROOM LISTINGS SCHEMA UPDATE
-- Add missing columns for the new Add Listing feature
-- Run this in Supabase SQL Editor
-- =============================================

-- Add new columns to room_listings table
ALTER TABLE public.room_listings
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS property_type TEXT CHECK (property_type IN ('apartment', 'pg', 'hostel', 'house')),
ADD COLUMN IF NOT EXISTS room_type TEXT CHECK (room_type IN ('single', 'shared', 'entire_place')),
ADD COLUMN IF NOT EXISTS near_university TEXT,
ADD COLUMN IF NOT EXISTS cover_image TEXT, -- Main cover image URL (16:9)
ADD COLUMN IF NOT EXISTS images TEXT[], -- Secondary images array (max 4, 4:3)
ADD COLUMN IF NOT EXISTS has_geyser BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_power_backup BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS guests_allowed BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS couples_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS inquiries_count INTEGER DEFAULT 0;

-- Rename rent to rent_amount for consistency (if needed, this is just an alias approach)
-- Note: If the column is named 'rent', you may want to create a view or update your API
-- to handle both names, or run:
-- ALTER TABLE public.room_listings RENAME COLUMN rent TO rent_amount;

-- Add deposit_amount as alias if needed
-- ALTER TABLE public.room_listings RENAME COLUMN deposit TO deposit_amount;

-- Create index for new columns
CREATE INDEX IF NOT EXISTS idx_room_listings_city ON public.room_listings(city);
CREATE INDEX IF NOT EXISTS idx_room_listings_property_type ON public.room_listings(property_type);
CREATE INDEX IF NOT EXISTS idx_room_listings_is_active ON public.room_listings(is_active);

-- =============================================
-- RLS POLICIES (if not already exists)
-- These should already be in place from schema.sql
-- =============================================

-- Check if policies exist, if not create them
DO $$
BEGIN
    -- Enable RLS
    ALTER TABLE public.room_listings ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    -- Already enabled
    NULL;
END $$;

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Available listings are viewable by all" ON public.room_listings;
DROP POLICY IF EXISTS "Sellers can insert own listings" ON public.room_listings;
DROP POLICY IF EXISTS "Sellers can update own listings" ON public.room_listings;
DROP POLICY IF EXISTS "Sellers can delete own listings" ON public.room_listings;

-- Recreate policies
CREATE POLICY "Available listings are viewable by all" 
ON public.room_listings FOR SELECT 
USING (true);

CREATE POLICY "Sellers can insert own listings" 
ON public.room_listings FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own listings" 
ON public.room_listings FOR UPDATE 
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own listings" 
ON public.room_listings FOR DELETE 
USING (auth.uid() = seller_id);

-- =============================================
-- FUNCTION: Increment views count
-- =============================================
CREATE OR REPLACE FUNCTION increment_listing_views(listing_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.room_listings
    SET views_count = views_count + 1
    WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- FUNCTION: Increment inquiries count
-- =============================================
CREATE OR REPLACE FUNCTION increment_listing_inquiries(listing_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.room_listings
    SET inquiries_count = inquiries_count + 1
    WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- VERIFICATION: Show updated table structure
-- =============================================
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'room_listings'
ORDER BY ordinal_position;
