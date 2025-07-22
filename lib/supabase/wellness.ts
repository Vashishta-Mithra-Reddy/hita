import { createClient } from './server';

// Types based on your database schema
export interface WellnessTip {
  id: string;
  title: string;
  content: string;
  category: string | null;
  created_at: string;
}

/**
 * Get all wellness tips with optional filtering and pagination
 */
export async function getWellnessTips({
  category,
  search,
  page = 1,
  pageSize = 10,
}: {
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const supabase = await createClient();
  let query = supabase
    .from('wellness_tips')
    .select('*');

  // Apply filters
  if (category) query = query.eq('category', category);
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,content.ilike.%${search}%`
    );
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return { tips: data as WellnessTip[], count };
}

/**
 * Get all unique wellness tip categories
 */
export async function getWellnessTipCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('wellness_tips')
    .select('category')
    .not('category', 'is', null)
    .order('category');

  if (error) throw error;
  
  // Extract unique categories
  const categories = [...new Set(data.map(item => item.category))];
  return categories as string[];
}

/**
 * Get a single wellness tip by ID
 */
export async function getWellnessTipById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('wellness_tips')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as WellnessTip;
}