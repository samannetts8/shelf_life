import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { ingredients } = await request.json();

    if (!ingredients) {
      return NextResponse.json(
        { error: 'No ingredients provided' },
        { status: 400 }
      );
    }

    console.log(
      'Generating AI recipes for ingredients:',
      ingredients
    );

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

    // Generate mock recipes (in production, replace with actual AI API call)
    const recipes = [
      {
        title: 'Quick Stir Fry',
        ingredients: [
          ...ingredientList,
          '2 tablespoons vegetable oil',
          '2 cloves garlic, minced',
          '1 tablespoon soy sauce',
          '1 teaspoon sesame oil',
        ],
        instructions:
          '1. Heat oil in a large pan over medium-high heat.\n2. Add garlic and sauté for 30 seconds.\n3. Add ingredients and stir-fry for 5-7 minutes.\n4. Season with soy sauce and sesame oil.\n5. Serve hot over rice.',
        emoji: '🥘',
      },
      {
        title: 'Simple Soup',
        ingredients: [
          ...ingredientList,
          '4 cups vegetable or chicken broth',
          '1 onion, diced',
          '2 tablespoons olive oil',
          'Salt and pepper to taste',
          'Fresh herbs for garnish',
        ],
        instructions:
          '1. Heat olive oil in a pot over medium heat.\n2. Add onion and sauté until translucent.\n3. Add remaining ingredients and broth.\n4. Bring to a boil, then reduce to simmer for 20 minutes.\n5. Season with salt and pepper.\n6. Garnish with fresh herbs and serve.',
        emoji: '🍲',
      },
    ];

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

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('Error generating AI recipes:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipes' },
      { status: 500 }
    );
  }
}
