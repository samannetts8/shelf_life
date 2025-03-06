"use client";

import { useState, useEffect } from "react";
import { MobileLayout } from "../components/mobile-layout";
import { useFoodItems } from "../hooks/foodItemContext";
import styles from "./ai.module.css";
import ClientLayout from "../ClientLayout";

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string;
  emoji: string;
}

function AIRecipeContent() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This will now work because we're inside FoodItemsProvider
  const { expiringSoon, loading } = useFoodItems();

  const generateRecipes = async () => {
    if (expiringSoon.length === 0) {
      setError("No ingredients expiring soon to generate recipes with.");
      return;
    }

    try {
      setAiLoading(true);
      setError(null);

      // Format the ingredients for the AI
      const ingredientsList = expiringSoon
        .map((item) => `${item.name} (${item.quantity} ${item.unit})`)
        .join(", ");

      const response = await fetch("/api/aiRecipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients: ingredientsList }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate recipes: ${response.status}`);
      }

      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (err) {
      setError("Failed to generate recipes. Please try again.");
      console.error("Error generating recipes:", err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <MobileLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>AI Recipe Suggestions</h1>

        <div className={styles.ingredientsSection}>
          <h2>Ingredients Expiring Soon</h2>
          {loading ? (
            <p>Loading ingredients...</p>
          ) : expiringSoon.length === 0 ? (
            <p>No ingredients expiring soon</p>
          ) : (
            <ul className={styles.ingredientsList}>
              {expiringSoon.map((item) => (
                <li key={item.id}>
                  {item.name} - {item.quantity} {item.unit}
                  <span className={styles.expiryDate}>
                    Expires: {new Date(item.expiry_date).toLocaleDateString()}
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
          {aiLoading ? "Generating..." : "Generate Recipes"}
        </button>

        {error && <div className={styles.error}>{error}</div>}

        {recipes.length > 0 && (
          <div className={styles.recipesContainer}>
            <h2>Recipe Suggestions</h2>
            {recipes.map((recipe, index) => (
              <div key={index} className={styles.recipeCard}>
                <div className={styles.recipeHeader}>
                  <h3>{recipe.title}</h3>
                  <span className={styles.emoji}>{recipe.emoji}</span>
                </div>

                <div className={styles.recipeContent}>
                  <h4>Ingredients:</h4>
                  <ul>
                    {recipe.ingredients.map((ingredient, i) => (
                      <li key={i}>{ingredient}</li>
                    ))}
                  </ul>

                  <h4>Instructions:</h4>
                  <p>{recipe.instructions}</p>
                </div>
              </div>
            ))}
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
