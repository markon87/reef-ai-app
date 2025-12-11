-- Check if we need to rename mime_type to content_type or add content_type column
DO $$ 
BEGIN 
    -- If mime_type exists and content_type doesn't, rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_tank_images' AND column_name = 'mime_type') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_tank_images' AND column_name = 'content_type') THEN
        ALTER TABLE user_tank_images RENAME COLUMN mime_type TO content_type;
    -- If neither exists, add content_type
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_tank_images' AND column_name = 'content_type') THEN
        ALTER TABLE user_tank_images ADD COLUMN content_type VARCHAR(100);
    END IF;
END $$;

-- Storage bucket and policies will be created manually in Supabase Dashboard
-- due to permission restrictions in migrations

-- Add image analysis results table if it doesn't exist
CREATE TABLE IF NOT EXISTS image_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES user_tank_images(id) ON DELETE CASCADE,
    analysis_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_image_analysis_results_user_id ON image_analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_image_analysis_results_image_id ON image_analysis_results(image_id);

-- Enable RLS
ALTER TABLE image_analysis_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for image_analysis_results
CREATE POLICY "Users can view own analysis results" 
    ON image_analysis_results FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis results" 
    ON image_analysis_results FOR INSERT 
    WITH CHECK (auth.uid() = user_id);