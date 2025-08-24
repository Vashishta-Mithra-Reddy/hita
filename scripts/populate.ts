import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Enhanced interfaces with richer data
interface EnhancedProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  ingredients?: string[];
  key_features?: string[];
  health_benefits?: string[];
  tags?: string[];
  highlight?: string;
  is_organic: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_sugar_free: boolean;
  nutritional_info?: any;
  allergen_info?: string[];
  brands?: { name: string; description?: string; certifications?: string[] };
  categories?: { name: string; description?: string };
  product_links?: { platform_name: string; price?: number }[];
  offline_availability?: { store_chain: string; availability_status: string }[];
}

interface EnhancedFood {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  tags?: string[];
  preparation_tips?: string[];
  storage_tips?: string[];
  nutritional_info?: any;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_dairy_free: boolean;
  food_categories?: { name: string; description?: string };
  food_vitamins?: { vitamins: { name: string }, amount_per_100g?: number, unit?: string }[];
  food_minerals?: { minerals: { name: string }, amount_per_100g?: number, unit?: string }[];
  food_health_benefits?: { benefit: string }[];
  food_seasons?: { seasons: { name: string } }[];
  food_regions?: { regions: { name: string } }[];
}

interface EnhancedRemedy {
  id: string;
  title: string;
  slug: string;
  description: string;
  ingredients: string[];
  preparation_method: string;
  usage_instructions: string;
  symptoms_treated?: string[];
  tags?: string[];
  precautions?: string[];
  contraindications?: string[];
  side_effects?: string[];
  effectiveness_rating?: number;
  difficulty_level?: string;
  preparation_time_minutes?: number;
  treatment_duration?: string;
  scientific_backing?: string;
  traditional_use?: string;
  alternative_remedies?: string[];
  remedy_categories?: { name: string; description?: string };
}

interface EnhancedSupplement {
  id: string;
  title: string;
  supplement_name: string;
  description: string;
  benefits: string[];
  recommended_dosage: string;
  side_effects?: string[];
  health_goals?: string[];
  tags?: string[];
  best_time_to_take?: string;
  duration_of_use?: string;
  drug_interactions?: string[];
  contraindications?: string[];
  what_to_look_for?: string[];
  forms_available?: string[];
  food_sources?: string[];
  deficiency_symptoms?: string[];
  mechanism_of_action?: string;
  research_summary?: string;
  evidence_quality?: string;
}

interface EnhancedWellnessTip {
  id: string;
  title: string;
  slug: string;
  content: string;
  category?: string;
}

async function createEmbedding(text: string, retries = 3): Promise<number[] | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text.slice(0, 8000), // Keep within token limits
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error(`Embedding attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        console.error(`Failed to create embedding for text: ${text.slice(0, 100)}...`);
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  return null;
}

// Enhanced content generation with AI assistance for better context
async function enhanceContentWithAI(baseContent: string, contentType: string): Promise<string> {
  try {
    const systemPrompt = `You are a wellness and nutrition expert. Given the following ${contentType} information, enhance it with additional context about health benefits, use cases, and related wellness concerns. Focus on practical applications and how this relates to common health issues people face. Keep it concise but informative (max 300 words additional context).`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Enhance this ${contentType} information:\n\n${baseContent}` }
      ],
      max_tokens: 400,
      temperature: 0.3
    });

    return `${baseContent}\n\nADDITIONAL CONTEXT: ${response.choices[0].message.content}`;
  } catch (error) {
    console.error('Failed to enhance content with AI:', error);
    return baseContent; // Return original content if AI enhancement fails
  }
}

// Enhanced product content generation
function generateEnhancedProductContent(product: EnhancedProduct): string {
  const certifications = product.brands?.certifications?.length ? 
    `Certifications: ${product.brands.certifications.join(', ')}` : '';
  
  const availability = product.offline_availability?.length ?
    `Available at: ${product.offline_availability.map(a => `${a.store_chain} (${a.availability_status})`).join(', ')}` : '';
  
  const pricing = product.product_links?.length ?
    `Available on: ${product.product_links.map(l => `${l.platform_name}${l.price ? ` (₹${l.price})` : ''}`).join(', ')}` : '';
  
  const dietaryFlags = [
    product.is_organic && 'Organic',
    product.is_vegan && 'Vegan',
    product.is_gluten_free && 'Gluten-Free',
    product.is_sugar_free && 'Sugar-Free'
  ].filter(Boolean).join(', ');
  
  const allergens = product.allergen_info?.length ? 
    `Allergens: ${product.allergen_info.join(', ')}` : '';
  
  const nutrition = product.nutritional_info ? 
    `Nutrition: ${JSON.stringify(product.nutritional_info)}` : '';

  const parts = [
    `PRODUCT: ${product.name}`,
    product.brands?.name && `Brand: ${product.brands.name}`,
    product.brands?.description && `Brand Info: ${product.brands.description}`,
    product.categories?.name && `Category: ${product.categories.name}`,
    product.categories?.description && `Category Info: ${product.categories.description}`,
    product.short_description && `Summary: ${product.short_description}`,
    product.description && `Description: ${product.description}`,
    product.highlight && `Key Highlight: ${product.highlight}`,
    product.ingredients?.length && `Ingredients: ${product.ingredients.join(', ')}`,
    product.key_features?.length && `Key Features: ${product.key_features.join(', ')}`,
    product.health_benefits?.length && `Health Benefits: ${product.health_benefits.join(', ')}`,
    dietaryFlags && `Dietary: ${dietaryFlags}`,
    allergens,
    nutrition,
    certifications,
    availability,
    pricing,
    product.tags?.length && `Tags: ${product.tags.join(', ')}`,
    `USE CASES: Suitable for people looking for ${product.health_benefits?.join(', ') || 'health and wellness solutions'}`,
    `HEALTH CONCERNS ADDRESSED: ${product.health_benefits?.map(b => b.toLowerCase().replace(/\s+/g, ' ')).join(', ') || 'general wellness'}`
  ].filter(Boolean);
  
  return parts.join('\n');
}

// Enhanced food content generation with nutritional context
function generateEnhancedFoodContent(food: EnhancedFood): string {
  const vitamins = food.food_vitamins?.length ?
    `Vitamins: ${food.food_vitamins.map(v => `${v.vitamins.name}${v.amount_per_100g ? ` (${v.amount_per_100g}${v.unit}/100g)` : ''}`).join(', ')}` : '';
  
  const minerals = food.food_minerals?.length ?
    `Minerals: ${food.food_minerals.map(m => `${m.minerals.name}${m.amount_per_100g ? ` (${m.amount_per_100g}${m.unit}/100g)` : ''}`).join(', ')}` : '';
  
  const healthBenefits = food.food_health_benefits?.length ?
    `Health Benefits: ${food.food_health_benefits.map(b => b.benefit).join(', ')}` : '';
  
  const seasons = food.food_seasons?.length ?
    `Best Seasons: ${food.food_seasons.map(s => s.seasons.name).join(', ')}` : '';
  
  const regions = food.food_regions?.length ?
    `Available Regions: ${food.food_regions.map(r => r.regions.name).join(', ')}` : '';
  
  const dietaryFlags = [
    food.is_vegetarian && 'Vegetarian',
    food.is_vegan && 'Vegan',
    food.is_gluten_free && 'Gluten-Free',
    food.is_dairy_free && 'Dairy-Free'
  ].filter(Boolean).join(', ');
  
  const nutrition = food.nutritional_info ? 
    `Nutrition Facts: ${JSON.stringify(food.nutritional_info)}` : '';

  // Generate deficiency-related content
  const vitaminDeficiencyHelp = food.food_vitamins?.map(v => 
    `Good for ${v.vitamins.name} deficiency`
  ).join(', ') || '';
  
  const mineralDeficiencyHelp = food.food_minerals?.map(m => 
    `Helps with ${m.minerals.name} deficiency`
  ).join(', ') || '';

  const parts = [
    `FOOD: ${food.name}`,
    food.food_categories?.name && `Category: ${food.food_categories.name}`,
    food.food_categories?.description && `Category Info: ${food.food_categories.description}`,
    food.short_description && `Summary: ${food.short_description}`,
    food.description && `Description: ${food.description}`,
    dietaryFlags && `Dietary: ${dietaryFlags}`,
    nutrition,
    vitamins,
    minerals,
    healthBenefits,
    seasons,
    regions,
    food.preparation_tips?.length && `Preparation: ${food.preparation_tips.join(', ')}`,
    food.storage_tips?.length && `Storage: ${food.storage_tips.join(', ')}`,
    food.tags?.length && `Tags: ${food.tags.join(', ')}`,
    vitaminDeficiencyHelp && `DEFICIENCY SUPPORT: ${vitaminDeficiencyHelp}`,
    mineralDeficiencyHelp && `MINERAL SUPPORT: ${mineralDeficiencyHelp}`,
    `HEALTH CONDITIONS: ${food.food_health_benefits?.map(b => b.benefit.toLowerCase()).join(', ') || 'general health'}`,
    `WELLNESS SUPPORT: Nutritional support for ${food.food_health_benefits?.map(b => b.benefit).join(', ') || 'overall wellness'}`
  ].filter(Boolean);
  
  return parts.join('\n');
}

// Enhanced remedy content generation
function generateEnhancedRemedyContent(remedy: EnhancedRemedy): string {
  const parts = [
    `REMEDY: ${remedy.title}`,
    remedy.remedy_categories?.name && `Category: ${remedy.remedy_categories.name}`,
    remedy.remedy_categories?.description && `Category Info: ${remedy.remedy_categories.description}`,
    `Description: ${remedy.description}`,
    `Ingredients: ${remedy.ingredients.join(', ')}`,
    `Preparation: ${remedy.preparation_method}`,
    `Usage: ${remedy.usage_instructions}`,
    remedy.symptoms_treated?.length && `Treats: ${remedy.symptoms_treated.join(', ')}`,
    remedy.effectiveness_rating && `Effectiveness: ${remedy.effectiveness_rating}/5`,
    remedy.difficulty_level && `Difficulty: ${remedy.difficulty_level}`,
    remedy.preparation_time_minutes && `Prep Time: ${remedy.preparation_time_minutes} minutes`,
    remedy.treatment_duration && `Duration: ${remedy.treatment_duration}`,
    remedy.precautions?.length && `Precautions: ${remedy.precautions.join(', ')}`,
    remedy.contraindications?.length && `Avoid if: ${remedy.contraindications.join(', ')}`,
    remedy.side_effects?.length && `Possible Side Effects: ${remedy.side_effects.join(', ')}`,
    remedy.scientific_backing && `Science: ${remedy.scientific_backing}`,
    remedy.traditional_use && `Traditional Use: ${remedy.traditional_use}`,
    remedy.alternative_remedies?.length && `Alternatives: ${remedy.alternative_remedies.join(', ')}`,
    remedy.tags?.length && `Tags: ${remedy.tags.join(', ')}`,
    `HEALTH ISSUES: ${remedy.symptoms_treated?.join(', ') || 'various health concerns'}`,
    `REMEDY TYPE: ${remedy.difficulty_level || 'Traditional'} ${remedy.remedy_categories?.name || 'home remedy'}`
  ].filter(Boolean);
  
  return parts.join('\n');
}

// Enhanced supplement content generation
function generateEnhancedSupplementContent(supplement: EnhancedSupplement): string {
  const parts = [
    `SUPPLEMENT GUIDE: ${supplement.title}`,
    `Supplement: ${supplement.supplement_name}`,
    `Description: ${supplement.description}`,
    `Benefits: ${supplement.benefits.join(', ')}`,
    `Dosage: ${supplement.recommended_dosage}`,
    supplement.best_time_to_take && `Best Time: ${supplement.best_time_to_take}`,
    supplement.duration_of_use && `Duration: ${supplement.duration_of_use}`,
    supplement.health_goals?.length && `Health Goals: ${supplement.health_goals.join(', ')}`,
    supplement.forms_available?.length && `Available Forms: ${supplement.forms_available.join(', ')}`,
    supplement.food_sources?.length && `Natural Sources: ${supplement.food_sources.join(', ')}`,
    supplement.deficiency_symptoms?.length && `Deficiency Signs: ${supplement.deficiency_symptoms.join(', ')}`,
    supplement.what_to_look_for?.length && `Quality Indicators: ${supplement.what_to_look_for.join(', ')}`,
    supplement.mechanism_of_action && `How it Works: ${supplement.mechanism_of_action}`,
    supplement.research_summary && `Research: ${supplement.research_summary}`,
    supplement.evidence_quality && `Evidence Quality: ${supplement.evidence_quality}`,
    supplement.side_effects?.length && `Side Effects: ${supplement.side_effects.join(', ')}`,
    supplement.drug_interactions?.length && `Drug Interactions: ${supplement.drug_interactions.join(', ')}`,
    supplement.contraindications?.length && `Avoid if: ${supplement.contraindications.join(', ')}`,
    supplement.tags?.length && `Tags: ${supplement.tags.join(', ')}`,
    `DEFICIENCY SUPPORT: Helps with ${supplement.deficiency_symptoms?.join(', ') || 'nutritional gaps'}`,
    `WELLNESS GOALS: ${supplement.health_goals?.join(', ') || 'general health maintenance'}`
  ].filter(Boolean);
  
  return parts.join('\n');
}

// Enhanced wellness tip content generation
function generateEnhancedWellnessTipContent(tip: EnhancedWellnessTip): string {
  const parts = [
    `WELLNESS TIP: ${tip.title}`,
    tip.category && `Category: ${tip.category}`,
    `Content: ${tip.content}`,
    `LIFESTYLE AREA: ${tip.category || 'general wellness'}`,
    `WELLNESS FOCUS: ${tip.title.toLowerCase()}`
  ].filter(Boolean);
  
  return parts.join('\n');
}

// Batch insert embeddings
async function batchInsertEmbeddings(embeddings: any[], batchSize = 50) {
  for (let i = 0; i < embeddings.length; i += batchSize) {
    const batch = embeddings.slice(i, i + batchSize);
    const { error } = await supabase
      .from('embeddings')
      .insert(batch);
    
    if (error) {
      console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
    } else {
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(embeddings.length / batchSize)} (${batch.length} items)`);
    }
    
    // Add delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Main function to populate enhanced embeddings
async function populateEnhancedEmbeddings() {
  console.log('🚀 Starting Enhanced Hita embeddings population...\n');
  
  // Clear existing embeddings
  console.log('🗑️ Clearing existing embeddings...');
  await supabase.from('embeddings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  const allEmbeddings: any[] = [];
  let totalProcessed = 0;

  try {
    // 1. Process Enhanced Products
    console.log('📦 Processing Enhanced Products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id, name, slug, description, short_description, 
        ingredients, key_features, health_benefits, tags, highlight,
        is_organic, is_vegan, is_gluten_free, is_sugar_free,
        nutritional_info, allergen_info,
        brands(name, description, certifications),
        categories(name, description),
        product_links(platform_name, price),
        offline_availability(store_chain, availability_status)
      `)
      .eq('is_active', true);

    if (productsError) {
      console.error('Error fetching products:', productsError);
    } else if (products) {
      for (const product of products) {
        const baseContent = generateEnhancedProductContent(product as any);
        const enhancedContent = await enhanceContentWithAI(baseContent, 'product');
        const embedding = await createEmbedding(enhancedContent);
        
        if (embedding) {
          allEmbeddings.push({
            content: enhancedContent,
            embedding,
            content_type: 'product',
            source_id: product.id,
            metadata: {
              name: product.name,
              slug: product.slug,
              brand: (product.brands as any)?.name,
              category: (product.categories as any)?.name,
              tags: product.tags,
              health_benefits: product.health_benefits,
              is_organic: product.is_organic,
              is_vegan: product.is_vegan,
              is_gluten_free: product.is_gluten_free
            }
          });
        }
        
        totalProcessed++;
        if (totalProcessed % 5 === 0) {
          console.log(`   Processed ${totalProcessed} products...`);
        }
      }
      console.log(`✅ Completed enhanced products: ${products.length} items\n`);
    }

    // 2. Process Enhanced Foods with nutritional data
    console.log('🍎 Processing Enhanced Foods...');
    const { data: foods, error: foodsError } = await supabase
      .from('foods')
      .select(`
        id, name, slug, description, short_description,
        tags, preparation_tips, storage_tips, nutritional_info,
        is_vegetarian, is_vegan, is_gluten_free, is_dairy_free,
        food_categories(name, description),
        food_vitamins(vitamins(name), amount_per_100g, unit),
        food_minerals(minerals(name), amount_per_100g, unit),
        food_health_benefits(benefit),
        food_seasons(seasons(name)),
        food_regions(regions(name))
      `)
      .eq('is_active', true);

    if (foodsError) {
      console.error('Error fetching foods:', foodsError);
    } else if (foods) {
      for (const food of foods) {
        const baseContent = generateEnhancedFoodContent(food as any);
        const enhancedContent = await enhanceContentWithAI(baseContent, 'food');
        const embedding = await createEmbedding(enhancedContent);
        
        if (embedding) {
          allEmbeddings.push({
            content: enhancedContent,
            embedding,
            content_type: 'food',
            source_id: food.id,
            metadata: {
              name: food.name,
              slug: food.slug,
              category: (food.food_categories as any)?.name,
              tags: food.tags,
              vitamins: (food.food_vitamins as any)?.map((v: any) => v.vitamins?.name).filter(Boolean) || [],
              minerals: (food.food_minerals as any)?.map((m: any) => m.minerals?.name).filter(Boolean) || [],
              health_benefits: (food.food_health_benefits as any)?.map((b: any) => b.benefit) || [],
              is_vegetarian: food.is_vegetarian,
              is_vegan: food.is_vegan
            }
          });
        }
        
        totalProcessed++;
        if (totalProcessed % 5 === 0) {
          console.log(`   Processed ${totalProcessed} foods...`);
        }
      }
      console.log(`✅ Completed enhanced foods: ${foods.length} items\n`);
    }

    // 3. Process Enhanced Remedies
    console.log('🌿 Processing Enhanced Remedies...');
    const { data: remedies, error: remediesError } = await supabase
      .from('remedies')
      .select(`
        id, title, slug, description, ingredients, 
        preparation_method, usage_instructions, symptoms_treated,
        tags, precautions, contraindications, side_effects,
        effectiveness_rating, difficulty_level, preparation_time_minutes,
        treatment_duration, scientific_backing, traditional_use,
        alternative_remedies,
        remedy_categories(name, description)
      `)
      .eq('is_active', true);

    if (remediesError) {
      console.error('Error fetching remedies:', remediesError);
    } else if (remedies) {
      for (const remedy of remedies) {
        const baseContent = generateEnhancedRemedyContent(remedy as any);
        const enhancedContent = await enhanceContentWithAI(baseContent, 'remedy');
        const embedding = await createEmbedding(enhancedContent);
        
        if (embedding) {
          allEmbeddings.push({
            content: enhancedContent,
            embedding,
            content_type: 'remedy',
            source_id: remedy.id,
            metadata: {
              title: remedy.title,
              slug: remedy.slug,
              category: (remedy.remedy_categories as any)?.name,
              symptoms_treated: remedy.symptoms_treated,
              tags: remedy.tags,
              effectiveness_rating: remedy.effectiveness_rating,
              difficulty_level: remedy.difficulty_level
            }
          });
        }
        
        totalProcessed++;
        if (totalProcessed % 5 === 0) {
          console.log(`   Processed ${totalProcessed} remedies...`);
        }
      }
      console.log(`✅ Completed enhanced remedies: ${remedies.length} items\n`);
    }

    // 4. Process Enhanced Supplement Guides
    console.log('💊 Processing Enhanced Supplement Guides...');
    const { data: supplements, error: supplementsError } = await supabase
      .from('supplementation_guides')
      .select(`
        id, title, supplement_name, description, benefits,
        recommended_dosage, side_effects, health_goals, tags,
        best_time_to_take, duration_of_use, drug_interactions,
        contraindications, what_to_look_for, forms_available,
        food_sources, deficiency_symptoms, mechanism_of_action,
        research_summary, evidence_quality
      `)
      .eq('is_active', true);

    if (supplementsError) {
      console.error('Error fetching supplements:', supplementsError);
    } else if (supplements) {
      for (const supplement of supplements) {
        const baseContent = generateEnhancedSupplementContent(supplement as any);
        const enhancedContent = await enhanceContentWithAI(baseContent, 'supplement guide');
        const embedding = await createEmbedding(enhancedContent);
        
        if (embedding) {
          allEmbeddings.push({
            content: enhancedContent,
            embedding,
            content_type: 'supplement_guide',
            source_id: supplement.id,
            metadata: {
              title: supplement.title,
              supplement_name: supplement.supplement_name,
              health_goals: supplement.health_goals,
              tags: supplement.tags,
              deficiency_symptoms: supplement.deficiency_symptoms,
              evidence_quality: supplement.evidence_quality
            }
          });
        }
        
        totalProcessed++;
        if (totalProcessed % 5 === 0) {
          console.log(`   Processed ${totalProcessed} supplements...`);
        }
      }
      console.log(`✅ Completed enhanced supplements: ${supplements.length} items\n`);
    }

    // 5. Process Enhanced Wellness Tips
    console.log('💡 Processing Enhanced Wellness Tips...');
    const { data: tips, error: tipsError } = await supabase
      .from('wellness_tips')
      .select('id, title, slug, content, category');

    if (tipsError) {
      console.error('Error fetching wellness tips:', tipsError);
    } else if (tips) {
      for (const tip of tips) {
        const baseContent = generateEnhancedWellnessTipContent(tip as any);
        const enhancedContent = await enhanceContentWithAI(baseContent, 'wellness tip');
        const embedding = await createEmbedding(enhancedContent);
        
        if (embedding) {
          allEmbeddings.push({
            content: enhancedContent,
            embedding,
            content_type: 'wellness_tip',
            source_id: tip.id,
            metadata: {
              title: tip.title,
              slug: tip.slug,
              category: tip.category
            }
          });
        }
        
        totalProcessed++;
        if (totalProcessed % 5 === 0) {
          console.log(`   Processed ${totalProcessed} wellness tips...`);
        }
      }
      console.log(`✅ Completed enhanced wellness tips: ${tips.length} items\n`);
    }

    // Insert all embeddings in batches
    console.log(`📝 Inserting ${allEmbeddings.length} enhanced embeddings into database...`);
    await batchInsertEmbeddings(allEmbeddings);
    
    console.log(`\n🎉 Successfully populated enhanced embeddings table!`);
    console.log(`   Total items processed: ${totalProcessed}`);
    console.log(`   Total embeddings created: ${allEmbeddings.length}`);
    console.log(`   Success rate: ${((allEmbeddings.length / totalProcessed) * 100).toFixed(1)}%`);
    console.log(`   Enhanced with AI context for better semantic search`);

  } catch (error) {
    console.error('❌ Error during population:', error);
  }
}

// Main execution
async function main() {
  // Check environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.OPENAI_API_KEY) {
    console.error('❌ Missing required environment variables:');
    console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    console.error('   - OPENAI_API_KEY');
    process.exit(1);
  }

  await populateEnhancedEmbeddings();
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

export { populateEnhancedEmbeddings };