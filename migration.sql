-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/lbtvdvatzfkleyogqrjh/sql/new

-- 1. Add new columns to businesses table
ALTER TABLE public.businesses 
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- 2. Create storage bucket for business photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-photos', 
  'business-photos', 
  true, 
  204800, 
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies
CREATE POLICY "Public read business photos"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'business-photos');

CREATE POLICY "Authenticated upload business photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'business-photos');

CREATE POLICY "Authenticated update business photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'business-photos');
