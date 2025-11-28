import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
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
  vitamins?: string[];
  minerals?: string[];
  health_benefits?: string[];
  is_organic?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  deficiency_symptoms?: string[];
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
  preparation_tips?: string[];
  storage_tips?: string[];
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
  content_type: 'product' | 'food' | 'remedy' | 'supplement_guide' | 'wellness_tip' | 'recipe';
  source_id: string;
  metadata: EmbeddingMetadata;
  similarity: number;
  details?: ContentDetails;
}

interface QueryAnalysis {
  intent: 'health_concern' | 'product_search' | 'general_wellness' | 'lifestyle_advice' | 'symptom_based' | 'nutritional_need' | 'conversational' | 'greeting';
  healthTopics: string[];
  symptoms: string[];
  keywords: string[];
  isConversational: boolean;
  needsPersonalization: boolean;
  urgency: 'low' | 'medium' | 'high';
  enhancedQuery: string;
}

// Intelligent query analysis and enhancement
async function analyzeAndEnhanceQuery(query: string): Promise<QueryAnalysis> {
  try {
    console.log('🧠 Analyzing query intelligence...');
    
    const analysisPrompt = `Analyze this wellness query and provide a JSON response: "${query}"

Please analyze:
1. Intent classification
2. Extract health topics, symptoms, keywords
3. Determine if it's conversational/greeting
4. Check if personalization is needed
5. Assess urgency level
6. Create an enhanced search query with wellness context

Response format:
{
  "intent": "health_concern|product_search|general_wellness|lifestyle_advice|symptom_based|nutritional_need|conversational|greeting",
  "healthTopics": ["topic1", "topic2"],
  "symptoms": ["symptom1", "symptom2"],
  "keywords": ["keyword1", "keyword2"],
  "isConversational": boolean,
  "needsPersonalization": boolean,
  "urgency": "low|medium|high",
  "enhancedQuery": "wellness-focused search terms for better results"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert wellness query analyzer. Analyze user queries to understand their health and wellness needs accurately."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    console.log('🧠 Query analysis completed:', analysis.intent);
    
    return analysis;
  } catch (error) {
    console.error('❌ Query analysis failed:', error);
    // Fallback analysis
    return {
      intent: 'general_wellness',
      healthTopics: [],
      symptoms: [],
      keywords: query.split(' ').slice(0, 5),
      isConversational: query.toLowerCase().includes('hello') || query.toLowerCase().includes('hi') || query.includes('?'),
      needsPersonalization: false,
      urgency: 'low',
      enhancedQuery: query
    };
  }
}

// Multi-strategy search approach
async function performIntelligentSearch(query: string, analysis: QueryAnalysis): Promise<SearchResult[]> {
  try {
    console.log('🎯 Performing intelligent multi-strategy search...');
    
    // Strategy 1: Enhanced query embedding search
    const enhancedResults = await searchEmbeddings(analysis.enhancedQuery, 10);
    console.log(`📊 Enhanced query found: ${enhancedResults.length} results`);
    
    // Strategy 2: Original query search (for exact matches)
    const originalResults = await searchEmbeddings(query, 5);
    console.log(`📊 Original query found: ${originalResults.length} results`);
    
    // Strategy 3: Keyword-based search for specific health topics
    let keywordResults: SearchResult[] = [];
    if (analysis.healthTopics.length > 0) {
      const keywordQuery = analysis.healthTopics.join(' ') + ' ' + analysis.symptoms.join(' ');
      keywordResults = await searchEmbeddings(keywordQuery, 5);
      console.log(`📊 Keyword search found: ${keywordResults.length} results`);
    }
    
    // Strategy 4: Fallback categorical search
    let fallbackResults: SearchResult[] = [];
    if (enhancedResults.length === 0 && originalResults.length === 0) {
      fallbackResults = await getRelevantFallbackResults(analysis);
      console.log(`📊 Fallback search found: ${fallbackResults.length} results`);
    }
    
    // Combine and deduplicate results
    const allResults = [...enhancedResults, ...originalResults, ...keywordResults, ...fallbackResults];
    const uniqueResults = allResults.reduce((acc, current) => {
      const exists = acc.find(item => item.source_id === current.source_id && item.content_type === current.content_type);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, [] as SearchResult[]);
    
    // Sort by relevance and similarity
    const sortedResults = uniqueResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 15);
    
    console.log(`✅ Combined search completed: ${sortedResults.length} unique results`);
    return sortedResults;
    
  } catch (error) {
    console.error('❌ Intelligent search failed:', error);
    return await searchEmbeddings(query, 10); // Fallback to basic search
  }
}

// Fallback search for when no results found
async function getRelevantFallbackResults(analysis: QueryAnalysis): Promise<SearchResult[]> {
  console.log('🔄 Executing fallback search strategy...');
  
  try {
    // Get popular/featured items based on intent
    const { data, error } = await supabase
      .from('embeddings')
      .select('*')
      .in('content_type', getRelevantContentTypes(analysis.intent))
      .limit(8);
    
    if (error) throw error;
    
    return data?.map(item => ({
      id: item.id,
      content_type: item.content_type,
      source_id: item.source_id,
      metadata: item.metadata,
      similarity: 0.6 // Default similarity for fallback
    })) || [];
  } catch (error) {
    console.error('❌ Fallback search failed:', error);
    return [];
  }
}

function getRelevantContentTypes(intent: string): string[] {
  switch (intent) {
    case 'health_concern':
    case 'symptom_based':
      return ['remedy', 'supplement_guide', 'food', 'recipe'];
    case 'product_search':
      return ['product', 'supplement_guide'];
    case 'nutritional_need':
      return ['food', 'supplement_guide', 'product', 'recipe'];
    case 'lifestyle_advice':
      return ['wellness_tip', 'remedy', 'recipe'];
    default:
      return ['product', 'food', 'remedy', 'supplement_guide', 'wellness_tip', 'recipe'];
  }
}

async function searchEmbeddings(query: string, limit = 20): Promise<SearchResult[]> {
  try {
    console.log('🔍 Generating embedding for query:', query.slice(0, 50) + '...');
    
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const queryEmbedding = embeddingResponse.data?.[0]?.embedding ?? null;
    
    console.log('🔎 Performing vector similarity search...');
    const { data, error } = await supabase.rpc('match_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5, // More permissive threshold
      match_count: limit,
    });

    if (error) {
      console.error('❌ Vector search failed:', error);
      // Try alternative search method
      const { data: fallbackData } = await supabase
        .from('embeddings')
        .select('*')
        .limit(limit);
      
      return fallbackData?.map(item => ({
        id: item.id,
        content_type: item.content_type,
        source_id: item.source_id,
        metadata: item.metadata,
        similarity: 0.5
      })) || [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Search embeddings error:', error);
    return [];
  }
}

// Enhanced detail fetching with better error handling
async function fetchFullDetails(results: SearchResult[]): Promise<SearchResult[]> {
  const enrichedResults: SearchResult[] = [];
  console.log('📝 Fetching enhanced details for', results.length, 'results...');

  const fetchPromises = results.map(async (result) => {
    try {
      let details = null;
      
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
          break;

        case 'food':
          const { data: food } = await supabase
            .from('foods')
            .select(`
              id, name, slug, description, short_description,
              tags, preparation_tips, storage_tips,
              main_image_url, is_vegetarian, is_vegan, 
              is_gluten_free,
              food_categories(name)
            `)
            .eq('id', result.source_id)
            .single();
          details = food;
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
          break;

        case 'recipe':
          const { data: recipe } = await supabase
            .from('recipes')
            .select(`
              id, name, slug, description, short_description,
              main_image_url, is_healthy, is_quick
            `)
            .eq('id', result.source_id)
            .single();
          details = recipe;
          break;
      }

      if (details) {
        return { ...result, details };
      }
      return null;
    } catch (error) {
      console.error(`❌ Error fetching ${result.content_type}:`, error);
      return null;
    }
  });

  const settledResults = await Promise.allSettled(fetchPromises);
  
  settledResults.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      enrichedResults.push(result.value);
    }
  });

  console.log(`✅ Successfully enriched ${enrichedResults.length} out of ${results.length} results`);
  return enrichedResults;
}

// Ensure slug exists on details; if missing, generate from title/name
function ensureSlug(details: ContentDetails | undefined, fallbackName?: string): ContentDetails | undefined {
  if (!details) return details;
  const slugify = (s: string) => s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  if (!details.slug) {
    const base = details.title || details.name || fallbackName || '';
    if (base) {
      return { ...details, slug: slugify(base) };
    }
  }
  return details;
}

async function getDirectTopItemsByIntent(analysis: QueryAnalysis): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const types = getRelevantContentTypes(analysis.intent);

  try {
    if (types.includes('food')) {
      const { data: foods } = await supabase
        .from('foods')
        .select('id, name, slug, description, short_description, main_image_url, is_vegetarian, is_vegan, is_gluten_free')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .limit(6);
      foods?.forEach(f => results.push({
        id: `direct_food_${f.id}`,
        content_type: 'food',
        source_id: f.id,
        similarity: 0.4,
        metadata: { name: f.name, slug: f.slug, tags: [] },
        details: { id: f.id, name: f.name, slug: f.slug, description: f.description, short_description: f.short_description, main_image_url: f.main_image_url }
      }));
    }

    if (types.includes('product')) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, slug, description, short_description, main_image_url')
        .order('is_featured', { ascending: false })
        .limit(6);
      products?.forEach(p => results.push({
        id: `direct_product_${p.id}`,
        content_type: 'product',
        source_id: p.id,
        similarity: 0.4,
        metadata: { name: p.name, slug: p.slug, tags: [] },
        details: { id: p.id, name: p.name, slug: p.slug, description: p.description, short_description: p.short_description, main_image_url: p.main_image_url }
      }));
    }

    if (types.includes('remedy')) {
      const { data: remedies } = await supabase
        .from('remedies')
        .select('id, title, slug, description, symptoms_treated, is_verified')
        .order('effectiveness_rating', { ascending: false })
        .limit(6);
      remedies?.forEach(r => results.push({
        id: `direct_remedy_${r.id}`,
        content_type: 'remedy',
        source_id: r.id,
        similarity: 0.4,
        metadata: { title: r.title, slug: r.slug, symptoms_treated: r.symptoms_treated },
        details: { id: r.id, title: r.title, slug: r.slug, description: r.description, symptoms_treated: r.symptoms_treated, is_verified: r.is_verified }
      }));
    }

    if (types.includes('supplement_guide')) {
      const { data: guides } = await supabase
        .from('supplementation_guides')
        .select('id, title, supplement_name, description, benefits, recommended_dosage, side_effects, health_goals, tags')
        .limit(6);
      guides?.forEach(g => {
        const details: ContentDetails = { id: g.id, title: g.title, description: g.description, supplement_name: g.supplement_name, recommended_dosage: g.recommended_dosage };
        const withSlug = ensureSlug(details, g.title);
        results.push({
          id: `direct_supp_${g.id}`,
          content_type: 'supplement_guide',
          source_id: g.id,
          similarity: 0.35,
          metadata: { title: g.title, supplement_name: g.supplement_name },
          details: withSlug
        });
      });
    }

    if (types.includes('wellness_tip')) {
      const { data: tips } = await supabase
        .from('wellness_tips')
        .select('id, title, slug, content, category')
        .limit(6);
      tips?.forEach(t => results.push({
        id: `direct_tip_${t.id}`,
        content_type: 'wellness_tip',
        source_id: t.id,
        similarity: 0.3,
        metadata: { title: t.title, slug: t.slug },
        details: { id: t.id, title: t.title, slug: t.slug, content: t.content, category: t.category }
      }));
    }

    // Optional recipe support if present
    if (types.includes('recipe')) {
      const { data: recipes } = await supabase
        .from('recipes')
        .select('id, name, slug, description, short_description, main_image_url, is_healthy, is_quick')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .limit(6);
      recipes?.forEach(rc => results.push({
        id: `direct_recipe_${rc.id}`,
        content_type: 'recipe',
        source_id: rc.id,
        similarity: 0.35,
        metadata: { name: rc.name, slug: rc.slug },
        details: { id: rc.id, name: rc.name, slug: rc.slug, description: rc.description, short_description: rc.short_description, main_image_url: rc.main_image_url }
      }));
    }
  } catch (err) {
    console.error('❌ Direct fallback fetch failed:', err);
  }

  return results.slice(0, 15);
}

// Intelligent AI response generation based on query analysis
async function generateIntelligentAIResponse(
  query: string, 
  analysis: QueryAnalysis, 
  searchResults: SearchResult[]
) {
  try {
    console.log('🤖 Generating intelligent AI response...');
    
    // Handle different response types based on intent
    if (analysis.intent === 'greeting' || analysis.intent === 'conversational') {
      return generateConversationalResponse();
    }
    
    const context = searchResults
      .map(result => {
        const metadata = result.metadata;
        const details = result.details;
        const name = metadata.name || metadata.title || details?.name || details?.title;
        const description = details?.description || details?.short_description;
        const benefits = details?.health_benefits || metadata.health_benefits || [];
        
        return `${result.content_type.toUpperCase()}: ${name} - ${description} ${benefits.length ? `Benefits: ${benefits.join(', ')}` : ''}`;
      })
      .slice(0, 8) // Limit context to prevent token overflow
      .join('\n');

    const systemPrompt = `You are Hita's AI wellness companion - warm, knowledgeable, and genuinely caring about each person's wellness journey.

User Query Analysis:
- Intent: ${analysis.intent}
- Health Topics: ${analysis.healthTopics.join(', ')}
- Symptoms: ${analysis.symptoms.join(', ')}
- Conversational: ${analysis.isConversational}
- Urgency: ${analysis.urgency}

Guidelines for response:
- Be empathetic and understanding
- Provide actionable, practical advice
- If symptoms are mentioned, acknowledge them but recommend professional consultation for serious concerns
- Focus on holistic wellness approach
- Make recommendations feel personal and relevant
- If it's a deficiency/nutritional concern, be reassuring that it's manageable
- Connect the user's concern to the available solutions naturally`;

    const userPrompt = `User asked: "${query}"

Based on these wellness resources from Hita:
${context}

Please provide a comprehensive response in this JSON format:
{
  "empathyMessage": "Warm, understanding response that acknowledges their specific concern (2-3 sentences)",
  "quickTips": ["3 immediate, actionable tips they can start today"],
  "summary": "How the search results below can specifically help with their concern",
  "additionalAdvice": "Any additional context, warnings, or encouragement based on their query"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const responseText = completion.choices[0].message.content;
    console.log('🤖 Intelligent AI response generated');
    
    try {
      return JSON.parse(responseText || '{}');
    } catch {
      return generateFallbackResponse(query, analysis);
    }
  } catch (error) {
    console.error('❌ AI response generation failed:', error);
    return generateFallbackResponse(query, analysis);
  }
}

function generateConversationalResponse() {
  const greetings = [
    "Hello! I'm here to help you on your wellness journey. What's on your mind today?",
    "Hi there! I'm your wellness companion. How can I support your health goals today?",
    "Welcome! I'm excited to help you discover natural solutions for your wellness needs."
  ];
  
  return {
    empathyMessage: greetings[Math.floor(Math.random() * greetings.length)],
    quickTips: [
      "Feel free to ask about any health concern, symptom, or wellness goal",
      "I can help you find natural remedies, nutritious foods, and trusted products",
      "Try asking about specific topics like 'boost immunity', 'hair fall solutions', or 'better sleep'"
    ],
    summary: "I'm here to provide personalized wellness recommendations just for you!",
    additionalAdvice: "What wellness area would you like to explore today?"
  };
}

function generateFallbackResponse(query: string, analysis: QueryAnalysis) {
  const responses = {
    health_concern: {
      empathy: "I understand your health concern, and I want to help you find the right solutions.",
      tips: [
        "Consider natural remedies alongside conventional approaches",
        "Focus on nutrition-rich foods that support your body's healing",
        "Maintain consistency with any wellness routine you choose"
      ]
    },
    nutritional_need: {
      empathy: "Nutritional wellness is so important, and I'm glad you're being proactive about it.",
      tips: [
        "Incorporate a variety of colorful, whole foods into your diet",
        "Consider natural supplements if dietary sources aren't sufficient",
        "Track how different foods make you feel to personalize your approach"
      ]
    },
    general_wellness: {
      empathy: "Your commitment to overall wellness is wonderful - small changes can make a big difference.",
      tips: [
        "Start with one area at a time to avoid overwhelm",
        "Focus on consistency rather than perfection",
        "Listen to your body and adjust as needed"
      ]
    }
  };
  
  const selected = responses[analysis.intent as keyof typeof responses] || responses.general_wellness;
  
  return {
    empathyMessage: selected.empathy,
    quickTips: selected.tips,
    summary: "The recommendations below are carefully selected to support your wellness journey.",
    additionalAdvice: "Remember, sustainable wellness is about progress, not perfection."
  };
}

function generateSmartURL(query: string, analysis: QueryAnalysis): string | null {
  const baseUrl = "https://hita.v19.tech";


  // If it's conversational or greeting → no URL
  if (analysis.intent === "greeting" || analysis.intent === "conversational") {
    return null;
  }

  // Default order
  // const orderBy = "desc";

  // Check for vitamins/minerals in keywords
  const vitamin = analysis.healthTopics.find(t => t.toLowerCase().includes("vitamin"));
  const mineral = analysis.healthTopics.find(t => t.toLowerCase().includes("iron") || t.toLowerCase().includes("calcium") || t.toLowerCase().includes("zinc"));

  switch (analysis.intent) {
    case "nutritional_need":
      if (vitamin) {
        return `${baseUrl}/foods?nutrient=${encodeURIComponent(vitamin)}`;
      }
      if (mineral) {
        return `${baseUrl}/foods?nutrient=${encodeURIComponent(mineral)}`;
      }
      return `${baseUrl}/foods`;

    case "health_concern":
    case "symptom_based":
      if (analysis.symptoms.length > 0) {
        return `${baseUrl}/remedies?symptom=${encodeURIComponent(analysis.symptoms[0])}`;
      }
      return `${baseUrl}/remedies`;

    case "product_search":
      return `${baseUrl}/products?search=${encodeURIComponent(query)}`;

    case "lifestyle_advice":
    case "general_wellness":
      return `${baseUrl}/wellness-tips?topic=${encodeURIComponent(analysis.healthTopics[0] || "general")}`;

    default:
      return null;
  }
}


export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Enhanced Agent API called');
    
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('📝 Processing intelligent query:', query);

    // Step 1: Analyze and enhance query
    console.log('🧠 Step 1: Analyzing query intelligence...');
    const queryAnalysis = await analyzeAndEnhanceQuery(query);
    console.log('✅ Query analysis completed:', {
      intent: queryAnalysis.intent,
      isConversational: queryAnalysis.isConversational,
      healthTopics: queryAnalysis.healthTopics.length,
      urgency: queryAnalysis.urgency
    });

    // Step 2: Perform intelligent search
    console.log('🎯 Step 2: Performing intelligent search...');
    const searchResults = await performIntelligentSearch(query, queryAnalysis);
    console.log(`✅ Intelligent search completed: ${searchResults.length} results found`);

    // Handle no results scenario better: attempt direct DB fallback
    if (searchResults.length === 0) {
      console.log('⚠️ No search results found. Trying direct top items fallback by intent...');
      const directFallback = await getDirectTopItemsByIntent(queryAnalysis);
      const fallbackWithSlugs = directFallback.map(r => ({
        ...r,
        details: ensureSlug(r.details, r.metadata?.name || r.metadata?.title)
      }));
      console.log('✅ Direct fallback results:', fallbackWithSlugs.length);

      const aiResponse = await generateIntelligentAIResponse(query, queryAnalysis, fallbackWithSlugs);
      return NextResponse.json({
        ...aiResponse,
        searchResults: fallbackWithSlugs,
        queryAnalysis: {
          intent: queryAnalysis.intent,
          isConversational: queryAnalysis.isConversational,
          needsPersonalization: queryAnalysis.needsPersonalization
        }
      });
    }

    // Step 3: Fetch enhanced details
    console.log('📝 Step 3: Fetching enhanced details...');
    const enrichedResults = await fetchFullDetails(searchResults);
    const enrichedWithSlugs = enrichedResults.map(r => ({
      ...r,
      details: ensureSlug(r.details, r.metadata?.name || r.metadata?.title)
    }));
    console.log(`✅ Details fetching completed: ${enrichedWithSlugs.length} enriched results`);

    // Step 4: Generate intelligent AI response
    console.log('🤖 Step 4: Generating intelligent AI response...');
    // If enriched results are still empty, use direct database fallback
    const finalResults = enrichedWithSlugs.length > 0 ? enrichedWithSlugs : await getDirectTopItemsByIntent(queryAnalysis);

    const aiResponse = await generateIntelligentAIResponse(query, queryAnalysis, finalResults);
    console.log('✅ AI response generation completed');

    const smartUrl = generateSmartURL(query, queryAnalysis);

    // Step 5: Return comprehensive response
    const response = {
      ...aiResponse,
      searchResults: finalResults,
      queryAnalysis: {
        intent: queryAnalysis.intent,
        isConversational: queryAnalysis.isConversational,
        needsPersonalization: queryAnalysis.needsPersonalization,
        urgency: queryAnalysis.urgency,
        healthTopics: queryAnalysis.healthTopics
      },
      smartUrl
    };

    console.log('🎉 Enhanced search completed successfully');
    console.log('📊 Final response summary:', {
      intent: queryAnalysis.intent,
      hasEmpathyMessage: !!response.empathyMessage,
      quickTipsCount: response.quickTips?.length || 0,
      searchResultsCount: response.searchResults?.length || 0,
      contentTypes: [...new Set(response.searchResults?.map((r: { content_type: string; }) => r.content_type) || [])],
      isConversational: queryAnalysis.isConversational
    });
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Enhanced agent API error:', error);
    
    return NextResponse.json({
      error: 'I apologize, but I encountered a technical issue. Please try again in a moment.',
      empathyMessage: "I'm sorry, I'm having a temporary issue understanding your request. Let me try to help anyway!",
      quickTips: [
        "Try rephrasing your question in a different way",
        "Check if you can break down your question into smaller parts",
        "Feel free to try again - sometimes a simple refresh helps"
      ],
      summary: "Technical difficulties encountered, but I'm here to help once the issue resolves.",
      searchResults: [],
      queryAnalysis: { intent: 'general_wellness', isConversational: false }
    }, { status: 500 });
  }
}
