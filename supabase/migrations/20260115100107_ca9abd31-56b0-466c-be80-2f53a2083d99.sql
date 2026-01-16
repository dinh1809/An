-- Add active_mode column to profiles table for context switching
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS active_mode TEXT CHECK (active_mode IN ('connect', 'assessment')) DEFAULT 'connect';