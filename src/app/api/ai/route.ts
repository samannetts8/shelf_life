import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { FoodItemType } from '../../types/food-item';
import OpenAI from 'openai';

// Create an interface for your recipe structure

// First add this interface near the top of your file:
interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string;
  emoji: string;
  source: string;
  tip?: string;
  imageUrl?: string;
  matchScore?: number;
  matchPercentage?: number;
  id?: number | string;
}

// Create an interface for the OpenAI recipe response structure
interface OpenAIRecipeResponse {
  title: string;
  ingredients: string[] | string;
  instructions: string;
  emoji?: string;
  tip?: string;
}

// Update this function:
export async function getAiRecipes(ingredients: FoodItemType[]) {
  console.log('Getting recipes from OpenAI using ingredients');
  const ingredientsArray = ingredients.map((item) => item.name);
  const prompt = `
You are a helpful AI chef. Please create a detailed and structured recipe using the following ingredients: ${ingredientsArray.join(
    ', '
  )}.

Return the recipe as a JSON object with the following structure:
{
  "title": "Recipe Name",
  "ingredients": [
    "List item 1",
    "List item 2"
  ],
  "instructions": "Step-by-step cooking process",
  "emoji": "A relevant emoji",
  "tip": "A useful cooking tip"
}
`.trim();

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful chef assistant that responds in JSON format.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });
    const generatedText = response.choices[0].message.content;
    console.log('Generated Text:', generatedText);
    return [
      {
        recipeDetails: generatedText,
        foodList: ingredients,
      },
    ];
  } catch (err) {
    console.error('Error fetching from OpenAI:', err);
  }
  return [
    {
      recipeDetails: 'Could not generate AI recipe suggestions',
      foodList: ingredients,
    },
  ];
}

export async function POST(request: Request) {
  try {
    const { ingredients } = await request.json();

    if (!ingredients) {
      return NextResponse.json(
        { error: 'No ingredients provided' },
        { status: 400 }
      );
    }

    console.log('Generating recipes for ingredients:', ingredients);

    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse ingredient strings into a cleaner format
    function parseIngredients(ingredientText: string) {
      return ingredientText.split(',').map((item) => item.trim());
    }

    const ingredientList = parseIngredients(ingredients);

    // STEP 1: Search database for recipes with matching ingredients
    const { data: dbRecipes, error: dbError } = await supabase
      .from('recipes')
      .select('*');

    if (dbError) {
      console.error('Error fetching recipes from database:', dbError);
    }

    let matchingRecipes = [];
    let numDbRecipes = 0;

    // If we have database recipes, score and sort them
    if (dbRecipes && dbRecipes.length > 0) {
      // Calculate match scores for each recipe
      const scoredRecipes = dbRecipes.map((recipe) => {
        let matchCount = 0;
        let recipeIngredients = '';

        // Handle different recipe formats (ingredients could be string or array)
        if (typeof recipe.ingredients === 'string') {
          recipeIngredients = recipe.ingredients.toLowerCase();
        } else if (Array.isArray(recipe.ingredients)) {
          recipeIngredients = recipe.ingredients
            .join(' ')
            .toLowerCase();
        }

        // Count matching ingredients
        ingredientList.forEach((ingredient) => {
          if (recipeIngredients.includes(ingredient.toLowerCase())) {
            matchCount++;
          }
        });

        return {
          ...recipe,
          matchScore: matchCount,
          matchPercentage: Math.round(
            (matchCount / ingredientList.length) * 100
          ),
        };
      });

      // Filter recipes with at least one matching ingredient
      matchingRecipes = scoredRecipes
        .filter((recipe) => recipe.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);

      numDbRecipes = Math.min(matchingRecipes.length, 3);
      console.log(
        `Found ${numDbRecipes} matching recipes in database`
      );
    }

    // Format database recipes to match our response format
    const formattedDbRecipes = matchingRecipes
      .slice(0, numDbRecipes)
      .map((recipe) => ({
        title: recipe.title,
        ingredients: Array.isArray(recipe.ingredients)
          ? recipe.ingredients
          : recipe.ingredients
              .split(',')
              .map((i: string) => i.trim()),
        instructions: recipe.instructions,
        emoji: recipe.emoji || '🍲',
        matchScore: recipe.matchScore,
        matchPercentage: recipe.matchPercentage,
        source: 'database',
        id: recipe.id,
      }));

    // STEP 2: If we have 3+ matching recipes, return those
    if (numDbRecipes >= 3) {
      return NextResponse.json({ recipes: formattedDbRecipes });
    }

    // STEP 3: Otherwise, we need to generate AI recipes
    const numAiRecipesNeeded = 3;
    console.log(`Generating ${numAiRecipesNeeded} AI recipes`);

    // Update to include the type:
    let aiRecipes: Recipe[] = [];

    try {
      console.log('Initializing OpenAI client');

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Create a detailed prompt for recipe generation
      const prompt = `
Generate ${numAiRecipesNeeded} unique recipes using these ingredients: ${ingredients}

Create recipes that would realistically use as many of these ingredients as possible.
For each recipe provide:
1. A creative, appetizing title
2. A list of ingredients (including those from the provided list plus basic pantry items)
3. Clear step-by-step cooking instructions
4. An appropriate emoji representing the dish
5. A helpful cooking tip

Format your response as a JSON object with an array of recipes like this:
{
  "recipes": [
    {
      "title": "Recipe Name",
      "ingredients": ["Ingredient 1", "Ingredient 2"],
      "instructions": "Step-by-step cooking process",
      "emoji": "🍲",
      "tip": "A useful cooking tip"
    },
    {
      "title": "Another Recipe",
      "ingredients": ["Ingredient 1", "Ingredient 2"],
      "instructions": "Step-by-step cooking process",
      "emoji": "🍜",
      "tip": "A useful cooking tip"
    }
  ]
}
`.trim();

      console.log('Calling OpenAI API...');

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful chef assistant that responds in JSON format.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });
      const generatedText = response.choices[0].message.content;
      console.log('Generated Text:', generatedText);

      console.log('Received response from OpenAI');

      // Try to parse the response
      if (generatedText) {
        aiRecipes = parseGeneratedRecipes(
          generatedText,
          numAiRecipesNeeded
        );
      } else {
        console.error('Generated text is null');
        aiRecipes = [];
      }
      console.log(
        `Successfully parsed ${aiRecipes.length} AI recipes`
      );

      // If we couldn't parse enough recipes, use fallbacks
      if (aiRecipes.length < numAiRecipesNeeded) {
        console.log('Not enough recipes parsed, adding fallbacks');
        const fallbackRecipes = generateFallbackRecipes(
          ingredientList,
          numAiRecipesNeeded - aiRecipes.length
        );
        aiRecipes = [...aiRecipes, ...fallbackRecipes];
      }
    } catch (aiError) {
      console.error('Error generating AI recipes:', aiError);
      console.log('Using fallback recipes instead');

      // Use fallback recipes instead of failing
      aiRecipes = generateFallbackRecipes(
        ingredientList,
        numAiRecipesNeeded
      );
    }

    // Combine database and AI recipes
    const allRecipes = [...formattedDbRecipes, ...aiRecipes];

    // Save recipe request to history (optional)
    try {
      await supabase.from('recipe_history').insert({
        user_id: user.id,
        ingredients: ingredients,
        created_at: new Date().toISOString(),
      });
    } catch (historyError) {
      console.error('Error saving recipe history:', historyError);
      // Continue even if history saving fails
    }

    return NextResponse.json({ recipes: allRecipes });
  } catch (error) {
    console.error('Error generating recipes:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipes' },
      { status: 500 }
    );
  }
}

// Update your parseGeneratedRecipes function:

function parseGeneratedRecipes(
  generatedText: string,
  numRecipes: number
): Recipe[] {
  try {
    // Try parsing the response as JSON first
    const jsonResponse = JSON.parse(generatedText);

    // Check if we have a recipes array (format we're requesting from OpenAI)
    if (jsonResponse.recipes && Array.isArray(jsonResponse.recipes)) {
      console.log(
        `Found ${jsonResponse.recipes.length} recipes in OpenAI response`
      );

      // Process each recipe in the array with proper typing
      return jsonResponse.recipes
        .slice(0, numRecipes)
        .map((recipeData: OpenAIRecipeResponse, index: number) => {
          // Create recipe object with our Recipe interface
          const recipe: Recipe = {
            title: recipeData.title || 'Untitled Recipe',
            ingredients: Array.isArray(recipeData.ingredients)
              ? recipeData.ingredients
              : recipeData.ingredients?.split('\n') || [],
            instructions: recipeData.instructions || '',
            emoji: recipeData.emoji || '🍳',
            tip: recipeData.tip || '',
            source: 'ai',
            imageUrl: '', // Initialize with empty string
          };

          // Set the imageUrl with index for uniqueness
          recipe.imageUrl = getRecipeImage(recipe, index);

          return recipe;
        });
    }

    // Fallback to check for single recipe format (backup compatibility)
    if (
      jsonResponse.title &&
      jsonResponse.ingredients &&
      jsonResponse.instructions
    ) {
      console.log('Found single recipe in OpenAI response');

      // Create recipe object WITH imageUrl property
      const recipe: Recipe = {
        title: jsonResponse.title,
        ingredients: Array.isArray(jsonResponse.ingredients)
          ? jsonResponse.ingredients
          : jsonResponse.ingredients.split('\n'),
        instructions: jsonResponse.instructions,
        emoji: jsonResponse.emoji || '🍳',
        tip: jsonResponse.tip || '',
        source: 'ai',
        imageUrl: '', // Initialize with empty string
      };

      // Then set the imageUrl value
      recipe.imageUrl = getRecipeImage(recipe);

      return [recipe];
    }

    // If we get here, the JSON didn't have the expected structure,
    // fall back to the regex parsing
    console.log('Using regex parsing as fallback');
    return parseWithRegex(generatedText, numRecipes);
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    // If JSON parsing fails, try the regex approach
    return parseWithRegex(generatedText, numRecipes);
  }
}

// Update in parseWithRegex function:

function parseWithRegex(
  generatedText: string,
  numRecipes: number
): Recipe[] {
  const recipes: Recipe[] = [];
  const recipeRegex =
    /Recipe \d+:\s*Title:\s*(.*?)\s*Ingredients:\s*([\s\S]*?)\s*Instructions:\s*([\s\S]*?)\s*Emoji:\s*(.*?)(?=\nRecipe \d+:|$)/g;
  let match;

  while (
    (match = recipeRegex.exec(generatedText)) !== null &&
    recipes.length < numRecipes
  ) {
    const [_, title, ingredients, instructions, emoji] = match;

    // Create with imageUrl property
    const recipe: Recipe = {
      title: title.trim(),
      ingredients: ingredients
        .split('\n')
        .map((i: string) => i.replace(/^- /, '').trim())
        .filter(Boolean),
      instructions: instructions.trim(),
      emoji: emoji.trim(),
      source: 'ai',
      imageUrl: '', // Initialize with empty string
    };

    // Then set the imageUrl
    recipe.imageUrl = getRecipeImage(recipe);

    recipes.push(recipe);
  }

  return recipes;
}

// Update in generateFallbackRecipes function:

function generateFallbackRecipes(
  ingredients: string[],
  count: number
): Recipe[] {
  // Generate hardcoded recipes based on the ingredients
  const recipes: Recipe[] = [];

  // Template recipes that can work with any ingredients
  const templates = [
    {
      title: (ing: string[]) => `${ing[0] || 'Quick'} Stir Fry`,
      ingredients: (ing: string[]) => [
        ...ing,
        '2 tablespoons vegetable oil',
        '2 cloves garlic, minced',
        '1 tablespoon soy sauce',
        '1 teaspoon sesame oil',
        'Salt and pepper to taste',
      ],
      instructions: (ing: string[]) =>
        `
1. Heat vegetable oil in a large pan over medium-high heat.
2. Add garlic and sauté for 30 seconds until fragrant.
3. Add ${ing[0] || 'ingredients'} and cook for 2-3 minutes.
4. Add ${
          ing[1] || 'remaining ingredients'
        } and stir-fry for another 3-5 minutes.
5. Add soy sauce and sesame oil, then season with salt and pepper.
6. Serve hot over rice or noodles.
      `.trim(),
      emoji: '🥘',
    },
    {
      title: (ing: string[]) => `${ing[0] || 'Simple'} Soup`,
      ingredients: (ing: string[]) => [
        ...ing,
        '1 onion, diced',
        '4 cups vegetable or chicken broth',
        '1 tablespoon olive oil',
        'Salt and pepper to taste',
        'Fresh herbs for garnish',
      ],
      instructions: (ing: string[]) =>
        `
1. Heat olive oil in a pot over medium heat.
2. Add diced onion and sauté until translucent.
3. Add ${ing[0] || 'ingredients'} and cook for 2 minutes.
4. Pour in broth and bring to a boil.
5. Reduce heat and simmer for 15-20 minutes.
6. Season with salt and pepper.
7. Garnish with fresh herbs and serve.
      `.trim(),
      emoji: '🍲',
    },
    {
      title: (ing: string[]) => `${ing[0] || 'Fresh'} Salad`,
      ingredients: (ing: string[]) => [
        ...ing,
        'Mixed salad greens',
        '2 tablespoons olive oil',
        '1 tablespoon vinegar or lemon juice',
        '1 teaspoon honey or sugar',
        'Salt and pepper to taste',
      ],
      instructions: (ing: string[]) =>
        `
1. Prepare all ingredients.
2. Combine ${ing.join(', ')} with salad greens in a large bowl.
3. In a small bowl, whisk together olive oil, vinegar, honey, salt and pepper.
4. Pour dressing over ingredients and toss to coat.
5. Serve immediately or chill before serving.
      `.trim(),
      emoji: '🥗',
    },
  ];

  // Generate recipes from templates
  for (let i = 0; i < Math.min(count, templates.length); i++) {
    const template = templates[i];

    // Create with imageUrl property
    const recipe: Recipe = {
      title: template.title(ingredients),
      ingredients: template.ingredients(ingredients).filter(Boolean),
      instructions: template.instructions(ingredients),
      emoji: template.emoji,
      source: 'fallback',
      imageUrl: '', // Initialize with empty string
    };

    // Then set the imageUrl with unique index
    recipe.imageUrl = getRecipeImage(recipe, i);

    recipes.push(recipe);
  }

  return recipes;
}

// Update the getRecipeImage function:

function getRecipeImage(
  recipe: {
    title: string;
    emoji?: string;
  },
  index?: number
): string {
  // Get main dish type
  const dishTypes = [
    'pasta',
    'salad',
    'soup',
    'stew',
    'curry',
    'sandwich',
    'burger',
    'salad',
    'stir-fry',
    'roast',
    'cake',
    'pie',
    'bread',
    'taco',
    'soup',
    'noodle',
    'chicken',
    'fish',
    'dessert',
    'breakfast',
    'stew',
    'curry',
    'sandwich',
    'burger',
    'pizza',
    'stir-fry',
    'roast',
    'cake',
    'pie',
    'bread',
    'taco',
    'rice',
    'noodle',
    'chicken',
    'fish',
    'dessert',
    'breakfast',
  ];
  const titleLower = recipe.title.toLowerCase();
  const mainDishType =
    dishTypes.find((type) => titleLower.includes(type)) || '';

  // Extract key food terms
  const foodTerms = extractFoodTerms(recipe.title);
  const emojiTerm = getEmojiSearchTerm(recipe.emoji || '');

  // Build search query with priority to dish type
  const searchTerms = [];

  // Add main dish type first if found
  if (mainDishType) {
    searchTerms.push(mainDishType);
  }

  // Add other food terms and emoji term
  [...foodTerms, emojiTerm]
    .filter((term) => term && term !== mainDishType) // avoid duplicates
    .slice(0, 2 - (mainDishType ? 1 : 0)) // take up to 2 terms total
    .forEach((term) => searchTerms.push(term));

  // Select the most appropriate collection
  let collectionId = '4252079'; // Default food photography

  if (
    titleLower.includes('dessert') ||
    titleLower.includes('cake') ||
    recipe.emoji === '🍰' ||
    recipe.emoji === '🧁'
  ) {
    collectionId = '8961098'; // Desserts
  } else if (titleLower.includes('salad') || recipe.emoji === '🥗') {
    collectionId = '3330455'; // Healthy food
  } else if (
    titleLower.includes('pasta') ||
    titleLower.includes('italian')
  ) {
    collectionId = '5024590'; // Pasta & Italian
  } else if (
    titleLower.includes('breakfast') ||
    recipe.emoji === '🍳'
  ) {
    collectionId = '9370362'; // Breakfast
  } else if (
    titleLower.includes('asian') ||
    titleLower.includes('stir fry') ||
    titleLower.includes('curry') ||
    recipe.emoji === '🍜'
  ) {
    collectionId = '8073401'; // Asian food
  }

  // Format search query
  const finalQuery =
    searchTerms.length > 0 ? searchTerms.join(',') : 'food,dish';

  console.log(
    `Image for "${recipe.title}": using collection ${collectionId} with query "${finalQuery}"`
  );

  // Return the optimized Unsplash collection URL
  return `https://source.unsplash.com/collection/${collectionId}/400x300/?${encodeURIComponent(
    finalQuery
  )}&sig=${index !== undefined ? index : Math.random()}`;
}

// Helper function to extract food terms from recipe title
function extractFoodTerms(title: string): string[] {
  // Lowercase the title for better matching
  const lowerTitle = title.toLowerCase();

  // List of common food terms to ignore (not visually distinctive)
  const commonTerms = [
    'quick',
    'easy',
    'simple',
    'homemade',
    'classic',
    'fresh',
    'healthy',
    'delicious',
    'recipe',
    'style',
    'flavored',
    'seasoned',
    'spicy',
    'dish',
  ];

  // Extract words from title, filtering out common terms and short words
  return lowerTitle
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z]/g, '')) // Remove non-alphabetic characters
    .filter((word) => word.length > 3 && !commonTerms.includes(word));
}

// Helper function to convert emoji to search term
function getEmojiSearchTerm(emoji: string): string {
  const emojiToSearchTerm: Record<string, string> = {
    '🍲': 'soup',
    '🍛': 'curry',
    '🍝': 'pasta',
    '🥘': 'stir-fry',
    '🥗': 'salad',
    '🍕': 'pizza',
    '🍳': 'breakfast',
    '🍔': 'burger',
    '🌮': 'taco',
    '🍜': 'noodles',
    '🍚': 'rice',
    '🍗': 'chicken',
    '🍖': 'meat',
    '🍞': 'bread',
    '🥪': 'sandwich',
    '🍰': 'cake',
    '🍎': 'apple',
    '🥕': 'carrot',
    '🍆': 'eggplant',
    '🥑': 'avocado',
    '🌽': 'corn',
    '🍤': 'shrimp',
    '🐟': 'fish',
    '🥩': 'steak',
  };
  return emojiToSearchTerm[emoji] || '';
}
