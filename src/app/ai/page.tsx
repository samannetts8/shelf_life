'use client';

import { useState, useEffect } from 'react';
import { MobileLayout } from '../components/mobile-layout';
import { useFoodItems } from '../hooks/foodItemContext';
import styles from './ai.module.css';
import ClientLayout from '../ClientLayout';

interface Recipe {
  title: string;
  name?: string; // For compatibility with both formats
  ingredients: string[];
  instructions: string;
  emoji: string;
  imageUrl?: string;
  match_count?: number;
}

// Utility function to truncate titles
function truncateTitle(
  title: string,
  maxLength: number = 30
): string {
  return title.length > maxLength
    ? title.substring(0, maxLength) + '...'
    : title;
}

function AIRecipeContent() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This will now work because we're inside FoodItemsProvider
  const { expiringSoon, loading } = useFoodItems();

  // Function to fetch image for a recipe
  const fetchRecipeImage = async (
    recipe: Recipe
  ): Promise<string> => {
    try {
      const response = await fetch('/api/ai-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: recipe.title || recipe.name || '',
          emoji: recipe.emoji,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.imageUrl || '';
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    }
    return ''; // Return empty string if image fetch fails
  };

  const generateRecipes = async () => {
    if (expiringSoon.length === 0) {
      setError(
        'No ingredients expiring soon to generate recipes with.'
      );
      return;
    }

    try {
      setAiLoading(true);
      setError(null);

      // Format the ingredients for the AI
      const ingredientsList = expiringSoon
        .map((item) => `${item.name} (${item.quantity} ${item.unit})`)
        .join(', ');

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: ingredientsList }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to generate recipes: ${response.status}`
        );
      }

      const data = await response.json();

      // Process recipes to ensure they have the expected format
      const processedRecipes = await Promise.all(
        (data.recipes || []).map(async (recipe: Recipe) => {
          const imageUrl = await fetchRecipeImage(recipe);
          return {
            ...recipe,
            name: recipe.title || recipe.name || 'Untitled Recipe',
            match_count:
              recipe.match_count ||
              expiringSoon.filter((item) =>
                recipe.ingredients.some((ing) =>
                  ing.toLowerCase().includes(item.name.toLowerCase())
                )
              ).length,
            imageUrl,
          };
        })
      );

      setRecipes(processedRecipes);
    } catch (err) {
      setError('Failed to generate recipes. Please try again.');
      console.error('Error generating recipes:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <MobileLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>AI Recipe Suggestions</h1>

        <div className={styles.ingredientsSection}>
          <h2 className={styles.subTitle}>
            Ingredients Expiring Soon
          </h2>
          {loading ? (
            <p className={styles.loading}>Loading ingredients...</p>
          ) : expiringSoon.length === 0 ? (
            <p>No ingredients expiring soon</p>
          ) : (
            <ul className={styles.ingredientsList}>
              {expiringSoon.map((item) => (
                <li key={item.id} className={styles.listItem}>
                  <b>{item.name}{`\u00A0`}</b> - {item.quantity}{' '}
                  {item.unit}
                  <span className={styles.expiryDate}>
                    {` \u00A0 Expires: `}
                    {new Date(item.expiry_date).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          className={styles.generateButton}
          onClick={generateRecipes}
          disabled={loading || aiLoading || expiringSoon.length === 0}
        >
          {aiLoading ? 'Generating...' : 'Generate Recipes'}
        </button>

        {error && <div className={styles.error}>{error}</div>}

        {recipes.length > 0 && (
          <div className={styles.recipesContainer}>
            <h2>Recipe Suggestions</h2>
            <div className={styles.recipeCards}>
              {recipes.map((recipe, index) => {
                const cardClass =
                  index % 2 === 0 ? styles.even : styles.odd;
                return (
                  <div
                    key={index}
                    className={`${styles.recipeCard} ${cardClass}`}
                  >
                    <div className={styles.recipeImageContainer}>
                      {recipe.imageUrl ? (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.name || recipe.title}
                          className={styles.recipeImage}
                        />
                      ) : (
                        <div className={styles.placeholderImage}>
                          <div className={styles.mountainIcon}></div>
                          <div className={styles.sunIcon}></div>
                          <span className={styles.emoji}>
                            {recipe.emoji}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={styles.recipeInfo}>
                      <h3 className={styles.recipeTitle}>
                        {truncateTitle(recipe.name || recipe.title)}
                      </h3>
                      <p className={styles.recipeMatches}>
                        Ingredients used:{' '}
                        <span>{recipe.match_count}</span>
                      </p>

                      <details className={styles.recipeDetails}>
                        <summary>View Recipe</summary>
                        <div className={styles.recipeContent}>
                          <h4>Ingredients:</h4>
                          <ul>
                            {recipe.ingredients.map(
                              (ingredient, i) => (
                                <li key={i}>{ingredient}</li>
                              )
                            )}
                          </ul>
                          <h4>Instructions:</h4>
                          <p>{recipe.instructions}</p>
                        </div>
                      </details>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

// Wrap the component with ClientLayout to provide context
export default function AIRecipePage() {
  return (
    <ClientLayout>
      <AIRecipeContent />
    </ClientLayout>
  );
}
