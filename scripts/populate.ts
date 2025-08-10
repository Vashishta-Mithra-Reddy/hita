import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role key for admin operations
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  ingredients?: string[];
  key_features?: string[];
  health_benefits?: string[];
  tags?: string[];
  brands?: { name: string };
  categories?: { name: string };
  highlight?: string;
}

interface Food {
  category: any;
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  tags?: string[];
  preparation_tips?: string[];
  storage_tips?: string[];
  food_categories?: { name: string };
}

interface Remedy {
  category: any;
  id: string;
  title: string;
  slug: string;
  description: string;
  ingredients: string[];
  preparation_method: string;
  usage_instructions: string;
  symptoms_treated?: string[];
  tags?: string[];
  remedy_categories?: { name: string };
  precautions?: string[];
}

interface SupplementGuide {
  id: string;
  title: string;
  supplement_name: string;
  description: string;
  benefits: string[];
  recommended_dosage: string;
  side_effects?: string[];
  health_goals?: string[];
  tags?: string[];
}

interface WellnessTip {
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
        input: text.slice(0, 8000),
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error(`Embedding attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        console.error(`Failed to create embedding for text: ${text.slice(0, 100)}...`);
        return null;
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  return null;
}

// Function to generate comprehensive content text for products
function generateProductContent(product: Product): string {
  const parts = [
    `Product: ${product.name}`,
    product.brands?.name && `Brand: ${product.brands.name}`,
    product.categories?.name && `Category: ${product.categories.name}`,
    product.short_description,
    product.description,
    product.highlight && `Highlight: ${product.highlight}`,
    product.ingredients?.length && `Ingredients: ${product.ingredients.join(', ')}`,
    product.key_features?.length && `Features: ${product.key_features.join(', ')}`,
    product.health_benefits?.length && `Health Benefits: ${product.health_benefits.join(', ')}`,
    product.tags?.length && `Tags: ${product.tags.join(', ')}`,
  ].filter(Boolean);
  
  return parts.join('\n');
}

// Function to generate comprehensive content text for foods
function generateFoodContent(food: Food): string {
  const parts = [
    `Food: ${food.name}`,
    food.category?.name && `Category: ${food.category.name}`,
    food.short_description,
    food.description,
    food.preparation_tips?.length && `Preparation Tips: ${food.preparation_tips.join(', ')}`,
    food.storage_tips?.length && `Storage Tips: ${food.storage_tips.join(', ')}`,
    food.tags?.length && `Tags: ${food.tags.join(', ')}`,
  ].filter(Boolean);
  
  return parts.join('\n');
}

// Function to generate comprehensive content text for remedies
function generateRemedyContent(remedy: Remedy): string {
  const parts = [
    `Remedy: ${remedy.title}`,
    remedy.category?.name && `Category: ${remedy.category.name}`,
    remedy.description,
    `Ingredients: ${remedy.ingredients.join(', ')}`,
    `Preparation: ${remedy.preparation_method}`,
    `Usage: ${remedy.usage_instructions}`,
    remedy.symptoms_treated?.length && `Treats: ${remedy.symptoms_treated.join(', ')}`,
    remedy.precautions?.length && `Precautions: ${remedy.precautions.join(', ')}`,
    remedy.tags?.length && `Tags: ${remedy.tags.join(', ')}`,
  ].filter(Boolean);
  
  return parts.join('\n');
}

// Function to generate comprehensive content text for supplement guides
function generateSupplementContent(supplement: SupplementGuide): string {
  const parts = [
    `Supplement Guide: ${supplement.title}`,
    `Supplement: ${supplement.supplement_name}`,
    supplement.description,
    `Benefits: ${supplement.benefits.join(', ')}`,
    `Dosage: ${supplement.recommended_dosage}`,
    supplement.health_goals?.length && `Health Goals: ${supplement.health_goals.join(', ')}`,
    supplement.side_effects?.length && `Side Effects: ${supplement.side_effects.join(', ')}`,
    supplement.tags?.length && `Tags: ${supplement.tags.join(', ')}`,
  ].filter(Boolean);
  
  return parts.join('\n');
}

// Function to generate content text for wellness tips
function generateWellnessTipContent(tip: WellnessTip): string {
  const parts = [
    `Wellness Tip: ${tip.title}`,
    tip.category && `Category: ${tip.category}`,
    tip.content,
  ].filter(Boolean);
  
  return parts.join('\n');
}

// Batch insert embeddings
async function batchInsertEmbeddings(embeddings: any[], batchSize = 100) {
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
  }
}

// Main function to populate embeddings
async function populateEmbeddings() {
  console.log('🚀 Starting Hita embeddings population...\n');
  
  const allEmbeddings: any[] = [];
  let totalProcessed = 0;

  try {
    // 1. Process Products
    console.log('📦 Processing Products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id, name, slug, description, short_description, 
        ingredients, key_features, health_benefits, tags, highlight,
        brands(name),
        categories(name)
      `)
      .eq('is_active', true);

    if (productsError) {
      console.error('Error fetching products:', productsError);
    } else if (products) {
      for (const product of products) {
        const content = generateProductContent(product as any);
        const embedding = await createEmbedding(content);
        
        if (embedding) {
          allEmbeddings.push({
            content,
            embedding,
            content_type: 'product',
            source_id: product.id,
            metadata: {
              name: product.name,
              slug: product.slug,
              brand: (product.brands as any)?.name,
              category: (product.categories as any)?.name,
              tags: product.tags
            }
          });
        }
        
        totalProcessed++;
        if (totalProcessed % 10 === 0) {
          console.log(`   Processed ${totalProcessed} products...`);
        }
      }
      console.log(`✅ Completed products: ${products.length} items\n`);
    }

    // 2. Process Foods
    console.log('🍎 Processing Foods...');
    const { data: foods, error: foodsError } = await supabase
      .from('foods')
      .select(`
        id, name, slug, description, short_description,
        tags, preparation_tips, storage_tips,
        food_categories(name)
      `)
      .eq('is_active', true);

    if (foodsError) {
      console.error('Error fetching foods:', foodsError);
    } else if (foods) {
      for (const food of foods) {
        const content = generateFoodContent(food as any);
        const embedding = await createEmbedding(content);
        
        if (embedding) {
          allEmbeddings.push({
            content,
            embedding,
            content_type: 'food',
            source_id: food.id,
            metadata: {
              name: food.name,
              slug: food.slug,
              category: (food.food_categories as any)?.name,
              tags: food.tags
            }
          });
        }
        
        totalProcessed++;
        if (totalProcessed % 10 === 0) {
          console.log(`   Processed ${totalProcessed} foods...`);
        }
      }
      console.log(`✅ Completed foods: ${foods.length} items\n`);
    }

    // 3. Process Remedies
    console.log('🌿 Processing Remedies...');
    const { data: remedies, error: remediesError } = await supabase
      .from('remedies')
      .select(`
        id, title, slug, description, ingredients, 
        preparation_method, usage_instructions, symptoms_treated,
        tags, precautions,
        remedy_categories(name)
      `)
      .eq('is_active', true);

    if (remediesError) {
      console.error('Error fetching remedies:', remediesError);
    } else if (remedies) {
      for (const remedy of remedies) {
        const content = generateRemedyContent(remedy as any);
        const embedding = await createEmbedding(content);
        
        if (embedding) {
          allEmbeddings.push({
            content,
            embedding,
            content_type: 'remedy',
            source_id: remedy.id,
            metadata: {
              title: remedy.title,
              slug: remedy.slug,
              category: (remedy.remedy_categories as any)?.name,
              symptoms_treated: remedy.symptoms_treated,
              tags: remedy.tags
            }
          });
        }
        
        totalProcessed++;
        if (totalProcessed % 10 === 0) {
          console.log(`   Processed ${totalProcessed} remedies...`);
        }
      }
      console.log(`✅ Completed remedies: ${remedies.length} items\n`);
    }

    // 4. Process Supplement Guides
    console.log('💊 Processing Supplement Guides...');
    const { data: supplements, error: supplementsError } = await supabase
      .from('supplementation_guides')
      .select(`
        id, title, supplement_name, description, benefits,
        recommended_dosage, side_effects, health_goals, tags
      `)
      .eq('is_active', true);

    if (supplementsError) {
      console.error('Error fetching supplements:', supplementsError);
    } else if (supplements) {
      for (const supplement of supplements) {
        const content = generateSupplementContent(supplement as any);
        const embedding = await createEmbedding(content);
        
        if (embedding) {
          allEmbeddings.push({
            content,
            embedding,
            content_type: 'supplement_guide',
            source_id: supplement.id,
            metadata: {
              title: supplement.title,
              supplement_name: supplement.supplement_name,
              health_goals: supplement.health_goals,
              tags: supplement.tags
            }
          });
        }
        
        totalProcessed++;
        if (totalProcessed % 10 === 0) {
          console.log(`   Processed ${totalProcessed} supplements...`);
        }
      }
      console.log(`✅ Completed supplements: ${supplements.length} items\n`);
    }

    // 5. Process Wellness Tips
    console.log('💡 Processing Wellness Tips...');
    const { data: tips, error: tipsError } = await supabase
      .from('wellness_tips')
      .select('id, title, slug, content, category');

    if (tipsError) {
      console.error('Error fetching wellness tips:', tipsError);
    } else if (tips) {
      for (const tip of tips) {
        const content = generateWellnessTipContent(tip as any);
        const embedding = await createEmbedding(content);
        
        if (embedding) {
          allEmbeddings.push({
            content,
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
        if (totalProcessed % 10 === 0) {
          console.log(`   Processed ${totalProcessed} wellness tips...`);
        }
      }
      console.log(`✅ Completed wellness tips: ${tips.length} items\n`);
    }

    // Insert all embeddings in batches
    console.log(`📝 Inserting ${allEmbeddings.length} embeddings into database...`);
    await batchInsertEmbeddings(allEmbeddings);
    
    console.log(`\n🎉 Successfully populated embeddings table!`);
    console.log(`   Total items processed: ${totalProcessed}`);
    console.log(`   Total embeddings created: ${allEmbeddings.length}`);
    console.log(`   Success rate: ${((allEmbeddings.length / totalProcessed) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Error during population:', error);
  }
}

// Check if embeddings table exists and create it if not
// async function ensureEmbeddingsTable() {
//   console.log('🔧 Ensuring embeddings table exists...');
  
//   const { error } = await supabase.rpc('exec_sql', {
//     sql: `
//       CREATE EXTENSION IF NOT EXISTS vector;
      
//       CREATE TABLE IF NOT EXISTS embeddings (
//         id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//         content text NOT NULL,
//         embedding vector(1536),
//         content_type text NOT NULL,
//         source_id uuid NOT NULL,
//         metadata jsonb DEFAULT '{}',
//         created_at timestamptz DEFAULT now()
//       );
      
//       CREATE INDEX IF NOT EXISTS embeddings_content_type_idx ON embeddings(content_type);
//       CREATE INDEX IF NOT EXISTS embeddings_source_id_idx ON embeddings(source_id);
//       CREATE INDEX IF NOT EXISTS embeddings_embedding_idx ON embeddings USING ivfflat (embedding vector_cosine_ops);
//     `
//   });
  
//   if (error) {
//     console.error('Error creating embeddings table:', error);
//     console.log('Please run this SQL manually in your Supabase SQL editor:');
//     console.log(`
// CREATE EXTENSION IF NOT EXISTS vector;

// CREATE TABLE IF NOT EXISTS embeddings (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   content text NOT NULL,
//   embedding vector(1536),
//   content_type text NOT NULL,
//   source_id uuid NOT NULL,
//   metadata jsonb DEFAULT '{}',
//   created_at timestamptz DEFAULT now()
// );

// CREATE INDEX IF NOT EXISTS embeddings_content_type_idx ON embeddings(content_type);
// CREATE INDEX IF NOT EXISTS embeddings_source_id_idx ON embeddings(source_id);
// CREATE INDEX IF NOT EXISTS embeddings_embedding_idx ON embeddings USING ivfflat (embedding vector_cosine_ops);
//     `);
//     process.exit(1);
//   } else {
//     console.log('✅ Embeddings table ready\n');
//   }
// }

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

  // await ensureEmbeddingsTable();
  await populateEmbeddings();
}

// Handle script execution
if (require.main === module) {
  main().catch(console.error);
}

export { populateEmbeddings };