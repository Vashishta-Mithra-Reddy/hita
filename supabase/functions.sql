CREATE OR REPLACE FUNCTION get_foods_rich_in_nutrient(
  nutrient_type text, -- 'vitamin' or 'mineral'
  nutrient_id uuid,
  min_amount numeric DEFAULT 0
)
RETURNS TABLE (
  food_name text,
  food_slug text,
  category_name text,
  amount_per_100g numeric,
  unit text,
  percentage_rda numeric
) AS $$
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
        WHEN vr.recommended_daily_amount > 0 THEN 
          ROUND((fv.amount_per_100g / vr.recommended_daily_amount * 100)::numeric, 1)
        ELSE NULL
      END
    FROM foods f
    JOIN food_categories fc ON f.category_id = fc.id
    JOIN food_vitamins fv ON f.id = fv.food_id
    JOIN vitamins v ON fv.vitamin_id = v.id
    LEFT JOIN vitamin_rda vr ON v.id = vr.vitamin_id
    WHERE f.is_active = true
      AND v.id = nutrient_id
      AND fv.amount_per_100g >= min_amount
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
        WHEN mr.recommended_daily_amount > 0 THEN 
          ROUND((fm.amount_per_100g / mr.recommended_daily_amount * 100)::numeric, 1)
        ELSE NULL
      END
    FROM foods f
    JOIN food_categories fc ON f.category_id = fc.id
    JOIN food_minerals fm ON f.id = fm.food_id
    JOIN minerals m ON fm.mineral_id = m.id
    LEFT JOIN mineral_rda mr ON m.id = mr.mineral_id
    WHERE f.is_active = true
      AND m.id = nutrient_id
      AND fm.amount_per_100g >= min_amount
    ORDER BY fm.amount_per_100g DESC;
  END IF;
END;
$$ LANGUAGE plpgsql;

