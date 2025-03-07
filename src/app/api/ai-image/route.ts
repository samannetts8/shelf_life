import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { getRecipeImage } from '@/app/services/spoon-service';
import {
  DISH_TYPES,
  SPECIFIC_INGREDIENTS,
} from '@/app/constants/food-dishes';

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
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const imageUrl = await getRecipeImage(title);

    // Cache the result
    if (recipeId) {
      await supabase.from('recipe_images').insert({
        recipe_id: recipeId,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      imageUrl,
      source: 'spoonacular',
    });
  } catch (error) {
    console.error('Error getting recipe image:', error);

    try {
      const defaultPath = '/defaultRecipeImage.jpg';
      const testResponse = await fetch(
        `http://localhost:3000${defaultPath}`,
        { method: 'HEAD' }
      );

      console.log(
        `Default image test (from API): ${testResponse.status}`
      );

      if (testResponse.ok) {
        return NextResponse.json({
          imageUrl: defaultPath,
          source: 'fallback',
        });
      } else {
        console.error(
          `Default image not found in API route (status: ${testResponse.status})`
        );
        // Use external image
        return NextResponse.json({
          imageUrl:
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500',
          source: 'external-fallback',
        });
      }
    } catch (testError) {
      console.error(
        'Error testing default image from API route:',
        testError
      );
      return NextResponse.json({
        imageUrl:
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500',
        source: 'external-fallback',
      });
    }
  }
}
