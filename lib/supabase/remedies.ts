import { createClient } from './server';

// Types based on your database schema
export interface RemedyCategory {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  parent_category_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Remedy {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  description: string;
  ingredients: string[];
  preparation_method: string;
  usage_instructions: string;
  precautions: string[] | null;
  contraindications: string[] | null;
  side_effects: string[] | null;
  effectiveness_rating: number | null;
  difficulty_level: string;
  preparation_time_minutes: number | null;
  treatment_duration: string | null;
  scientific_backing: string | null;
  traditional_use: string | null;
  alternative_remedies: string[] | null;
  main_image_url: string | null;
  step_images: string[] | null;
  video_url: string | null;
  tags: string[] | null;
  symptoms_treated: string[] | null;
  is_active: boolean;
  is_verified: boolean;
  is_featured: boolean;
  created_by: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  category?: RemedyCategory;
}

/**
 * Get all remedy categories
 */
export async function getRemedyCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('remedy_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as RemedyCategory[];
}

/**
 * Get all remedies with optional filtering and pagination
 */
export async function getRemedies({
  categoryId,
  search,
  isVerified,
  isFeatured,
  page = 1,
  pageSize = 10,
}: {
  categoryId?: string;
  search?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
} = {}) {
  const supabase = await createClient();
  let query = supabase
    .from('remedies')
    .select(`
      *,
      category:remedy_categories(*)
    `)
    .eq('is_active', true);

  // Apply filters
  if (categoryId) query = query.eq('category_id', categoryId);
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%`
    );
  }
  if (isVerified !== undefined) query = query.eq('is_verified', isVerified);
  if (isFeatured !== undefined) query = query.eq('is_featured', isFeatured);

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query.order('title');

  if (error) throw error;
  return { remedies: data as Remedy[], count };
}

/**
 * Get a single remedy by ID
 */
export async function getRemedyById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('remedies')
    .select(`
      *,
      category:remedy_categories(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Remedy;
}

/**
 * Get remedies by symptom
 */
export async function getRemediesBySymptom(symptom: string, limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('remedies')
    .select(`
      *,
      category:remedy_categories(*)
    `)
    .eq('is_active', true)
    .contains('symptoms_treated', [symptom])
    .limit(limit);

  if (error) throw error;
  return data as Remedy[];
}

/**
 * Get featured remedies
 */
export async function getFeaturedRemedies(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('remedies')
    .select(`
      *,
      category:remedy_categories(*)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(limit);

  if (error) throw error;
  return data as Remedy[];
}