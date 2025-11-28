-- 1. Enable UUID extension (required for uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. robust Enum creation (safely handles re-runs)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'diet_type_enum') THEN
        CREATE TYPE diet_type_enum AS ENUM ('vegetarian','eggetarian','non_vegetarian','pescatarian','vegan');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'indian_region_enum') THEN
        CREATE TYPE indian_region_enum AS ENUM ('north','south','east','west');
    END IF;
    -- New enums for personalized RDA groups
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
        CREATE TYPE gender_enum AS ENUM ('male','female');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'age_group_enum') THEN
        CREATE TYPE age_group_enum AS ENUM ('teen','adult','older');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pregnancy_status_enum') THEN
        CREATE TYPE pregnancy_status_enum AS ENUM ('none','pregnant','lactating');
    END IF;
END
$$;


-- ======================================
-- 1. User Preferences
-- ======================================
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    diet_type diet_type_enum NOT NULL,
    current_state TEXT,
    home_state TEXT,
    region indian_region_enum,
    height_cm NUMERIC CHECK (height_cm > 0 AND height_cm < 300), -- Sanity check
    weight_kg NUMERIC CHECK (weight_kg > 0 AND weight_kg < 500), -- Sanity check
    meals_per_day INTEGER DEFAULT 3 CHECK (meals_per_day BETWEEN 1 AND 15),
    meal_slot_labels TEXT[], -- E.g. ['Breakfast', 'Lunch', 'Dinner']
    allergies TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_preferences'
          AND column_name = 'age_years'
    ) THEN
        ALTER TABLE user_preferences
        ADD COLUMN age_years INTEGER CHECK (age_years >= 1 AND age_years <= 120);
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_preferences'
          AND column_name = 'gender'
    ) THEN
        ALTER TABLE user_preferences
        ADD COLUMN gender gender_enum;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_preferences'
          AND column_name = 'age_group'
    ) THEN
        ALTER TABLE user_preferences
        ADD COLUMN age_group age_group_enum;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'user_preferences'
          AND column_name = 'pregnancy_status'
    ) THEN
        ALTER TABLE user_preferences
        ADD COLUMN pregnancy_status pregnancy_status_enum;
    END IF;

END
$$;

-- Trigger to auto-update 'updated_at'
CREATE TRIGGER trg_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ======================================
-- 2. User Dislikes (Exclusions)
-- ======================================
CREATE TABLE IF NOT EXISTS user_dislikes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT CHECK (content_type IN ('food','product','remedy','supplement','recipe')) NOT NULL,
    slug TEXT NOT NULL,
    source_id UUID, -- Optional link to your internal food DB tables
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate dislikes for the same item by the same user
    CONSTRAINT uq_user_dislikes_content UNIQUE (user_id, content_type, slug)
);

CREATE INDEX IF NOT EXISTS idx_user_dislikes_user_id ON user_dislikes (user_id);


-- ======================================
-- 3. Diet Plans
-- ======================================
CREATE TABLE IF NOT EXISTS diet_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    goal TEXT,
    target_calories NUMERIC CHECK (target_calories > 0),
    is_public BOOLEAN DEFAULT FALSE,
    is_template BOOLEAN DEFAULT FALSE, -- For system curated plans
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diet_plans_user ON diet_plans (user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plans_public ON diet_plans (is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_diet_plans_template ON diet_plans (is_template) WHERE is_template = TRUE;

-- Trigger to auto-update 'updated_at'
CREATE TRIGGER trg_diet_plans_updated_at
BEFORE UPDATE ON diet_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ======================================
-- 4. Diet Plan Items
-- ======================================
CREATE TABLE IF NOT EXISTS diet_plan_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES diet_plans(id) ON DELETE CASCADE,
    day_index INTEGER NOT NULL CHECK (day_index BETWEEN 0 AND 6), -- 0=Monday or Sunday depending on your logic
    meal_slot TEXT NOT NULL, -- Matches labels in user_preferences
    meal_slot_order INTEGER DEFAULT 0, -- To sort items within a single meal (e.g. Drink first, then Main)
    content_type TEXT CHECK (content_type IN ('food','recipe','product','remedy','supplement')) NOT NULL,
    source_id UUID, -- ID of the actual food/recipe item
    slug TEXT,      -- Readable ID of the food/recipe
    portion_size_grams NUMERIC CHECK (portion_size_grams > 0),
    portion_unit TEXT DEFAULT 'g', -- g, ml, serving, etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diet_items_plan_id ON diet_plan_items (plan_id);
-- Composite index for faster fetching of a specific day's plan
CREATE INDEX IF NOT EXISTS idx_diet_items_lookup ON diet_plan_items (plan_id, day_index, meal_slot);


-- 1. Enable RLS on all tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dislikes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plan_items ENABLE ROW LEVEL SECURITY;

-- 2. Policies for User Preferences
CREATE POLICY "Users can manage their own preferences"
ON user_preferences
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Policies for User Dislikes
CREATE POLICY "Users can manage their own dislikes"
ON user_dislikes
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Policies for Diet Plans
-- Users can see their own plans OR public plans OR system templates
CREATE POLICY "Users can view own, public, or template plans"
ON diet_plans
FOR SELECT
USING (
    auth.uid() = user_id 
    OR is_public = TRUE 
    OR is_template = TRUE
);

-- Users can only insert/update/delete their OWN plans
CREATE POLICY "Users can modify their own plans"
ON diet_plans
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
ON diet_plans
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
ON diet_plans
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Policies for Diet Plan Items
-- We check permissions based on the parent 'diet_plan'
CREATE POLICY "Users can view items for accessible plans"
ON diet_plan_items
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM diet_plans dp 
        WHERE dp.id = diet_plan_items.plan_id 
        AND (dp.user_id = auth.uid() OR dp.is_public = TRUE OR dp.is_template = TRUE)
    )
);

CREATE POLICY "Users can modify items in their own plans"
ON diet_plan_items
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM diet_plans dp 
        WHERE dp.id = diet_plan_items.plan_id 
        AND dp.user_id = auth.uid()
    )
);


