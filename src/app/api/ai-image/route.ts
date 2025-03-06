import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import OpenAI from 'openai';

// Create a simple unsplash API client (no need for full package)
async function getUnsplashImage(
  query: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&per_page=1&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results[0]) {
      return data.results[0].urls.regular;
    }

    return null;
  } catch (error) {
    console.error('Error fetching from Unsplash:', error);
    return null;
  }
}

// Function to get a direct Unsplash Source URL (no API key needed)
function getUnsplashSourceUrl(
  title: string,
  ingredients?: string[]
): string {
  // Extract core dish type
  const dishTypes = [
    "pasta", "salad", "soup", "stew", "curry", "sandwich", "burger", 
    "pizza", "stir-fry", "roast", "cake", "pie", "bread", "taco", 
    "burrito", "rice", "noodle", "casserole", "steak", "chicken", 
    "fish", "tofu", "vegetable", "dessert", "breakfast"
  ];
  
  // Get the main dish type from the title
  const titleLower = title.toLowerCase();
  const mainDishType = dishTypes.find(type => titleLower.includes(type)) || "";
  
  // Extract key specific ingredients from title
  const specificIngredients = [
    "tomato", "mushroom", "garlic", "onion", "bacon", "cheese", 
    "avocado", "lemon", "lime", "orange", "apple", "banana", 
    "potato", "carrot", "spinach", "kale", "broccoli", "beef", 
    "pork", "lamb", "shrimp", "salmon", "tuna", "chocolate",
    "berry", "strawberry", "blueberry"
  ];
  
  // Find specific ingredients in title
  const foundIngredient = specificIngredients.find(ing => titleLower.includes(ing)) || "";
  
  // Build search query with prioritized terms
  let searchTerms = [];
  
  // 1. Add main dish type if found (highest priority)
  if (mainDishType) {
    searchTerms.push(mainDishType);
  }
  
  // 2. Add specific ingredient if found
  if (foundIngredient) {
    searchTerms.push(foundIngredient);
  }
  
  // 3. If we don't have enough terms, extract from title (ignore common words)
  if (searchTerms.length < 2) {
    const titleWords = title
      .toLowerCase()
      .replace(/recipe|dish|meal|quick|easy|homemade|delicious|with|and|the|for|&|from/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Take up to 2 significant words from title
    for (const word of titleWords) {
      if (!searchTerms.includes(word) && searchTerms.length < 2) {
        searchTerms.push(word);
      }
    }
  }
  
  // 4. If we have ingredients list, add the first one if not already included
  if (ingredients?.length && searchTerms.length < 3) {
    const firstIngredient = ingredients[0].split(" ")[0].toLowerCase();
    if (firstIngredient.length > 3 && !searchTerms.includes(firstIngredient)) {
      searchTerms.push(firstIngredient);
    }
  }
  
  // 5. Always add "dish" and "food" to get food photography
  searchTerms.push("dish", "food");
  
  // Create query string with only unique terms
  const uniqueTerms = [...new Set(searchTerms)];
  const query = uniqueTerms.join(",");
  
  console.log(`Image search query for "${title}": ${query}`);
  
  // Return the Unsplash source URL
  return `https://source.unsplash.com/400x300/?${encodeURIComponent(query)}`;
}

export async function POST(request: Request) {
  try {
    const { recipeId, title, ingredients } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Recipe title required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // First check if we already have this image cached
    if (recipeId) {
      const { data: existingImage } = await supabase
        .from('recipe_images')
        .select('image_url')
        .eq('recipe_id', recipeId)
        .single();

      if (existingImage?.image_url) {
        return NextResponse.json({
          imageUrl: existingImage.image_url,
        });
      }
    }

    // Extract main ingredient for better search results
    const mainIngredient =
      ingredients && ingredients[0]
        ? ingredients[0].split(' ').pop()
        : '';

    // Create search query combining title and main ingredient
    const searchQuery = `${title} ${mainIngredient} food recipe`;

    // Try Unsplash first
    const imageUrl = await getUnsplashImage(searchQuery);

    if (imageUrl) {
      // Save to database if we have a recipe ID
      if (recipeId) {
        await supabase.from('recipe_images').insert({
          recipe_id: recipeId,
          image_url: imageUrl,
          created_at: new Date().toISOString(),
        });
      }

      return NextResponse.json({ imageUrl });
    }

    // If Unsplash API fails, use Unsplash Source URL as fallback
    // This doesn't require API key and is more reliable
    console.log(
      'Unsplash API failed, using direct source URL fallback'
    );
    const fallbackUrl = getUnsplashSourceUrl(title, ingredients);

    // Save fallback URL to database if we have a recipe ID
    if (recipeId) {
      await supabase.from('recipe_images').insert({
        recipe_id: recipeId,
        image_url: fallbackUrl,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ imageUrl: fallbackUrl });
  } catch (error) {
    console.error('Error getting recipe image:', error);
    return NextResponse.json(
      { error: 'Failed to get image' },
      { status: 500 }
    );
  }
}
