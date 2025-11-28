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
-- New Table: vitamin_rda
-- ======================================
CREATE TABLE vitamin_rda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- New Unique ID for the row
  vitamin_id UUID NOT NULL REFERENCES vitamins(id) ON DELETE CASCADE,
  target_group VARCHAR(50) NOT NULL DEFAULT 'adult_generic', -- e.g. 'adult_male', 'pregnancy'
  recommended_daily_amount NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  
  -- Constraint: One vitamin can have many groups, but a group can only appear once per vitamin
  CONSTRAINT unique_vitamin_group UNIQUE (vitamin_id, target_group)
);

-- ======================================
-- New Table: mineral_rda
-- ======================================
CREATE TABLE mineral_rda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mineral_id UUID NOT NULL REFERENCES minerals(id) ON DELETE CASCADE,
  target_group VARCHAR(50) NOT NULL DEFAULT 'adult_generic',
  recommended_daily_amount NUMERIC NOT NULL,
  unit TEXT NOT NULL,

  CONSTRAINT unique_mineral_group UNIQUE (mineral_id, target_group)
);


-- ============================================================
--  AGE-BASED VITAMIN & MINERAL RDA/AI POPULATION SCRIPT
-- ============================================================
--  Sources:
--  1. ICMR-NIN (2020) - Recommended Dietary Allowances for Indians
--     (Tables A2, A3, A5 from provided documentation)
--  2. NASEM/NIH (Retained for Vit E, K, B5, Biotin where ICMR data was absent)
-- ============================================================

-- ============================================================
--  VITAMINS
-- ============================================================

INSERT INTO vitamin_rda (vitamin_id, target_group, recommended_daily_amount, unit)
VALUES
    ----------------------------------------------------------------------
    -- VITAMIN A (Retinol)
    -- Source: ICMR Table A2 & A3
    ----------------------------------------------------------------------
    ('522544fd-a569-4b4f-9df6-52c7fc398205', 'teen_male',    1000, 'mcg'), -- Boys 16-18y
    ('522544fd-a569-4b4f-9df6-52c7fc398205', 'teen_female',  840,  'mcg'), -- Girls 16-18y
    ('522544fd-a569-4b4f-9df6-52c7fc398205', 'adult_male',   1000, 'mcg'), -- Moderate Activity
    ('522544fd-a569-4b4f-9df6-52c7fc398205', 'adult_female', 840,  'mcg'), -- Moderate Activity
    ('522544fd-a569-4b4f-9df6-52c7fc398205', 'older_male',   1000, 'mcg'), -- Men >=60y
    ('522544fd-a569-4b4f-9df6-52c7fc398205', 'older_female', 840,  'mcg'), -- Women >=60y
    ('522544fd-a569-4b4f-9df6-52c7fc398205', 'pregnant',     900,  'mcg'),
    ('522544fd-a569-4b4f-9df6-52c7fc398205', 'lactating',    950,  'mcg'), -- 0-6m

    ----------------------------------------------------------------------
    -- VITAMIN C
    -- Source: ICMR Table A2 & A3
    ----------------------------------------------------------------------
    ('baa9c834-f9f6-4153-9966-3ddf2a52e631', 'teen_male',    85,  'mg'), -- Boys 16-18y
    ('baa9c834-f9f6-4153-9966-3ddf2a52e631', 'teen_female',  70,  'mg'), -- Girls 16-18y
    ('baa9c834-f9f6-4153-9966-3ddf2a52e631', 'adult_male',   80,  'mg'), -- Moderate
    ('baa9c834-f9f6-4153-9966-3ddf2a52e631', 'adult_female', 65,  'mg'), -- Moderate
    ('baa9c834-f9f6-4153-9966-3ddf2a52e631', 'older_male',   80,  'mg'), -- Men >=60y
    ('baa9c834-f9f6-4153-9966-3ddf2a52e631', 'older_female', 65,  'mg'), -- Women >=60y
    ('baa9c834-f9f6-4153-9966-3ddf2a52e631', 'pregnant',     80,  'mg'),
    ('baa9c834-f9f6-4153-9966-3ddf2a52e631', 'lactating',    115, 'mg'), -- 0-6m

    ----------------------------------------------------------------------
    -- VITAMIN D
    -- Source: ICMR Table A2 & A3 (Converted from IU to mcg: 1 mcg = 40 IU)
    -- Adults/Teens: 600 IU = 15 mcg
    -- Elderly (>=60y): 800 IU = 20 mcg
    ----------------------------------------------------------------------
    -- D2 (Ergocalciferol)
    ('f0ae0e30-b388-442f-9fc9-8ec916d461e7', 'teen_male',    15, 'mcg'),
    ('f0ae0e30-b388-442f-9fc9-8ec916d461e7', 'teen_female',  15, 'mcg'),
    ('f0ae0e30-b388-442f-9fc9-8ec916d461e7', 'adult_male',   15, 'mcg'),
    ('f0ae0e30-b388-442f-9fc9-8ec916d461e7', 'adult_female', 15, 'mcg'),
    ('f0ae0e30-b388-442f-9fc9-8ec916d461e7', 'older_male',   20, 'mcg'), -- 800 IU
    ('f0ae0e30-b388-442f-9fc9-8ec916d461e7', 'older_female', 20, 'mcg'), -- 800 IU
    ('f0ae0e30-b388-442f-9fc9-8ec916d461e7', 'pregnant',     15, 'mcg'),
    ('f0ae0e30-b388-442f-9fc9-8ec916d461e7', 'lactating',    15, 'mcg'),

    -- D3 (Cholecalciferol)
    ('07eb7eae-4278-4dbe-8785-60a500e9e29f', 'teen_male',    15, 'mcg'),
    ('07eb7eae-4278-4dbe-8785-60a500e9e29f', 'teen_female',  15, 'mcg'),
    ('07eb7eae-4278-4dbe-8785-60a500e9e29f', 'adult_male',   15, 'mcg'),
    ('07eb7eae-4278-4dbe-8785-60a500e9e29f', 'adult_female', 15, 'mcg'),
    ('07eb7eae-4278-4dbe-8785-60a500e9e29f', 'older_male',   20, 'mcg'), -- 800 IU
    ('07eb7eae-4278-4dbe-8785-60a500e9e29f', 'older_female', 20, 'mcg'), -- 800 IU
    ('07eb7eae-4278-4dbe-8785-60a500e9e29f', 'pregnant',     15, 'mcg'),
    ('07eb7eae-4278-4dbe-8785-60a500e9e29f', 'lactating',    15, 'mcg'),

    ----------------------------------------------------------------------
    -- VITAMIN E (Alpha-Tocopherol)
    -- Source: Not explicitly listed in ICMR tables A2/A3/A5.
    -- Retained previous NIH values.
    ----------------------------------------------------------------------
    ('49a00b46-0b87-48a4-bfd5-9bcd03f2f01d', 'teen_male',    15, 'mg'),
    ('49a00b46-0b87-48a4-bfd5-9bcd03f2f01d', 'teen_female',  15, 'mg'),
    ('49a00b46-0b87-48a4-bfd5-9bcd03f2f01d', 'adult_male',   15, 'mg'),
    ('49a00b46-0b87-48a4-bfd5-9bcd03f2f01d', 'adult_female', 15, 'mg'),
    ('49a00b46-0b87-48a4-bfd5-9bcd03f2f01d', 'older_male',   15, 'mg'),
    ('49a00b46-0b87-48a4-bfd5-9bcd03f2f01d', 'older_female', 15, 'mg'),
    ('49a00b46-0b87-48a4-bfd5-9bcd03f2f01d', 'pregnant',     15, 'mg'),
    ('49a00b46-0b87-48a4-bfd5-9bcd03f2f01d', 'lactating',    19, 'mg'),

    ----------------------------------------------------------------------
    -- VITAMIN K
    -- Source: Not explicitly listed in ICMR tables A2/A3/A5.
    -- Retained previous NIH values.
    ----------------------------------------------------------------------
    -- K1 (Phylloquinone)
    ('d7f394e0-0a32-4f53-a88d-9dda26d4e0b6', 'teen_male',    75, 'mcg'),
    ('d7f394e0-0a32-4f53-a88d-9dda26d4e0b6', 'teen_female',  75, 'mcg'),
    ('d7f394e0-0a32-4f53-a88d-9dda26d4e0b6', 'adult_male',   120,'mcg'),
    ('d7f394e0-0a32-4f53-a88d-9dda26d4e0b6', 'adult_female', 90, 'mcg'),
    ('d7f394e0-0a32-4f53-a88d-9dda26d4e0b6', 'older_male',   120,'mcg'),
    ('d7f394e0-0a32-4f53-a88d-9dda26d4e0b6', 'older_female', 90, 'mcg'),
    ('d7f394e0-0a32-4f53-a88d-9dda26d4e0b6', 'pregnant',     90, 'mcg'),
    ('d7f394e0-0a32-4f53-a88d-9dda26d4e0b6', 'lactating',    90, 'mcg'),

    -- K2 (Menaquinone)
    ('80e9c202-0001-4a38-98f7-9752a9342e6b', 'teen_male',    75, 'mcg'),
    ('80e9c202-0001-4a38-98f7-9752a9342e6b', 'teen_female',  75, 'mcg'),
    ('80e9c202-0001-4a38-98f7-9752a9342e6b', 'adult_male',   120,'mcg'),
    ('80e9c202-0001-4a38-98f7-9752a9342e6b', 'adult_female', 90, 'mcg'),
    ('80e9c202-0001-4a38-98f7-9752a9342e6b', 'older_male',   120,'mcg'),
    ('80e9c202-0001-4a38-98f7-9752a9342e6b', 'older_female', 90, 'mcg'),
    ('80e9c202-0001-4a38-98f7-9752a9342e6b', 'pregnant',     90, 'mcg'),
    ('80e9c202-0001-4a38-98f7-9752a9342e6b', 'lactating',    90, 'mcg'),

    ----------------------------------------------------------------------
    -- VITAMIN B1 (Thiamine)
    -- Source: ICMR Table A2 (Moderate Activity) & A3
    ----------------------------------------------------------------------
    ('4e68f1d1-58b8-4067-8b9a-fc6d53cd984e', 'teen_male',    2.2, 'mg'), -- Boys 16-18y
    ('4e68f1d1-58b8-4067-8b9a-fc6d53cd984e', 'teen_female',  1.7, 'mg'), -- Girls 16-18y
    ('4e68f1d1-58b8-4067-8b9a-fc6d53cd984e', 'adult_male',   1.8, 'mg'), -- Moderate
    ('4e68f1d1-58b8-4067-8b9a-fc6d53cd984e', 'adult_female', 1.7, 'mg'), -- Moderate
    ('4e68f1d1-58b8-4067-8b9a-fc6d53cd984e', 'older_male',   1.4, 'mg'), -- Men >=60y
    ('4e68f1d1-58b8-4067-8b9a-fc6d53cd984e', 'older_female', 1.4, 'mg'), -- Women >=60y
    ('4e68f1d1-58b8-4067-8b9a-fc6d53cd984e', 'pregnant',     2.0, 'mg'),
    ('4e68f1d1-58b8-4067-8b9a-fc6d53cd984e', 'lactating',    2.1, 'mg'),

    ----------------------------------------------------------------------
    -- VITAMIN B2 (Riboflavin)
    -- Source: ICMR Table A2 (Moderate Activity) & A3
    ----------------------------------------------------------------------
    ('0999d84b-81d9-4ea8-bcb9-b773884c971e', 'teen_male',    3.1, 'mg'), -- Boys 16-18y
    ('0999d84b-81d9-4ea8-bcb9-b773884c971e', 'teen_female',  2.3, 'mg'), -- Girls 16-18y
    ('0999d84b-81d9-4ea8-bcb9-b773884c971e', 'adult_male',   2.5, 'mg'), -- Moderate
    ('0999d84b-81d9-4ea8-bcb9-b773884c971e', 'adult_female', 2.4, 'mg'), -- Moderate
    ('0999d84b-81d9-4ea8-bcb9-b773884c971e', 'older_male',   2.0, 'mg'), -- Men >=60y
    ('0999d84b-81d9-4ea8-bcb9-b773884c971e', 'older_female', 1.9, 'mg'), -- Women >=60y
    ('0999d84b-81d9-4ea8-bcb9-b773884c971e', 'pregnant',     2.7, 'mg'),
    ('0999d84b-81d9-4ea8-bcb9-b773884c971e', 'lactating',    3.0, 'mg'),

    ----------------------------------------------------------------------
    -- VITAMIN B3 (Niacin)
    -- Source: ICMR Table A2 (Moderate Activity) & A3
    ----------------------------------------------------------------------
    ('d2e44600-af4b-48a5-8091-def24ae6b04f', 'teen_male',    22, 'mg'), -- Boys 16-18y
    ('d2e44600-af4b-48a5-8091-def24ae6b04f', 'teen_female',  17, 'mg'), -- Girls 16-18y
    ('d2e44600-af4b-48a5-8091-def24ae6b04f', 'adult_male',   18, 'mg'), -- Moderate
    ('d2e44600-af4b-48a5-8091-def24ae6b04f', 'adult_female', 14, 'mg'), -- Moderate
    ('d2e44600-af4b-48a5-8091-def24ae6b04f', 'older_male',   14, 'mg'), -- Men >=60y
    ('d2e44600-af4b-48a5-8091-def24ae6b04f', 'older_female', 11, 'mg'), -- Women >=60y
    ('d2e44600-af4b-48a5-8091-def24ae6b04f', 'pregnant',     13, 'mg'),
    ('d2e44600-af4b-48a5-8091-def24ae6b04f', 'lactating',    16, 'mg'),

    ----------------------------------------------------------------------
    -- VITAMIN B5 (Pantothenic Acid)
    -- Source: Not explicitly listed in ICMR tables.
    -- Retained previous NIH values.
    ----------------------------------------------------------------------
    ('fa171b8a-34b2-4e72-bd19-58693d1c0805', 'teen_male',    5, 'mg'),
    ('fa171b8a-34b2-4e72-bd19-58693d1c0805', 'teen_female',  5, 'mg'),
    ('fa171b8a-34b2-4e72-bd19-58693d1c0805', 'adult_male',   5, 'mg'),
    ('fa171b8a-34b2-4e72-bd19-58693d1c0805', 'adult_female', 5, 'mg'),
    ('fa171b8a-34b2-4e72-bd19-58693d1c0805', 'older_male',   5, 'mg'),
    ('fa171b8a-34b2-4e72-bd19-58693d1c0805', 'older_female', 5, 'mg'),
    ('fa171b8a-34b2-4e72-bd19-58693d1c0805', 'pregnant',     6, 'mg'),
    ('fa171b8a-34b2-4e72-bd19-58693d1c0805', 'lactating',    7, 'mg'),

    ----------------------------------------------------------------------
    -- VITAMIN B6 (Pyridoxine)
    -- Source: ICMR Table A2 & A3
    ----------------------------------------------------------------------
    ('21786ad2-e82a-49d6-a2fc-8eae62e18adc', 'teen_male',    3.0, 'mg'), -- Boys 16-18y
    ('21786ad2-e82a-49d6-a2fc-8eae62e18adc', 'teen_female',  2.3, 'mg'), -- Girls 16-18y
    ('21786ad2-e82a-49d6-a2fc-8eae62e18adc', 'adult_male',   2.4, 'mg'), -- Moderate
    ('21786ad2-e82a-49d6-a2fc-8eae62e18adc', 'adult_female', 1.9, 'mg'), -- Moderate
    ('21786ad2-e82a-49d6-a2fc-8eae62e18adc', 'older_male',   1.9, 'mg'), -- Men >=60y
    ('21786ad2-e82a-49d6-a2fc-8eae62e18adc', 'older_female', 1.9, 'mg'), -- Women >=60y
    ('21786ad2-e82a-49d6-a2fc-8eae62e18adc', 'pregnant',     2.3, 'mg'),
    ('21786ad2-e82a-49d6-a2fc-8eae62e18adc', 'lactating',    2.2, 'mg'), -- Approx from table (2.16)

    ----------------------------------------------------------------------
    -- VITAMIN B7 (Biotin)
    -- Source: Not explicitly listed in ICMR tables.
    -- Retained previous NIH values.
    ----------------------------------------------------------------------
    ('664ff58c-254c-450b-a825-94d64a4e5b6d', 'teen_male',    25, 'mcg'),
    ('664ff58c-254c-450b-a825-94d64a4e5b6d', 'teen_female',  25, 'mcg'),
    ('664ff58c-254c-450b-a825-94d64a4e5b6d', 'adult_male',   30, 'mcg'),
    ('664ff58c-254c-450b-a825-94d64a4e5b6d', 'adult_female', 30, 'mcg'),
    ('664ff58c-254c-450b-a825-94d64a4e5b6d', 'older_male',   30, 'mcg'),
    ('664ff58c-254c-450b-a825-94d64a4e5b6d', 'older_female', 30, 'mcg'),
    ('664ff58c-254c-450b-a825-94d64a4e5b6d', 'pregnant',     30, 'mcg'),
    ('664ff58c-254c-450b-a825-94d64a4e5b6d', 'lactating',    35, 'mcg'),

    ----------------------------------------------------------------------
    -- VITAMIN B9 (Folate)
    -- Source: ICMR Table A2 & A3
    ----------------------------------------------------------------------
    ('168aee88-2b4c-446b-ad6a-fa6e5a39dc9c', 'teen_male',    340, 'mcg'), -- Boys 16-18y
    ('168aee88-2b4c-446b-ad6a-fa6e5a39dc9c', 'teen_female',  270, 'mcg'), -- Girls 16-18y
    ('168aee88-2b4c-446b-ad6a-fa6e5a39dc9c', 'adult_male',   300, 'mcg'), -- Moderate
    ('168aee88-2b4c-446b-ad6a-fa6e5a39dc9c', 'adult_female', 220, 'mcg'), -- Moderate
    ('168aee88-2b4c-446b-ad6a-fa6e5a39dc9c', 'older_male',   300, 'mcg'), -- Men >=60y
    ('168aee88-2b4c-446b-ad6a-fa6e5a39dc9c', 'older_female', 200, 'mcg'), -- Women >=60y
    ('168aee88-2b4c-446b-ad6a-fa6e5a39dc9c', 'pregnant',     570, 'mcg'),
    ('168aee88-2b4c-446b-ad6a-fa6e5a39dc9c', 'lactating',    330, 'mcg'),

    ----------------------------------------------------------------------
    -- VITAMIN B12
    -- Source: ICMR Table A2 & A3
    ----------------------------------------------------------------------
    ('e2725388-8e4d-4254-923b-aab9e436e855', 'teen_male',    2.2, 'mcg'), -- Boys 16-18y
    ('e2725388-8e4d-4254-923b-aab9e436e855', 'teen_female',  2.2, 'mcg'), -- Girls 16-18y
    ('e2725388-8e4d-4254-923b-aab9e436e855', 'adult_male',   2.2, 'mcg'), -- Moderate
    ('e2725388-8e4d-4254-923b-aab9e436e855', 'adult_female', 2.2, 'mcg'), -- Moderate
    ('e2725388-8e4d-4254-923b-aab9e436e855', 'older_male',   2.0, 'mcg'), -- Men >=60y (Table A3 says 2.0)
    ('e2725388-8e4d-4254-923b-aab9e436e855', 'older_female', 2.0, 'mcg'), -- Women >=60y (Table A3 says 2.0)
    ('e2725388-8e4d-4254-923b-aab9e436e855', 'pregnant',     2.45,'mcg'),
    ('e2725388-8e4d-4254-923b-aab9e436e855', 'lactating',    3.2, 'mcg')

ON CONFLICT (vitamin_id, target_group)
DO UPDATE SET
    recommended_daily_amount = EXCLUDED.recommended_daily_amount,
    unit = EXCLUDED.unit;


-- ============================================================
--                      MINERALS (Age-based)
-- ============================================================

INSERT INTO mineral_rda (mineral_id, target_group, recommended_daily_amount, unit)
VALUES
    ----------------------------------------------------------------------
    -- IRON
    -- Source: ICMR Table A2 & A3 (Significantly higher than NIH)
    ----------------------------------------------------------------------
    ('4401043b-ccd1-4a87-aae2-0f10f35c54e2', 'teen_male',    26, 'mg'), -- Boys 16-18y
    ('4401043b-ccd1-4a87-aae2-0f10f35c54e2', 'teen_female',  32, 'mg'), -- Girls 16-18y
    ('4401043b-ccd1-4a87-aae2-0f10f35c54e2', 'adult_male',   19, 'mg'), -- Moderate
    ('4401043b-ccd1-4a87-aae2-0f10f35c54e2', 'adult_female', 29, 'mg'), -- Moderate
    ('4401043b-ccd1-4a87-aae2-0f10f35c54e2', 'older_male',   19, 'mg'), -- Men >=60y
    ('4401043b-ccd1-4a87-aae2-0f10f35c54e2', 'older_female', 19, 'mg'), -- Women >=60y
    ('4401043b-ccd1-4a87-aae2-0f10f35c54e2', 'pregnant',     27, 'mg'),
    ('4401043b-ccd1-4a87-aae2-0f10f35c54e2', 'lactating',    23, 'mg'), -- 0-6m

    ----------------------------------------------------------------------
    -- CALCIUM
    -- Source: ICMR Table A2 & A3
    ----------------------------------------------------------------------
    ('5e719121-0ed2-4d26-bdfe-1f78d0c5f8a7', 'teen_male',    1050, 'mg'), -- Boys 16-18y
    ('5e719121-0ed2-4d26-bdfe-1f78d0c5f8a7', 'teen_female',  1050, 'mg'), -- Girls 16-18y
    ('5e719121-0ed2-4d26-bdfe-1f78d0c5f8a7', 'adult_male',   1000, 'mg'), -- Moderate
    ('5e719121-0ed2-4d26-bdfe-1f78d0c5f8a7', 'adult_female', 1000, 'mg'), -- Moderate
    ('5e719121-0ed2-4d26-bdfe-1f78d0c5f8a7', 'older_male',   1200, 'mg'), -- Men >=60y
    ('5e719121-0ed2-4d26-bdfe-1f78d0c5f8a7', 'older_female', 1200, 'mg'), -- Women >=60y
    ('5e719121-0ed2-4d26-bdfe-1f78d0c5f8a7', 'pregnant',     1000, 'mg'),
    ('5e719121-0ed2-4d26-bdfe-1f78d0c5f8a7', 'lactating',    1200, 'mg'), -- 0-6m

    ----------------------------------------------------------------------
    -- PHOSPHORUS
    -- Source: ICMR Table A5 (Listed as 600 mg for Adults)
    ----------------------------------------------------------------------
    ('f05423d6-59a3-4c9e-abe9-05be43e17372', 'teen_male',    600,  'mg'),
    ('f05423d6-59a3-4c9e-abe9-05be43e17372', 'teen_female',  600,  'mg'),
    ('f05423d6-59a3-4c9e-abe9-05be43e17372', 'adult_male',   600,  'mg'),
    ('f05423d6-59a3-4c9e-abe9-05be43e17372', 'adult_female', 600,  'mg'),
    ('f05423d6-59a3-4c9e-abe9-05be43e17372', 'older_male',   600,  'mg'),
    ('f05423d6-59a3-4c9e-abe9-05be43e17372', 'older_female', 600,  'mg'),
    ('f05423d6-59a3-4c9e-abe9-05be43e17372', 'pregnant',     600,  'mg'),
    ('f05423d6-59a3-4c9e-abe9-05be43e17372', 'lactating',    600,  'mg'),

    ----------------------------------------------------------------------
    -- ZINC
    -- Source: ICMR Table A2 & A3
    ----------------------------------------------------------------------
    ('10498713-e3ee-43aa-9c47-adde567de91f', 'teen_male',    17.6, 'mg'), -- Boys 16-18y
    ('10498713-e3ee-43aa-9c47-adde567de91f', 'teen_female',  14.2, 'mg'), -- Girls 16-18y
    ('10498713-e3ee-43aa-9c47-adde567de91f', 'adult_male',   17,   'mg'), -- Moderate
    ('10498713-e3ee-43aa-9c47-adde567de91f', 'adult_female', 13.2, 'mg'), -- Moderate
    ('10498713-e3ee-43aa-9c47-adde567de91f', 'older_male',   17,   'mg'), -- Men >=60y
    ('10498713-e3ee-43aa-9c47-adde567de91f', 'older_female', 13.2, 'mg'), -- Women >=60y
    ('10498713-e3ee-43aa-9c47-adde567de91f', 'pregnant',     14.5, 'mg'),
    ('10498713-e3ee-43aa-9c47-adde567de91f', 'lactating',    14.1, 'mg'),

    ----------------------------------------------------------------------
    -- MAGNESIUM
    -- Source: ICMR Table A2 & A3
    ----------------------------------------------------------------------
    ('0cfe4c6e-0401-49b6-b733-e42796b92eb3', 'teen_male',    440, 'mg'), -- Boys 16-18y
    ('0cfe4c6e-0401-49b6-b733-e42796b92eb3', 'teen_female',  380, 'mg'), -- Girls 16-18y
    ('0cfe4c6e-0401-49b6-b733-e42796b92eb3', 'adult_male',   440, 'mg'), -- Moderate
    ('0cfe4c6e-0401-49b6-b733-e42796b92eb3', 'adult_female', 370, 'mg'), -- Moderate
    ('0cfe4c6e-0401-49b6-b733-e42796b92eb3', 'older_male',   440, 'mg'), -- Men >=60y
    ('0cfe4c6e-0401-49b6-b733-e42796b92eb3', 'older_female', 370, 'mg'), -- Women >=60y
    ('0cfe4c6e-0401-49b6-b733-e42796b92eb3', 'pregnant',     440, 'mg'),
    ('0cfe4c6e-0401-49b6-b733-e42796b92eb3', 'lactating',    400, 'mg'),

    ----------------------------------------------------------------------
    -- MANGANESE
    -- Source: ICMR Table A5 (Listed as 4 mg for Adults)
    ----------------------------------------------------------------------
    ('4a85a475-1208-432d-88dc-21070a05c3dc', 'teen_male',    4, 'mg'),
    ('4a85a475-1208-432d-88dc-21070a05c3dc', 'teen_female',  4, 'mg'),
    ('4a85a475-1208-432d-88dc-21070a05c3dc', 'adult_male',   4, 'mg'),
    ('4a85a475-1208-432d-88dc-21070a05c3dc', 'adult_female', 4, 'mg'),
    ('4a85a475-1208-432d-88dc-21070a05c3dc', 'older_male',   4, 'mg'),
    ('4a85a475-1208-432d-88dc-21070a05c3dc', 'older_female', 4, 'mg'),
    ('4a85a475-1208-432d-88dc-21070a05c3dc', 'pregnant',     4, 'mg'),
    ('4a85a475-1208-432d-88dc-21070a05c3dc', 'lactating',    4, 'mg'),

    ----------------------------------------------------------------------
    -- POTASSIUM
    -- Source: ICMR Table A5 (Listed as 3500 mg for Adults)
    ----------------------------------------------------------------------
    ('39b97621-2eab-4ed0-8f2c-d97910a63b3b', 'teen_male',    3500, 'mg'),
    ('39b97621-2eab-4ed0-8f2c-d97910a63b3b', 'teen_female',  3500, 'mg'),
    ('39b97621-2eab-4ed0-8f2c-d97910a63b3b', 'adult_male',   3500, 'mg'),
    ('39b97621-2eab-4ed0-8f2c-d97910a63b3b', 'adult_female', 3500, 'mg'),
    ('39b97621-2eab-4ed0-8f2c-d97910a63b3b', 'older_male',   3500, 'mg'),
    ('39b97621-2eab-4ed0-8f2c-d97910a63b3b', 'older_female', 3500, 'mg'),
    ('39b97621-2eab-4ed0-8f2c-d97910a63b3b', 'pregnant',     3500, 'mg'),
    ('39b97621-2eab-4ed0-8f2c-d97910a63b3b', 'lactating',    3500, 'mg'),

    ----------------------------------------------------------------------
    -- SODIUM
    -- Source: ICMR Table A5 (Listed as 2000 mg for Adults)
    ----------------------------------------------------------------------
    ('816103d7-8385-4c5a-b6e0-847816e2f517', 'teen_male',    2000, 'mg'),
    ('816103d7-8385-4c5a-b6e0-847816e2f517', 'teen_female',  2000, 'mg'),
    ('816103d7-8385-4c5a-b6e0-847816e2f517', 'adult_male',   2000, 'mg'),
    ('816103d7-8385-4c5a-b6e0-847816e2f517', 'adult_female', 2000, 'mg'),
    ('816103d7-8385-4c5a-b6e0-847816e2f517', 'older_male',   2000, 'mg'),
    ('816103d7-8385-4c5a-b6e0-847816e2f517', 'older_female', 2000, 'mg'),
    ('816103d7-8385-4c5a-b6e0-847816e2f517', 'pregnant',     2000, 'mg'),
    ('816103d7-8385-4c5a-b6e0-847816e2f517', 'lactating',    2000, 'mg'),

    ----------------------------------------------------------------------
    -- COPPER
    -- Source: ICMR Table A5 (Listed as 1.7 mg for Adults)
    -- Converted to mcg: 1.7 mg = 1700 mcg
    ----------------------------------------------------------------------
    ('b6c86b94-60c9-4507-87ea-db5690118648', 'teen_male',    1700, 'mcg'),
    ('b6c86b94-60c9-4507-87ea-db5690118648', 'teen_female',  1700, 'mcg'),
    ('b6c86b94-60c9-4507-87ea-db5690118648', 'adult_male',   1700, 'mcg'),
    ('b6c86b94-60c9-4507-87ea-db5690118648', 'adult_female', 1700, 'mcg'),
    ('b6c86b94-60c9-4507-87ea-db5690118648', 'older_male',   1700, 'mcg'),
    ('b6c86b94-60c9-4507-87ea-db5690118648', 'older_female', 1700, 'mcg'),
    ('b6c86b94-60c9-4507-87ea-db5690118648', 'pregnant',     1700, 'mcg'),
    ('b6c86b94-60c9-4507-87ea-db5690118648', 'lactating',    1700, 'mcg'),

    ----------------------------------------------------------------------
    -- SELENIUM
    -- Source: ICMR Table A5 (Listed as 40 mcg for Adults)
    ----------------------------------------------------------------------
    ('b9b3b2ca-5ad9-48b2-8e77-7c9ee956eb3e', 'teen_male',    40, 'mcg'),
    ('b9b3b2ca-5ad9-48b2-8e77-7c9ee956eb3e', 'teen_female',  40, 'mcg'),
    ('b9b3b2ca-5ad9-48b2-8e77-7c9ee956eb3e', 'adult_male',   40, 'mcg'),
    ('b9b3b2ca-5ad9-48b2-8e77-7c9ee956eb3e', 'adult_female', 40, 'mcg'),
    ('b9b3b2ca-5ad9-48b2-8e77-7c9ee956eb3e', 'older_male',   40, 'mcg'),
    ('b9b3b2ca-5ad9-48b2-8e77-7c9ee956eb3e', 'older_female', 40, 'mcg'),
    ('b9b3b2ca-5ad9-48b2-8e77-7c9ee956eb3e', 'pregnant',     40, 'mcg'),
    ('b9b3b2ca-5ad9-48b2-8e77-7c9ee956eb3e', 'lactating',    40, 'mcg'),

    ----------------------------------------------------------------------
    -- CHROMIUM
    -- Source: ICMR Table A5 (Listed as 50 mcg for Adults)
    ----------------------------------------------------------------------
    ('1428eba8-ebbe-4d04-83be-0df808a7c220', 'teen_male',    50, 'mcg'),
    ('1428eba8-ebbe-4d04-83be-0df808a7c220', 'teen_female',  50, 'mcg'),
    ('1428eba8-ebbe-4d04-83be-0df808a7c220', 'adult_male',   50, 'mcg'),
    ('1428eba8-ebbe-4d04-83be-0df808a7c220', 'adult_female', 50, 'mcg'),
    ('1428eba8-ebbe-4d04-83be-0df808a7c220', 'older_male',   50, 'mcg'),
    ('1428eba8-ebbe-4d04-83be-0df808a7c220', 'older_female', 50, 'mcg'),
    ('1428eba8-ebbe-4d04-83be-0df808a7c220', 'pregnant',     50, 'mcg'),
    ('1428eba8-ebbe-4d04-83be-0df808a7c220', 'lactating',    50, 'mcg'),

    ----------------------------------------------------------------------
    -- MOLYBDENUM
    -- Source: Not explicitly listed in ICMR tables.
    -- Retained previous NIH values.
    ----------------------------------------------------------------------
    ('55b4d27d-649b-4e66-97de-e86f76985c98', 'teen_male',    43, 'mcg'),
    ('55b4d27d-649b-4e66-97de-e86f76985c98', 'teen_female',  43, 'mcg'),
    ('55b4d27d-649b-4e66-97de-e86f76985c98', 'adult_male',   45, 'mcg'),
    ('55b4d27d-649b-4e66-97de-e86f76985c98', 'adult_female', 45, 'mcg'),
    ('55b4d27d-649b-4e66-97de-e86f76985c98', 'older_male',   45, 'mcg'),
    ('55b4d27d-649b-4e66-97de-e86f76985c98', 'older_female', 45, 'mcg'),
    ('55b4d27d-649b-4e66-97de-e86f76985c98', 'pregnant',     50, 'mcg'),
    ('55b4d27d-649b-4e66-97de-e86f76985c98', 'lactating',    50, 'mcg')

ON CONFLICT (mineral_id, target_group)
DO UPDATE SET
    recommended_daily_amount = EXCLUDED.recommended_daily_amount,
    unit = EXCLUDED.unit;