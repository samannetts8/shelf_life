import { SpoonacularResponse } from '../../app/types/spoonacular.types';
import { getRecipeSearchQuery } from '../../app/utils/recipe-helpers';

/**
 * Fetches a recipe image from Spoonacular API
 */
export async function getRecipeImage(query: string): Promise<string> {
  try {
    const searchQuery = getRecipeSearchQuery(query);
    console.log('Search query for Spoonacular:', searchQuery);

    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(
        searchQuery
      )}&number=1&apiKey=${process.env.SPOONACULAR_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status}`);
    }

    const data: SpoonacularResponse = await response.json();
    console.log(
      'Spoonacular response:',
      data.results ? 'Got results' : 'No results'
    );

    if (data.results?.[0]?.image) {
      const image = data.results[0].image;
      if (image.startsWith('http')) {
        return image;
      }
      return `https://spoonacular.com/recipeImages/${image}`;
    }

    return '/images/recipes/default.jpg';
  } catch (error) {
    console.error('Error fetching from Spoonacular:', error);
    return '/images/recipes/default.jpg';
  }
}
