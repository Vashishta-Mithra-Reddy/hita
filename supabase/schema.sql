-- =====================================================
-- HITA PROJECT - DATABASE SCHEMA
-- =====================================================

-- =====================================================
-- 1. CATEGORIES TABLE
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(500),
    parent_category_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. BRANDS TABLE
-- =====================================================
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    description TEXT,
    logo_url VARCHAR(500),
    website_url VARCHAR(500),
    country_of_origin VARCHAR(100),
    is_certified_organic BOOLEAN DEFAULT false,
    certifications TEXT[], -- Array of certifications like "USDA Organic", "Fair Trade", etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug text NOT NULL UNIQUE,
    brand_id UUID REFERENCES brands(id),
    category_id UUID NOT NULL REFERENCES categories(id),
    description TEXT,
    short_description VARCHAR(500),
    
    -- Product Details
    ingredients TEXT[], -- Array of ingredients
    nutritional_info JSONB, -- Flexible JSON for nutrition facts
    allergen_info TEXT[], -- Common allergens
    
    -- Pricing & Availability
    affordability_rating INTEGER CHECK (affordability_rating >= 1 AND affordability_rating <= 5),
    price_range VARCHAR(20), -- e.g., "₹100-200", "₹500+"
    
    -- Highlights & Features
    highlight VARCHAR(200), -- Main selling point
    key_features TEXT[], -- Array of key features
    is_organic BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_sugar_free BOOLEAN DEFAULT false,
    
    -- Media
    main_image_url VARCHAR(500),
    additional_images TEXT[], -- Array of image URLs
    
    -- SEO & Discovery
    tags TEXT[], -- Array of searchable tags
    health_benefits TEXT[], -- Array of health benefits
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for better performance
    CONSTRAINT products_name_brand_unique UNIQUE(name, brand_id)
);

-- =====================================================
-- 4. PRODUCT LINKS TABLE (Purchase Links)
-- =====================================================
CREATE TABLE product_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    platform_name VARCHAR(100) NOT NULL, -- e.g., "Amazon", "Flipkart", "BigBasket"
    product_url VARCHAR(1000) NOT NULL,
    price DECIMAL(10, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    is_affiliate_link BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. OFFLINE AVAILABILITY TABLE
-- =====================================================
CREATE TABLE offline_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    store_chain VARCHAR(150) NOT NULL, -- e.g., "Reliance Fresh", "Spencer's", "DMart", "Big Bazaar"
    availability_status VARCHAR(50) DEFAULT 'Available', -- Available, Limited, Out of Stock
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT, -- Any additional availability notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(product_id, store_chain)
);

-- =====================================================
-- 6. REMEDY CATEGORIES TABLE
-- =====================================================
CREATE TABLE remedy_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(500),
    parent_category_id UUID REFERENCES remedy_categories(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. REMEDIES TABLE
-- =====================================================
CREATE TABLE remedies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(250) NOT NULL,
    slug text NOT NULL UNIQUE,
    category_id UUID NOT NULL REFERENCES remedy_categories(id),
    
    -- Content
    description TEXT NOT NULL,
    ingredients TEXT[] NOT NULL, -- Required ingredients
    preparation_method TEXT NOT NULL,
    usage_instructions TEXT NOT NULL,
    
    -- Safety & Efficacy
    precautions TEXT[], -- Safety warnings
    contraindications TEXT[], -- When not to use
    side_effects TEXT[], -- Possible side effects
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
    
    -- Difficulty & Time
    difficulty_level VARCHAR(20) DEFAULT 'Easy', -- Easy, Medium, Hard
    preparation_time_minutes INTEGER,
    treatment_duration VARCHAR(100), -- e.g., "2-3 days", "2 weeks"
    
    -- Additional Info
    scientific_backing TEXT, -- Research references
    traditional_use TEXT, -- Historical context
    alternative_remedies TEXT[], -- Related remedies
    
    -- Media
    main_image_url VARCHAR(500),
    step_images TEXT[], -- Array of step-by-step images
    video_url VARCHAR(500),
    
    -- Discovery
    tags TEXT[],
    symptoms_treated TEXT[], -- What symptoms this helps with
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false, -- Reviewed by experts
    is_featured BOOLEAN DEFAULT false,
    
    -- Metadata
    created_by VARCHAR(150), -- Expert/contributor name
    reviewed_by VARCHAR(150), -- Medical reviewer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. SUPPLEMENTATION GUIDES TABLE
-- =====================================================
CREATE TABLE supplementation_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(250) NOT NULL,
    supplement_name VARCHAR(150) NOT NULL,
    
    -- Content
    description TEXT NOT NULL,
    benefits TEXT[] NOT NULL,
    recommended_dosage TEXT NOT NULL,
    best_time_to_take VARCHAR(100), -- e.g., "Morning with breakfast"
    duration_of_use VARCHAR(100), -- e.g., "3-6 months"
    
    -- Safety
    side_effects TEXT[],
    drug_interactions TEXT[],
    contraindications TEXT[],
    special_populations_notes TEXT, -- Pregnancy, elderly, etc.
    
    -- Quality & Selection
    what_to_look_for TEXT[], -- Quality indicators
    forms_available TEXT[], -- Capsule, powder, liquid, etc.
    storage_instructions TEXT,
    
    -- Scientific Info
    mechanism_of_action TEXT,
    research_summary TEXT,
    evidence_quality VARCHAR(20) DEFAULT 'Moderate', -- Strong, Moderate, Limited
    
    -- Related Information
    food_sources TEXT[], -- Natural food sources
    deficiency_symptoms TEXT[],
    related_supplements TEXT[],
    
    -- Media & Resources
    main_image_url VARCHAR(500),
    infographic_url VARCHAR(500),
    reference_links TEXT[],
    
    -- Discovery
    tags TEXT[],
    health_goals TEXT[], -- Weight loss, immunity, energy, etc.
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_expert_reviewed BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    
    -- Metadata
    created_by VARCHAR(150),
    reviewed_by VARCHAR(150),
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. USER FAVORITES TABLE (for future user features)
-- =====================================================
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Will reference auth.users when auth is implemented
    item_type VARCHAR(20) NOT NULL, -- 'product', 'remedy', 'supplement_guide'
    item_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, item_type, item_id)
);

-- =====================================================
-- 10. REVIEWS & RATINGS TABLE (for future features)
-- =====================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Will reference auth.users
    item_type VARCHAR(20) NOT NULL, -- 'product', 'remedy', 'supplement_guide'
    item_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, item_type, item_id)
);


-- Create the wellness_tips table
create table if not exists wellness_tips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text not null,
  slug text NOT NULL UNIQUE,
  content text not null,
  category text, -- e.g., 'gut health', 'sleep', etc.
  created_at timestamp with time zone default now()
);

-- ======================================
-- Trigger function to auto-update `updated_at`
-- ======================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ======================================
-- Table: food_categories
-- ======================================
CREATE TABLE food_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  parent_category_id UUID REFERENCES food_categories(id),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER trg_update_food_categories
BEFORE UPDATE ON food_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ======================================
-- Table: foods
-- ======================================
  CREATE TABLE foods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES food_categories(id) NOT NULL,
    description TEXT,
    short_description TEXT,
    nutritional_info JSONB,
    selection_tips TEXT[],
    is_vegetarian BOOLEAN DEFAULT true,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_dairy_free BOOLEAN DEFAULT false,
    main_image_url TEXT,
    additional_images TEXT[],
    tags TEXT[],
    preparation_tips TEXT[],
    storage_tips TEXT[],
    is_common BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE TRIGGER trg_update_foods
  BEFORE UPDATE ON foods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

  -- ======================================
  -- Table: vitamins (master list)
  -- ======================================
  CREATE TABLE vitamins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
  );

  -- ======================================
  -- Table: minerals (master list)
  -- ======================================
  CREATE TABLE minerals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
  );

-- ======================================
-- Table: vitamin_rda
-- ======================================
CREATE TABLE vitamin_rda (
  vitamin_id UUID PRIMARY KEY REFERENCES vitamins(id),
  recommended_daily_amount NUMERIC NOT NULL,
  unit TEXT NOT NULL
);

-- ======================================
-- Table: mineral_rda
-- ======================================
CREATE TABLE mineral_rda (
  mineral_id UUID PRIMARY KEY REFERENCES minerals(id),
  recommended_daily_amount NUMERIC NOT NULL,
  unit TEXT NOT NULL
);

-- ======================================
-- Many-to-many: food_vitamins (quantified)
-- ======================================
CREATE TABLE food_vitamins (
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
  vitamin_id UUID REFERENCES vitamins(id) ON DELETE CASCADE,
  amount_per_100g NUMERIC,
  unit TEXT,
  PRIMARY KEY (food_id, vitamin_id)
);

-- ======================================
-- Many-to-many: food_minerals (quantified)
-- ======================================
CREATE TABLE food_minerals (
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
  mineral_id UUID REFERENCES minerals(id) ON DELETE CASCADE,
  amount_per_100g NUMERIC,
  unit TEXT,
  PRIMARY KEY (food_id, mineral_id)
);

-- ======================================
-- Table: seasons (master list)
-- ======================================
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE
);

-- ======================================
-- Table: regions (master list)
-- ======================================
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE
);

-- ======================================
-- Many-to-many: food_seasons
-- ======================================
CREATE TABLE food_seasons (
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
  PRIMARY KEY (food_id, season_id)
);

-- ======================================
-- Many-to-many: food_regions
-- ======================================
CREATE TABLE food_regions (
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
  region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
  PRIMARY KEY (food_id, region_id)
);

-- ======================================
-- Table: food_health_benefits
-- ======================================
CREATE TABLE food_health_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
  benefit TEXT NOT NULL
);

-- ======================================
-- Indexes for search optimization
-- ======================================
CREATE INDEX idx_foods_name ON foods USING gin (name gin_trgm_ops);
CREATE INDEX idx_foods_description ON foods USING gin (description gin_trgm_ops);
CREATE INDEX idx_foods_tags ON foods USING gin (tags);
CREATE INDEX idx_foods_prep_tips ON foods USING gin (preparation_tips);
CREATE INDEX idx_foods_storage_tips ON foods USING gin (storage_tips);
CREATE INDEX idx_health_benefits_text ON food_health_benefits USING gin (benefit gin_trgm_ops);

CREATE TABLE embeddings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  content text NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 size
  metadata jsonb,
  content_type text, -- 'food', 'product', 'remedy', 'supplement'
  source_id uuid, -- references the actual item
  created_at timestamptz DEFAULT now()
);

CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);


-- =====================================================
-- RECIPE SYSTEM - DATABASE SCHEMA (Supabase Ready)
-- =====================================================

-- UUID generator extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- 1. RECIPE CATEGORIES TABLE
-- =====================================================
CREATE TABLE recipe_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    parent_category_id UUID REFERENCES recipe_categories(id),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. RECIPES TABLE
-- =====================================================
CREATE TYPE recipe_difficulty_enum AS ENUM ('very_easy','easy','medium','hard','expert');

CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES recipe_categories(id),
    description TEXT,
    short_description TEXT,
    
    -- Timing
    prep_time_minutes INTEGER,
    cook_time_minutes INTEGER,
    total_time_minutes INTEGER GENERATED ALWAYS AS (
        COALESCE(prep_time_minutes, 0) + COALESCE(cook_time_minutes, 0)
    ) STORED,
    
    -- Recipe Details
    servings INTEGER,
    difficulty_level recipe_difficulty_enum,
    
    -- Nutritional Information
    nutritional_info JSONB,
    
    -- Classification
    cuisine_type TEXT,
    meal_type TEXT[], -- e.g. ['breakfast', 'dinner']
    dietary_tags TEXT[], -- e.g. ['vegan','gluten-free']
    
    -- Media
    main_image_url TEXT,
    additional_images TEXT[],
    
    -- Tips and Info
    cooking_tips TEXT[],
    storage_tips TEXT[],
    tags TEXT[],
    
    -- Health Benefits (now array, not separate table)
    health_benefits TEXT[],
    
    -- Instructions (structured JSON for order + metadata)
    instructions JSONB, -- [{step, instruction, duration_minutes, temperature, notes}]
    
    -- Boolean Flags
    is_healthy BOOLEAN DEFAULT false,
    is_quick BOOLEAN DEFAULT false,
    is_vegetarian BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    is_dairy_free BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,

    source_url TEXT UNIQUE,
    recipe_source TEXT UNIQUE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. INGREDIENTS (MASTER LIST)
-- =====================================================
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. RECIPE INGREDIENTS (Link Recipes to Ingredients/Foods/Products)
-- =====================================================
CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id),
    food_id UUID REFERENCES foods(id),
    product_id UUID REFERENCES products(id),
    quantity NUMERIC,
    unit TEXT,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TOOLS (MASTER LIST)
-- =====================================================
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    tool_type TEXT, -- 'appliance','cookware','utensil','bakeware'
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RECIPE TOOLS (Link Recipes to Tools)
-- =====================================================
CREATE TABLE recipe_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
    is_essential BOOLEAN DEFAULT true,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Recipe search
CREATE INDEX idx_recipes_slug ON recipes(slug);
CREATE INDEX idx_recipes_name ON recipes USING gin (name gin_trgm_ops);
CREATE INDEX idx_recipes_description ON recipes USING gin (description gin_trgm_ops);
CREATE INDEX idx_recipes_tags ON recipes USING gin (tags);
CREATE INDEX idx_recipes_dietary_tags ON recipes USING gin (dietary_tags);
CREATE INDEX idx_recipes_meal_type ON recipes USING gin (meal_type);

-- Boolean filters
CREATE INDEX idx_recipes_is_healthy ON recipes (is_healthy) WHERE is_healthy = true;
CREATE INDEX idx_recipes_is_quick ON recipes (is_quick) WHERE is_quick = true;
CREATE INDEX idx_recipes_is_vegetarian ON recipes (is_vegetarian) WHERE is_vegetarian = true;
CREATE INDEX idx_recipes_is_vegan ON recipes (is_vegan) WHERE is_vegan = true;
CREATE INDEX idx_recipes_is_gluten_free ON recipes (is_gluten_free) WHERE is_gluten_free = true;
CREATE INDEX idx_recipes_is_dairy_free ON recipes (is_dairy_free) WHERE is_dairy_free = true;
CREATE INDEX idx_recipes_is_featured ON recipes (is_featured) WHERE is_featured = true;

-- Ingredients
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients (recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients (ingredient_id);
CREATE INDEX idx_recipe_ingredients_food_id ON recipe_ingredients (food_id);
CREATE INDEX idx_recipe_ingredients_product_id ON recipe_ingredients (product_id);

-- Tools
CREATE INDEX idx_recipe_tools_recipe_id ON recipe_tools (recipe_id);
CREATE INDEX idx_recipe_tools_name ON recipe_tools USING gin (tool_name gin_trgm_ops);