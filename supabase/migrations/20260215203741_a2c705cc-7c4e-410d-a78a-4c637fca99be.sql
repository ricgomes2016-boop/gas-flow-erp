
-- Step 1: Add 'parceiro' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'parceiro';
