-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Tank setups table
CREATE TABLE IF NOT EXISTS tank_setups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    volume INTEGER NOT NULL CHECK (volume > 0 AND volume <= 10000),
    lighting VARCHAR(50) NOT NULL,
    filtration TEXT[] DEFAULT '{}',
    has_protein_skimmer BOOLEAN DEFAULT FALSE,
    has_heater BOOLEAN DEFAULT TRUE,
    has_wavemaker BOOLEAN DEFAULT FALSE,
    water_ph DECIMAL(3,1) CHECK (water_ph >= 6.0 AND water_ph <= 9.0),
    water_salinity DECIMAL(5,3) CHECK (water_salinity >= 1.020 AND water_salinity <= 1.030),
    water_temperature INTEGER CHECK (water_temperature >= 70 AND water_temperature <= 85),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tank fish table
CREATE TABLE IF NOT EXISTS tank_fish (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tank_setup_id UUID NOT NULL REFERENCES tank_setups(id) ON DELETE CASCADE,
    species_id VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 100),
    UNIQUE(tank_setup_id, species_id)
);

-- Tank corals table  
CREATE TABLE IF NOT EXISTS tank_corals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tank_setup_id UUID NOT NULL REFERENCES tank_setups(id) ON DELETE CASCADE,
    species_id VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 100),
    UNIQUE(tank_setup_id, species_id)
);

-- Analysis results table (to cache AI responses)
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tank_setup_id UUID NOT NULL REFERENCES tank_setups(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 100),
    summary TEXT,
    general_assessment TEXT,
    breakdown JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated_at trigger function with secure search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Add updated_at trigger to tank_setups
CREATE TRIGGER update_tank_setups_updated_at 
    BEFORE UPDATE ON tank_setups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE tank_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tank_fish ENABLE ROW LEVEL SECURITY;
ALTER TABLE tank_corals ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tank_setups
CREATE POLICY "Users can view own tank setups" 
    ON tank_setups FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tank setups" 
    ON tank_setups FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tank setups" 
    ON tank_setups FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tank setups" 
    ON tank_setups FOR DELETE 
    USING (auth.uid() = user_id);

-- RLS Policies for tank_fish
CREATE POLICY "Users can view fish in own tanks" 
    ON tank_fish FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM tank_setups 
        WHERE tank_setups.id = tank_fish.tank_setup_id 
        AND tank_setups.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert fish in own tanks" 
    ON tank_fish FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM tank_setups 
        WHERE tank_setups.id = tank_fish.tank_setup_id 
        AND tank_setups.user_id = auth.uid()
    ));

CREATE POLICY "Users can update fish in own tanks" 
    ON tank_fish FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM tank_setups 
        WHERE tank_setups.id = tank_fish.tank_setup_id 
        AND tank_setups.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete fish in own tanks" 
    ON tank_fish FOR DELETE 
    USING (EXISTS (
        SELECT 1 FROM tank_setups 
        WHERE tank_setups.id = tank_fish.tank_setup_id 
        AND tank_setups.user_id = auth.uid()
    ));

-- RLS Policies for tank_corals
CREATE POLICY "Users can view corals in own tanks" 
    ON tank_corals FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM tank_setups 
        WHERE tank_setups.id = tank_corals.tank_setup_id 
        AND tank_setups.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert corals in own tanks" 
    ON tank_corals FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM tank_setups 
        WHERE tank_setups.id = tank_corals.tank_setup_id 
        AND tank_setups.user_id = auth.uid()
    ));

CREATE POLICY "Users can update corals in own tanks" 
    ON tank_corals FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM tank_setups 
        WHERE tank_setups.id = tank_corals.tank_setup_id 
        AND tank_setups.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete corals in own tanks" 
    ON tank_corals FOR DELETE 
    USING (EXISTS (
        SELECT 1 FROM tank_setups 
        WHERE tank_setups.id = tank_corals.tank_setup_id 
        AND tank_setups.user_id = auth.uid()
    ));

-- RLS Policies for analysis_results
CREATE POLICY "Users can view analysis of own tanks" 
    ON analysis_results FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM tank_setups 
        WHERE tank_setups.id = analysis_results.tank_setup_id 
        AND tank_setups.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert analysis for own tanks" 
    ON analysis_results FOR INSERT 
    WITH CHECK (EXISTS (
        SELECT 1 FROM tank_setups 
        WHERE tank_setups.id = analysis_results.tank_setup_id 
        AND tank_setups.user_id = auth.uid()
    ));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tank_setups_user_id ON tank_setups(user_id);
CREATE INDEX IF NOT EXISTS idx_tank_setups_created_at ON tank_setups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tank_fish_tank_setup_id ON tank_fish(tank_setup_id);
CREATE INDEX IF NOT EXISTS idx_tank_corals_tank_setup_id ON tank_corals(tank_setup_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_tank_setup_id ON analysis_results(tank_setup_id);

-- Note: Removed complete_tank_setups view as it's not used in the application
-- Data joining is handled in the application layer via TankSetupService