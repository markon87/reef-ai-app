-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_tank_images table
CREATE TABLE IF NOT EXISTS user_tank_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_tank_images_user_id ON user_tank_images(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tank_images_uploaded_at ON user_tank_images(uploaded_at DESC);

-- Enable RLS
ALTER TABLE user_tank_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_tank_images
CREATE POLICY "Users can view own tank images" 
    ON user_tank_images FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tank images" 
    ON user_tank_images FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tank images" 
    ON user_tank_images FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tank images" 
    ON user_tank_images FOR DELETE 
    USING (auth.uid() = user_id);

-- Create image analysis results table (separate from tank setup analysis)
CREATE TABLE IF NOT EXISTS image_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES user_tank_images(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 100),
    summary TEXT,
    breakdown JSONB,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for image analysis results
CREATE INDEX IF NOT EXISTS idx_image_analysis_results_user_id ON image_analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_image_analysis_results_image_id ON image_analysis_results(image_id);
CREATE INDEX IF NOT EXISTS idx_image_analysis_results_analyzed_at ON image_analysis_results(analyzed_at DESC);

-- Enable RLS for image analysis results
ALTER TABLE image_analysis_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for image_analysis_results
CREATE POLICY "Users can view own image analysis results" 
    ON image_analysis_results FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own image analysis results" 
    ON image_analysis_results FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own image analysis results" 
    ON image_analysis_results FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own image analysis results" 
    ON image_analysis_results FOR DELETE 
    USING (auth.uid() = user_id);