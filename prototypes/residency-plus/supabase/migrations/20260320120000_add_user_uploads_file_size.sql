-- User Uploads: store original file size (bytes) for UI usage panels
ALTER TABLE public.user_uploads
  ADD COLUMN IF NOT EXISTS file_size bigint NULL;

