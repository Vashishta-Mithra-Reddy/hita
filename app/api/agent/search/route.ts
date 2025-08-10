import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface EmbeddingMetadata {
  name?: string;
  title?: string;
  slug?: string;
  category?: string;
  tags?: string[];
  symptoms_treated?: string[];
  health_goals?: string[];
  supplement_name?: string;
  benefits?: string[];
  content_type?: string;
}

interface ContentDetails {
  id?: string;
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  short_description?: string;
  ingredients?: string[];
  key_features?: string[];
  health_benefits?: string[];
  tags?: string[];
  highlight?: string;
  affordability_rating?: number;
  price_range?: string;
  main_image_url?: string;
  is_organic?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  is_vegetarian?: boolean;
  brands?: { name: string }[];
  categories?: { name: string }[];
  food_categories?: { name: string }[];
  preparation_tips?: string;
  storage_tips?: string;
  preparation_method?: string;
  usage_instructions?: string;
  symptoms_treated?: string[];
  difficulty_level?: string;
  preparation_time_minutes?: number;
  effectiveness_rating?: number;
  is_verified?: boolean;
  remedy_categories?: { name: string }[];
  supplement_name?: string;
  benefits?: string[];
  recommended_dosage?: string;
  side_effects?: string[];
  health_goals?: string[];
  content?: string;
  category?: string;
}

interface SearchResult {
  id: string;
  content_type: 'product' | 'food' | 'remedy' | 'supplement_guide' | 'wellness_tip';
  source_id: string;
  metadata: EmbeddingMetadata;
  similarity: number;
  details?: ContentDetails;
}

async function searchEmbeddings(query: string, limit = 20): Promise<SearchResult[]> {
  try {
    console.log('🔍 Starting embedding generation for query:', query);
    
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;
    console.log('✅ Generated embedding vector, length:', queryEmbedding.length);

    const { count: totalEmbeddings, error: countError } = await supabase
      .from('embeddings')
      .select('*', { count: 'exact', head: true }); // 'head: true' avoids fetching rows


    if (countError) {
      console.error('❌ Error checking embeddings count:', countError);
      return [];
    }

    console.log('📊 Total embeddings in database:', totalEmbeddings);


    console.log('🔎 Performing vector similarity search...');
    const { data, error } = await supabase.rpc('match_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5, // Lowered threshold for testing
      match_count: limit,
    });

    if (error) {
      console.error('❌ Supabase RPC error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Fallback: Try direct similarity search without RPC
      console.log('🔄 Trying fallback similarity search...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('embeddings')
        .select('*')
        .limit(limit);

      if (fallbackError) {
        console.error('❌ Fallback search also failed:', fallbackError);
        return [];
      }

      console.log('📦 Fallback returned:', fallbackData?.length || 0, 'results');
      return fallbackData?.map(item => ({
        id: item.id,
        content_type: item.content_type,
        source_id: item.source_id,
        metadata: item.metadata,
        similarity: 0.8 // Mock similarity for fallback
      })) || [];
    }

    console.log('✅ Vector search completed, found:', data?.length || 0, 'results');
    
    if (data && data.length > 0) {
      console.log('📋 First result similarity:', data[0].similarity);
      console.log('📋 Content types found:', [...new Set(data.map((r: SearchResult) => r.content_type))]);
    }

    return data || [];
  } catch (error) {
    console.error('❌ Search embeddings error:', error);
    
    // Additional fallback - just get some recent embeddings
    try {
      console.log('🔄 Emergency fallback: Getting recent embeddings...');
      const { data: emergencyData, error: emergencyError } = await supabase
        .from('embeddings')
        .select('*')
        .limit(5);

      if (!emergencyError && emergencyData) {
        console.log('📦 Emergency fallback returned:', emergencyData.length, 'results');
        return emergencyData.map(item => ({
          id: item.id,
          content_type: item.content_type,
          source_id: item.source_id,
          metadata: item.metadata,
          similarity: 0.7 // Mock similarity for emergency fallback
        }));
      }
    } catch (emergencyError) {
      console.error('❌ Even emergency fallback failed:', emergencyError);
    }
    
    return [];
  }
}

// Function to fetch full details for each result
async function fetchFullDetails(results: SearchResult[]): Promise<SearchResult[]> {
  const enrichedResults: SearchResult[] = [];
  console.log('📝 Fetching full details for', results.length, 'results...');

  for (const result of results) {
    let details = null;
    
    try {
      console.log(`🔍 Fetching details for ${result.content_type} with ID: ${result.source_id}`);
      
      switch (result.content_type) {
        case 'product':
          const { data: product } = await supabase
            .from('products')
            .select(`
              id, name, slug, description, short_description, 
              ingredients, key_features, health_benefits, tags,
              highlight, affordability_rating, price_range,
              main_image_url, is_organic, is_vegan, is_gluten_free,
              brands(name),
              categories(name)
            `)
            .eq('id', result.source_id)
            .single();
          details = product;
          console.log(`✅ Product details fetched:`, product?.name);
          break;

        case 'food':
          const { data: food } = await supabase
            .from('foods')
            .select(`
              id, name, slug, description, short_description,
              tags, preparation_tips, storage_tips,
              main_image_url, is_vegetarian, is_vegan, 
              is_gluten_free, is_organic,
              food_categories(name)
            `)
            .eq('id', result.source_id)
            .single();
          details = food;
          console.log(`✅ Food details fetched:`, food?.name);
          break;

        case 'remedy':
          const { data: remedy } = await supabase
            .from('remedies')
            .select(`
              id, title, slug, description, ingredients,
              preparation_method, usage_instructions,
              symptoms_treated, tags, difficulty_level,
              preparation_time_minutes, effectiveness_rating,
              is_verified,
              remedy_categories(name)
            `)
            .eq('id', result.source_id)
            .single();
          details = remedy;
          console.log(`✅ Remedy details fetched:`, remedy?.title);
          break;

        case 'supplement_guide':
          const { data: supplement } = await supabase
            .from('supplementation_guides')
            .select(`
              id, title, supplement_name, description,
              benefits, recommended_dosage, side_effects,
              health_goals, tags
            `)
            .eq('id', result.source_id)
            .single();
          details = supplement;
          console.log(`✅ Supplement details fetched:`, supplement?.title);
          break;

        case 'wellness_tip':
          const { data: tip } = await supabase
            .from('wellness_tips')
            .select(`
              id, title, slug, content, category
            `)
            .eq('id', result.source_id)
            .single();
          details = tip;
          console.log(`✅ Wellness tip details fetched:`, tip?.title);
          break;
      }

      if (details) {
        enrichedResults.push({
          ...result,
          details
        });
      } else {
        console.log(`⚠️ No details found for ${result.content_type} with ID: ${result.source_id}`);
      }
    } catch (error) {
      console.error(`❌ Error fetching details for ${result.content_type}:`, error);
    }
  }

  console.log(`✅ Successfully enriched ${enrichedResults.length} out of ${results.length} results`);
  return enrichedResults;
}

// Function to generate AI response using OpenAI
async function generateAIResponse(query: string, searchResults: SearchResult[]) {
  try {
    console.log('🤖 Generating AI response...');
    
    const context = searchResults
      .map(result => {
        const metadata = result.metadata;
        const contentType = result.content_type;
        return `${contentType.toUpperCase()}: ${metadata.name || metadata.title} - ${result.details?.description || result.details?.short_description || ''}`;
      })
      .join('\n');

    const prompt = `You are Hita's AI wellness companion. A user has asked: "${query}"

Based on the following curated wellness information from Hita's database:
${context}

Please provide:
1. An empathetic, reassuring message (2-3 sentences) that acknowledges their concern
2. 2-3 quick, actionable tips they can start immediately
3. A brief summary of what the search results can help them with

Guidelines:
- Be warm, understanding, and encouraging
- Focus on practical advice
- Mention that the results below contain specific products, foods, or remedies that can help
- Keep the tone conversational but professional
- If it's a deficiency, reassure them it's manageable

Response format:
{
  "empathyMessage": "Your empathetic response here",
  "quickTips": ["Tip 1", "Tip 2", "Tip 3"],
  "summary": "Brief summary of how the search results can help"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a compassionate wellness advisor for Hita, a platform focused on clean, trustworthy wellness products and guidance. Always be empathetic, practical, and encouraging."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content;
    console.log('🤖 AI response generated');
    
    try {
      return JSON.parse(responseText || '{}');
    } catch {
      console.log('⚠️ JSON parsing failed, using fallback response');
      // Fallback if JSON parsing fails
      return {
        empathyMessage: "I understand your concern, and I'm here to help you find the best solutions.",
        quickTips: [
          "Start with small, consistent changes",
          "Focus on natural, whole food sources when possible",
          "Consider consulting with a healthcare professional for personalized advice"
        ],
        summary: "The recommendations below are carefully curated to help address your wellness needs."
      };
    }
  } catch (error) {
    console.error('❌ OpenAI API error:', error);
    // Fallback response
    return {
      empathyMessage: "I understand your concern, and I'm here to help you find the best solutions.",
      quickTips: [
        "Start with small, consistent changes",
        "Focus on natural, whole food sources when possible", 
        "Consider consulting with a healthcare professional for personalized advice"
      ],
      summary: "The recommendations below are carefully curated to help address your wellness needs."
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Agent search API called');
    
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      console.log('❌ Invalid query provided');
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('📝 Processing query:', query);

    // Step 1: Perform vector search
    console.log('🔍 Step 1: Performing vector search...');
    const searchResults = await searchEmbeddings(query, 15);
    
    if (searchResults.length === 0) {
      console.log('⚠️ No search results found');
      return NextResponse.json({
        empathyMessage: "I understand you're looking for wellness guidance. While I couldn't find specific matches in our database, I'm here to help!",
        quickTips: [
          "Try rephrasing your question with more specific terms",
          "Consider browsing our categories for inspiration",
          "Feel free to ask about common wellness topics like nutrition, immunity, or energy"
        ],
        summary: "Please try a different search term or browse our wellness categories.",
        searchResults: []
      });
    }

    console.log(`✅ Step 1 completed: Found ${searchResults.length} relevant results`);

    // Step 2: Fetch full details for each result
    console.log('📝 Step 2: Fetching full details...');
    const enrichedResults = await fetchFullDetails(searchResults);
    
    console.log(`✅ Step 2 completed: Enriched ${enrichedResults.length} results with full details`);

    // Step 3: Generate AI response
    console.log('🤖 Step 3: Generating AI response...');
    const aiResponse = await generateAIResponse(query, enrichedResults);
    console.log('✅ Step 3 completed: AI response generated');

    // Step 4: Return complete response
    const response = {
      ...aiResponse,
      searchResults: enrichedResults
    };

    console.log('🎉 Search completed successfully');
    console.log('📊 Final response summary:', {
      hasEmpathyMessage: !!response.empathyMessage,
      quickTipsCount: response.quickTips?.length || 0,
      searchResultsCount: response.searchResults?.length || 0,
      contentTypes: [...new Set(response.searchResults?.map((r: { content_type: string; }) => r.content_type) || [])]
    });
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Agent search error:', error);
    
    return NextResponse.json(
      { 
        error: 'An error occurred while processing your request. Please try again.',
        empathyMessage: "I apologize, but I encountered an issue while searching. Please try again in a moment.",
        quickTips: [
          "Check your internet connection",
          "Try a simpler search query",
          "Refresh the page and try again"
        ],
        summary: "Technical difficulties encountered. Please try again shortly.",
        searchResults: []
      },
      { status: 500 }
    );
  }
}
