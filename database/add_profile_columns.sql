-- Add missing columns to profiles table
-- Run this in Supabase SQL Editor

-- Add bio column for user description
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add occupation column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS occupation TEXT;

-- Optionally, add comment for documentation
COMMENT ON COLUMN profiles.bio IS 'User biography/description';
COMMENT ON COLUMN profiles.occupation IS 'User occupation (Student, Engineer, etc.)';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('bio', 'occupation');
