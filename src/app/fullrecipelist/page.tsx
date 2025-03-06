"use client"
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import styles from './fullrecipelist.module.css';
import { MobileLayout } from '../components/mobile-layout';
import { FoodItemType } from '../types/food-item';
import { foodItems as initialFoodItems } from '../data/food-items';



// Define the Recipe type
interface Recipe {
    id: number;
    name: string;
    cuisine: string;
    dietaryInfoType: string;
    dietaryInfoRestrictions: string;
    dietaryInfoSuitableFor: string;
    dietaryInfoAllergens: string;
    dietaryInfoVeganSubstitutions: string | null;
    dietaryInfoGlutenFreeOption: string | null;
    dietaryInfoProteinSource: string | null;
    dietaryInfoNutrientDense: string | null;
    dietaryInfoTraditionalDish: string | null;
    ingredients: string[];
    steps: string[];
    cookingUtensils: string[];
    nutritionalInfoServings: number;
    nutritionalInfoCaloriesPerServing: number;
    nutritionalInfoProteinPerServing: number;
    nutritionalInfoCarbsPerServing: number;
    nutritionalInfoFatPerServing: number;
    nutritionalInfoFiber: number;
    nutritionalInfoCholesterol: number | null;
    imageUrl: string;
    prepTime: string;
    cookTime: string;
    ingredientsLowercase: string[];
  }
  
  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  export default function FullRecipeListPage() {
    const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      async function fetchAllRecipes() {
        try {
          const { data: allRecipes, error } = await supabase
            .from('recipes')
            .select('*');
  
          if (error) throw error;
  
          setAllRecipes(allRecipes || []);
        } catch (error) {
          console.error('Error fetching all recipes:', error);
        } finally {
          setLoading(false);
        }
      }
  
      fetchAllRecipes();
    }, []);
  
    return (
      <MobileLayout>
        <div className={styles.container}>
          {/* Full Recipe List Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Full Recipe List:</h2>
            
            {loading ? (
              <p>Loading recipes...</p>
            ) : allRecipes.length > 0 ? (
              <div className={styles.twoColumnGrid}>
                {allRecipes.map((recipe) => (
                  <RecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    cardColor="orange"
                  />
                ))}
              </div>
            ) : (
              <p className={styles.noMatches}>No recipes found...</p>
            )}
          </section>
          </div>
      </MobileLayout>
    );
  }
  
  // Recipe Card Component (reused from the original code)
  interface RecipeCardProps {
    recipe: Recipe;
    cardColor: 'orange' | 'teal';
  }
  
  function RecipeCard({ recipe, cardColor }: RecipeCardProps) {
    const cardClass = cardColor === 'orange' 
      ? styles.orangeCard 
      : styles.tealCard;
  
    // Truncate title if longer than 25 characters
    const truncateTitle = (title: string, maxLength: number = 25) => {
      return title.length > maxLength 
        ? `${title.substring(0, maxLength)}...` 
        : title;
    };
  
    return (
      <div className={`${styles.recipeCard} ${cardClass}`}>
        <div className={styles.recipeImageContainer}>
          {recipe.imageUrl ? (
            <img 
              src={recipe.imageUrl} 
              alt={recipe.name} 
              className={styles.recipeImage}
            />
          ) : (
            <div className={styles.placeholderImage}>
              <div className={styles.mountainIcon}></div>
              <div className={styles.sunIcon}></div>
            </div>
          )}
        </div>
        <div className={styles.recipeInfo}>
          <h3 className={styles.recipeTitle}>
            {truncateTitle(recipe.name)}
          </h3>
        </div>
      </div>
    );
  }