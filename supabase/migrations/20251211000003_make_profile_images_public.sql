-- Update profile-images bucket to be public
UPDATE storage.buckets SET public = true WHERE id = 'profile-images';