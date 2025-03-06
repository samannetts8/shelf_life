import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { getRecipeImage } from '@/app/services/spoonacular-service';
import {
  DISH_TYPES,
  SPECIFIC_INGREDIENTS,
} from '../../constants/food-dishes';

// Helper function to extract main dish type
function extractDishType(title: string): string {
  const lowerTitle = title.toLowerCase();

  // Find the first matching dish type in the title
  const matchedType = DISH_TYPES.find((type) =>
    lowerTitle.includes(type.toLowerCase())
  );

  if (matchedType) {
    // Get the main ingredients before the dish type
    const ingredients = lowerTitle
      .split(matchedType)[0]
      .split(' ')
      .filter(
        (word) =>
          word.length > 2 &&
          ![
            'and',
            'with',
            'the',
            'spicy',
            'creamy',
            'fresh',
          ].includes(word)
      )
      .slice(-2)
      .join(' ');

    return `${ingredients} ${matchedType}`.trim();
  }

  // If no dish type found, just use the last two significant words
  return title
    .split(' ')
    .filter(
      (word) =>
        word.length > 2 &&
        !['and', 'with', 'the', 'spicy', 'creamy', 'fresh'].includes(
          word.toLowerCase()
        )
    )
    .slice(-2)
    .join(' ');
}

// Function to clean up recipe title for better search results
function cleanRecipeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(
      /recipe|dish|meal|quick|easy|homemade|delicious|with|and|the|for|&|from/g,
      ' '
    )
    .replace(/\s+/g, ' ')
    .trim();
}

export async function POST(request: Request) {
  try {
    const { recipeId, title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Recipe title required' },
        { status: 400 }
      );
    }

    console.log('AI image request received:', { recipeId, title });

    const supabase = await createClient();

    // Check cache first
    if (recipeId) {
      const { data: existingImage } = await supabase
        .from('recipe_images')
        .select('image_url')
        .eq('recipe_id', recipeId)
        .single();

      if (existingImage?.image_url) {
        return NextResponse.json({
          imageUrl: existingImage.image_url,
          source: 'cache',
        });
      }
    }

    // Get image from Spoonacular
    const imageUrl = await getRecipeImage(title);
    console.log('Found image from Spoonacular:', imageUrl);

    // Cache the result
    if (recipeId) {
      await supabase.from('recipe_images').insert({
        recipe_id: recipeId,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      });
    }

    const response = {
      imageUrl,
      source: 'spoonacular',
    };

    console.log('Returning image response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error getting recipe image:', error);
    return NextResponse.json({
      imageUrl: '/images/recipes/default.jpg',
      source: 'fallback',
    });
  }
}

// Function to get a direct Unsplash Source URL (no API key needed)
function getUnsplashSourceUrl(
  title: string,
  ingredients?: string[]
): string {
  // Get the main dish type from the title
  const titleLower = title.toLowerCase();
  const mainDishType =
    DISH_TYPES.find((type) => titleLower.includes(type)) || '';

  // Find specific ingredients in title
  const foundIngredient =
    SPECIFIC_INGREDIENTS.find((ing) => titleLower.includes(ing)) ||
    '';

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
      .replace(
        /recipe|dish|meal|quick|easy|homemade|delicious|with|and|the|for|&|from/g,
        ' '
      )
      .split(/\s+/)
      .filter((word) => word.length > 3);

    // Take up to 2 significant words from title
    for (const word of titleWords) {
      if (!searchTerms.includes(word) && searchTerms.length < 2) {
        searchTerms.push(word);
      }
    }
  }

  // 4. If we have ingredients list, add the first one if not already included
  if (ingredients?.length && searchTerms.length < 3) {
    const firstIngredient = ingredients[0]
      .split(' ')[0]
      .toLowerCase();
    if (
      firstIngredient.length > 3 &&
      !searchTerms.includes(firstIngredient)
    ) {
      searchTerms.push(firstIngredient);
    }
  }

  // 5. Always add "dish" and "food" to get food photography
  searchTerms.push('dish', 'food');

  // Create query string with only unique terms
  const uniqueTerms = [...new Set(searchTerms)];
  const query = uniqueTerms.join(',');

  console.log(`Image search query for "${title}": ${query}`);

  // Return the Unsplash source URL
  return `https://source.unsplash.com/400x300/?${encodeURIComponent(
    query
  )}`;
}
