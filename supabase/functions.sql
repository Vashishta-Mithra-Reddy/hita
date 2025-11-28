CREATE OR REPLACE FUNCTION get_foods_rich_in_nutrient(
  nutrient_type text, -- 'vitamin' or 'mineral'
  nutrient_id uuid,
  min_amount numeric DEFAULT 0,
  p_category_id uuid DEFAULT NULL,
  p_target_group text DEFAULT 'adult_male' -- New parameter with fallback
)
RETURNS TABLE (
  food_name text,
  food_slug text,
  category_name text,
  amount_per_100g numeric,
  unit text,
  percentage_rda numeric
) AS $$
DECLARE
  -- Handle case where NULL is explicitly passed, defaulting to adult_male
  v_target_group text := COALESCE(p_target_group, 'adult_male');
BEGIN
  IF nutrient_type = 'vitamin' THEN
    RETURN QUERY
    SELECT 
      f.name,
      f.slug,
      fc.name,
      fv.amount_per_100g,
      fv.unit,
      CASE 
        -- Check for NULL or Zero RDA to prevent division errors
        WHEN vr.recommended_daily_amount IS NOT NULL AND vr.recommended_daily_amount > 0 THEN 
          ROUND((fv.amount_per_100g / vr.recommended_daily_amount * 100)::numeric, 1)
        ELSE NULL
      END as percentage_rda
    FROM foods f
    JOIN food_categories fc ON f.category_id = fc.id
    JOIN food_vitamins fv ON f.id = fv.food_id
    JOIN vitamins v ON fv.vitamin_id = v.id
    -- CRITICAL FIX: Join specifically on the target group to prevent duplicates.
    -- We use LEFT JOIN so foods appear even if no RDA is defined for that specific group.
    LEFT JOIN vitamin_rda vr ON v.id = vr.vitamin_id 
         AND vr.target_group = v_target_group
    WHERE f.is_active = true
      AND v.id = nutrient_id
      AND fv.amount_per_100g >= min_amount
      AND (p_category_id IS NULL OR f.category_id = p_category_id)
    ORDER BY fv.amount_per_100g DESC;
      
  ELSIF nutrient_type = 'mineral' THEN
    RETURN QUERY
    SELECT 
      f.name,
      f.slug,
      fc.name,
      fm.amount_per_100g,
      fm.unit,
      CASE 
        WHEN mr.recommended_daily_amount IS NOT NULL AND mr.recommended_daily_amount > 0 THEN 
          ROUND((fm.amount_per_100g / mr.recommended_daily_amount * 100)::numeric, 1)
        ELSE NULL
      END as percentage_rda
    FROM foods f
    JOIN food_categories fc ON f.category_id = fc.id
    JOIN food_minerals fm ON f.id = fm.food_id
    JOIN minerals m ON fm.mineral_id = m.id
    -- CRITICAL FIX: Same fix for minerals
    LEFT JOIN mineral_rda mr ON m.id = mr.mineral_id 
         AND mr.target_group = v_target_group
    WHERE f.is_active = true
      AND m.id = nutrient_id
      AND fm.amount_per_100g >= min_amount
      AND (p_category_id IS NULL OR f.category_id = p_category_id)
    ORDER BY fm.amount_per_100g DESC;
  END IF;
END;
$$ LANGUAGE plpgsql;