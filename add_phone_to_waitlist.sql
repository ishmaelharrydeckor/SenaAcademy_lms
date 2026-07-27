-- SQL command to add phone number column to the waitlist table
ALTER TABLE public.event_waitlist ADD COLUMN IF NOT EXISTS phone text;
