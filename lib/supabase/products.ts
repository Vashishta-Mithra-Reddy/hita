import { createClient } from './server';

// Types based on your database schema
export interface Category {
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

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  country_of_origin: string | null;
  is_certified_organic: boolean;
  certifications: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand_id: string | null;
  category_id: string;
  description: string | null;
  short_description: string | null;
  ingredients: string[] | null;
  // nutritional_info: any | null; // JSONB type
  allergen_info: string[] | null;
  affordability_rating: number | null;
  price_range: string | null;
  highlight: string | null;
  key_features: string[] | null;
  is_organic: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_sugar_free: boolean;
  main_image_url: string | null;
  additional_images: string[] | null;
  tags: string[] | null;
  health_benefits: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  brand?: Brand;
  category?: Category;
  product_links?: ProductLink[];
  offline_availability?: OfflineAvailability[];
}

export interface ProductLink {
  id: string;
  product_id: string;
  platform_name: string;
  product_url: string;
  price: number | null;
  currency: string;
  is_affiliate_link: boolean;
  is_active: boolean;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfflineAvailability {
  id: string;
  product_id: string;
  store_chain: string;
  availability_status: string;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Query functions

/**
 * Get all categories
 */
export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as Category[];
}

/**
 * Get all brands
 */
export async function getBrands() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name');

  if (error) throw error;
  return data as Brand[];
}

/**
 * Get products with optional filtering and pagination
 */
export async function getProducts({
  categoryId,
  brandId,
  search,
  isOrganic,
  isVegan,
  isGlutenFree,
  isSugarFree,
  isFeatured,
  page = 1,
  pageSize = 10,
}: {
  categoryId?: string;
  brandId?: string;
  search?: string;
  isOrganic?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isSugarFree?: boolean;
  isFeatured?: boolean;
  page?: number;
  pageSize?: number;
} = {}) {
  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      product_links(*),
      offline_availability(*)
    `)
    .eq('is_active', true);

  // Apply filters
  if (categoryId) query = query.eq('category_id', categoryId);
  if (brandId) query = query.eq('brand_id', brandId);
  if (search) query = query.ilike('name', `%${search}%`);
  if (isOrganic !== undefined) query = query.eq('is_organic', isOrganic);
  if (isVegan !== undefined) query = query.eq('is_vegan', isVegan);
  if (isGlutenFree !== undefined) query = query.eq('is_gluten_free', isGlutenFree);
  if (isSugarFree !== undefined) query = query.eq('is_sugar_free', isSugarFree);
  if (isFeatured !== undefined) query = query.eq('is_featured', isFeatured);

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query.order('name');

  if (error) throw error;
  return { products: data as Product[], count };
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      product_links(*),
      offline_availability(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Product;
}

/**
 * Get a single product by Slug
 */
export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      product_links(*),
      offline_availability(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as Product;
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      product_links(*)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(limit);

  if (error) throw error;
  return data as Product[];
}

/**
 * Get products by category
 */
export async function getProductsByCategory(categoryId: string, limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      product_links(*)
    `)
    .eq('is_active', true)
    .eq('category_id', categoryId)
    .limit(limit);

  if (error) throw error;
  return data as Product[];
}

/**
 * Search products by tags
 */
export async function searchProductsByTags(tags: string[], limit = 10) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      product_links(*)
    `)
    .eq('is_active', true)
    .contains('tags', tags)
    .limit(limit);

  if (error) throw error;
  return data as Product[];
}