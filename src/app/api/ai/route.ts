import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { HfInference } from '@huggingface/inference';
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

export async function getAiRecipes(ingredients: FoodItemType[]) {
  console.log(
    'Getting recipes from HuggingFace AI using ingredients'
  );
  let ingredientsArray = ingredients.map((item) => item.name);
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
    // Fix: Pass token directly as a string
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
    let generatedText = response.choices[0].message.content;
    console.log('Generated Text:', generatedText);
    return [
      {
        recipeDetails: generatedText,
        foodList: ingredients,
      },
    ];
  } catch (err) {
    console.error('Error fetching from Hugging Face AI', err);
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
      // Try with the correct authentication method
      console.log('Initializing HuggingFace client');

      // Create more robust HF initialization
      const hfToken = process.env.HUGGINGFACE_API_TOKEN;

      if (!hfToken) {
        console.error('HuggingFace API token is not set');
        throw new Error('Missing HuggingFace API token');
      }

      const hf = new HfInference(hfToken);
      const ingredientsArray = Array.isArray(ingredients)
        ? ingredients
        : [ingredients];

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

      console.log('Calling HuggingFace API...');

      // Try with a more capable model (Mistral-7B-Instruct-v0.1)
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

      console.log('Received response from OpenAI');
      console.log('Raw OpenAI Response:', response);
      console.log(
        'Generated Text:',
        response.choices[0].message.content
      );

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

// Replace your parseGeneratedRecipes function with this one
function parseGeneratedRecipes(
  generatedText: string,
  numRecipes: number
) {
  try {
    // Try parsing the response as JSON first
    const jsonResponse = JSON.parse(generatedText);

    // Check if it's a valid recipe object
    if (
      jsonResponse.title &&
      jsonResponse.ingredients &&
      jsonResponse.instructions
    ) {
      return [
        {
          title: jsonResponse.title,
          ingredients: Array.isArray(jsonResponse.ingredients)
            ? jsonResponse.ingredients
            : jsonResponse.ingredients.split('\n'),
          instructions: jsonResponse.instructions,
          emoji: jsonResponse.emoji || '🍳',
          tip: jsonResponse.tip || '',
          source: 'ai',
          // Add emoji-based placeholder image
          imageUrl: getEmojiImagePlaceholder(
            jsonResponse.emoji || '🍳'
          ),
        },
      ];
    }

    // If we get here, the JSON didn't have the expected structure,
    // fall back to the regex parsing
    return parseWithRegex(generatedText, numRecipes);
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    // If JSON parsing fails, try the regex approach
    return parseWithRegex(generatedText, numRecipes);
  }
}

// Move the original parsing logic to this helper function
function parseWithRegex(generatedText: string, numRecipes: number) {
  const recipes = [];
  const recipeRegex =
    /Recipe \d+:\s*Title:\s*(.*?)\s*Ingredients:\s*([\s\S]*?)\s*Instructions:\s*([\s\S]*?)\s*Emoji:\s*(.*?)(?=\nRecipe \d+:|$)/g;
  let match;
  while (
    (match = recipeRegex.exec(generatedText)) !== null &&
    recipes.length < numRecipes
  ) {
    const [_, title, ingredients, instructions, emoji] = match;
    recipes.push({
      title: title.trim(),
      ingredients: ingredients
        .split('\n')
        .map((i: string) => i.replace(/^- /, '').trim())
        .filter(Boolean),
      instructions: instructions.trim(),
      emoji: emoji.trim(),
      source: 'ai',
      // Add emoji-based placeholder image
      imageUrl: getEmojiImagePlaceholder(emoji.trim() || '🍳'),
    });
  }
  return recipes;
}

// Update the generateFallbackRecipes function:

function generateFallbackRecipes(
  ingredients: string[],
  count: number
) {
  // Generate hardcoded recipes based on the ingredients
  const recipes = [];

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

    recipes.push({
      title: template.title(ingredients),
      ingredients: template.ingredients(ingredients).filter(Boolean), // Remove any null/undefined items
      instructions: template.instructions(ingredients),
      emoji: template.emoji,
      source: 'fallback',
      // Add emoji-based placeholder image
      imageUrl: getEmojiImagePlaceholder(template.emoji),
    });
  }

  return recipes;
}

// Add this function to your file before calling it:

// Function to generate image URLs based on recipe emojis
function getEmojiImagePlaceholder(emoji: string): string {
  // Map of emojis to image URLs
  const emojiImageMap: Record<string, string> = {
    '🍲': '/images/recipes/soup.jpg',
    '🍛': '/images/recipes/curry.jpg',
    '🍝': '/images/recipes/pasta.jpg',
    '🥘': '/images/recipes/stir-fry.jpg',
    '🍜': '/images/recipes/noodles.jpg',
    '🥗': '/images/recipes/salad.jpg',
    '🍕': '/images/recipes/pizza.jpg',
    '🌮': '/images/recipes/tacos.jpg',
    '🍔': '/images/recipes/burger.jpg',
    '🍳': '/images/recipes/breakfast.jpg',
    '🥪': '/images/recipes/sandwich.jpg',
    '🍖': '/images/recipes/meat.jpg',
    '🍗': '/images/recipes/chicken.jpg',
    '🍚': '/images/recipes/rice.jpg',
    '🍰': '/images/recipes/dessert.jpg',
  };

  // Default image if no match
  return emojiImageMap[emoji] || '/images/recipes/default.jpg';
}
