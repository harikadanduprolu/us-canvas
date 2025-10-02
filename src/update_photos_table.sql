-- Update photos table to support Cloudinary URLs
-- Run this in your Supabase SQL editor to add Cloudinary support

-- Add cloudinary_public_id column to photos table
ALTER TABLE photos 
ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;

-- Update the comment for the data column to reflect it can now store URLs
COMMENT ON COLUMN photos.data IS 'Cloudinary URL or base64 encoded image data for fallback';
COMMENT ON COLUMN photos.cloudinary_public_id IS 'Public ID from Cloudinary for managing uploaded images';

-- Create index for cloudinary_public_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_photos_cloudinary_public_id ON photos(cloudinary_public_id);

SELECT 'Photos table updated successfully for Cloudinary integration' as status;
