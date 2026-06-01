-- Run this in Supabase Dashboard → SQL Editor

-- 1. Create the storage bucket (skip if already created via Dashboard UI)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'patient-documents',
  'patient-documents',
  false,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS policy: users can only access their own patient's documents
--    Files stored at {user_id}/{patient_id}/{uuid}-{filename}
CREATE POLICY "Users own their patient documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'patient-documents'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
