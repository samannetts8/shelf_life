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

    // Return placeholder if Unsplash fails
    return NextResponse.json({
      imageUrl: null,
      error: 'No image found',
    });
  } catch (error) {
    console.error('Error getting recipe image:', error);
    return NextResponse.json(
      { error: 'Failed to get image' },
      { status: 500 }
    );
  }
}
